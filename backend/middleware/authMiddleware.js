import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'bitschool_access_secret_key_2026_super_secure';

/**
 * Middleware: Verify Access Token
 * Extracts Bearer token from Authorization header and attaches authenticated user payload to req.user
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Missing or malformed Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Authentication token missing.'
      });
    }

    // Verify token signature & expiration
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          code: 'TOKEN_EXPIRED',
          message: 'Access Token expired. Please refresh your authentication token.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Access Denied: Invalid authentication token.'
      });
    }

    // Verify user exists in MySQL DB
    const user = await User.findOne({
      where: { id: decoded.id },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access Denied: User account not found or has been removed.'
      });
    }

    // Attach authenticated user payload to request
    req.user = {
      id: user.id,
      name: user.name,
      regNo: user.regNo,
      email: user.email,
      role: user.role ? user.role.name : 'Principal Administrator',
      avatarColor: user.avatarColor || '#2563eb'
    };

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication verification.'
    });
  }
};

/**
 * Middleware: Role-Based Access Control (RBAC)
 * Enforces allowed roles for protected endpoints (e.g. Admin only)
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = String(req.user.role || '').toLowerCase();
    const hasPermission = allowedRoles.some(r => {
      const targetRole = String(r).toLowerCase();
      return userRole.includes(targetRole) || targetRole.includes(userRole);
    });

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${allowedRoles.join(', ')} users.`
      });
    }

    next();
  };
};
