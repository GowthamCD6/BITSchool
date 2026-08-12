import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Role } from '../models/index.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'bitschool_access_secret_key_2026_super_secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'bitschool_refresh_secret_key_2026_super_secure';

const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Helper: Generate Access Token (15m)
const generateAccessToken = (userData) => {
  return jwt.sign(userData, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
};

// Helper: Generate Refresh Token (7d)
const generateRefreshToken = (userData) => {
  return jwt.sign({ id: userData.id, regNo: userData.regNo }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

// ============================================================
// 1. REGISTRATION NUMBER / PASSWORD LOGIN (AUTHENTICATE FROM DB)
// ============================================================
export const loginUser = async (req, res) => {
  try {
    const { regNo, password } = req.body;

    if (!regNo || !password) {
      return res.status(400).json({
        success: false,
        message: 'Registration Number and Password are required.'
      });
    }

    // 🔍 Query MySQL User Table by Registration Number
    const user = await User.findOne({
      where: { regNo: String(regNo).trim() },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid registration number or password.'
      });
    }

    // 🔒 Verify Hashed Password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid registration number or password.'
      });
    }

    // 🔑 Construct Authenticated User Payload
    const userData = {
      id: user.id,
      name: user.name,
      regNo: user.regNo,
      email: user.email,
      role: user.role ? user.role.name : 'Principal Administrator',
      avatarColor: user.avatarColor || '#2563eb'
    };

    // Generate Dual Tokens
    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    // Store Refresh Token in MySQL DB
    await user.update({ refreshToken });

    return res.status(200).json({
      success: true,
      message: 'Login successful via MySQL Database.',
      accessToken,
      refreshToken,
      token: accessToken, // Backward compatibility
      user: userData
    });
  } catch (error) {
    console.error('[Auth Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during authentication.'
    });
  }
};

// ============================================================
// 2. GOOGLE OAUTH LOGIN (STRICT DATABASE EMAIL CHECK)
// ============================================================
export const googleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid Google account email is required.'
      });
    }

    const targetEmail = email.trim().toLowerCase();

    // 🔍 Query MySQL User Table by Email
    const user = await User.findOne({
      where: { email: targetEmail },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: The Google account (${targetEmail}) is not registered in the system.`
      });
    }

    const userData = {
      id: user.id,
      name: user.name,
      regNo: user.regNo,
      email: user.email,
      role: user.role ? user.role.name : 'Principal Administrator',
      avatarColor: user.avatarColor || '#2563eb'
    };

    const accessToken = generateAccessToken(userData);
    const refreshToken = generateRefreshToken(userData);

    await user.update({ refreshToken });

    return res.status(200).json({
      success: true,
      message: 'Google Authentication Successful via MySQL.',
      accessToken,
      refreshToken,
      token: accessToken,
      user: userData
    });
  } catch (error) {
    console.error('[Google Auth Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during Google Authentication.'
    });
  }
};

// ============================================================
// 3. REFRESH ACCESS TOKEN
// ============================================================
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: incomingToken } = req.body;

    if (!incomingToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh Token is required.'
      });
    }

    // Verify Refresh Token signature
    let decoded;
    try {
      decoded = jwt.verify(incomingToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Refresh Token. Please log in again.'
      });
    }

    // Verify User & DB Token Match
    const user = await User.findOne({
      where: { id: decoded.id },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
    });

    if (!user || user.refreshToken !== incomingToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh Token revoked or invalid.'
      });
    }

    const userData = {
      id: user.id,
      name: user.name,
      regNo: user.regNo,
      email: user.email,
      role: user.role ? user.role.name : 'Principal Administrator',
      avatarColor: user.avatarColor || '#2563eb'
    };

    // Issue new tokens (Token Rotation)
    const newAccessToken = generateAccessToken(userData);
    const newRefreshToken = generateRefreshToken(userData);

    await user.update({ refreshToken: newRefreshToken });

    return res.status(200).json({
      success: true,
      message: 'Access Token refreshed successfully.',
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      token: newAccessToken
    });
  } catch (error) {
    console.error('[Refresh Token Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during token refresh.'
    });
  }
};

// ============================================================
// 4. LOGOUT USER (REVOKE REFRESH TOKEN)
// ============================================================
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (userId) {
      await User.update({ refreshToken: null }, { where: { id: userId } });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully. Refresh Token revoked.'
    });
  } catch (error) {
    console.error('[Logout Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

// ============================================================
// 5. GET LOGGED IN USER DETAILS
// ============================================================
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized.'
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user details.'
    });
  }
};
