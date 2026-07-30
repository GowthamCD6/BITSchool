import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, Role } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bitschool_secret_key_2026_super_secure';

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

    // 🔑 Construct Authenticated User Payload from Database
    const userData = {
      id: user.id,
      name: user.name,
      regNo: user.regNo,
      email: user.email,
      role: user.role ? user.role.name : 'Principal Administrator',
      avatarColor: user.avatarColor || '#2563eb'
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Login successful via MySQL Database.',
      token,
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

    // 🔍 Query MySQL User Table by Email (Strict check: only allowed if email exists in database!)
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

    // 🔑 Construct Authenticated User Payload from Database
    const userData = {
      id: user.id,
      name: user.name,
      regNo: user.regNo,
      email: user.email,
      role: user.role ? user.role.name : 'Principal Administrator',
      avatarColor: user.avatarColor || '#2563eb'
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      success: true,
      message: 'Google Authentication Successful via MySQL.',
      token,
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
// 3. GET LOGGED IN USER DETAILS
// ============================================================
export const getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing or invalid.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify user exists in database
    const dbUser = await User.findOne({
      where: { id: decoded.id },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
    });

    if (!dbUser) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        regNo: dbUser.regNo,
        email: dbUser.email,
        role: dbUser.role ? dbUser.role.name : 'Principal Administrator',
        avatarColor: dbUser.avatarColor
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};
