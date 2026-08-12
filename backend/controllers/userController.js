import bcrypt from 'bcryptjs';
import { User, Role } from '../models/index.js';

// ── GET ALL USERS ──
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    const formatted = users.map(u => ({
      id: u.id,
      name: u.name,
      regNo: u.regNo,
      email: u.email,
      role: u.role ? u.role.name : 'User',
      roleId: u.roleId,
      avatarColor: u.avatarColor || '#2563eb',
      createdAt: u.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    console.error('[User Controller Get Users Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch users.'
    });
  }
};

// ── CREATE NEW USER ──
export const createUser = async (req, res) => {
  try {
    const { name, regNo, email, password, role = 'Faculty', avatarColor = '#2563eb' } = req.body;

    if (!name || !regNo || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, Registration Number / ID, Email, and Password are required.'
      });
    }

    const cleanRegNo = String(regNo).trim();
    const cleanEmail = String(email).trim().toLowerCase();

    // Check duplicate regNo or email
    const existingRegNo = await User.findOne({ where: { regNo: cleanRegNo } });
    if (existingRegNo) {
      return res.status(400).json({
        success: false,
        message: `Registration Number / ID "${cleanRegNo}" is already in use.`
      });
    }

    const existingEmail = await User.findOne({ where: { email: cleanEmail } });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email address "${cleanEmail}" is already registered.`
      });
    }

    // Find or create Role
    let roleRecord = await Role.findOne({ where: { name: role } });
    if (!roleRecord) {
      roleRecord = await Role.create({
        name: role,
        description: `${role} system user role`
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const newUser = await User.create({
      id: userId,
      name: String(name).trim(),
      regNo: cleanRegNo,
      email: cleanEmail,
      password: hashedPassword,
      roleId: roleRecord.id,
      avatarColor
    });

    return res.status(201).json({
      success: true,
      message: `User "${newUser.name}" created successfully.`,
      data: {
        id: newUser.id,
        name: newUser.name,
        regNo: newUser.regNo,
        email: newUser.email,
        role: roleRecord.name,
        roleId: roleRecord.id,
        avatarColor: newUser.avatarColor,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error('[User Controller Create Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create user.'
    });
  }
};

// ── UPDATE USER ──
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, regNo, email, password, role, avatarColor } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (name) user.name = String(name).trim();
    if (regNo) user.regNo = String(regNo).trim();
    if (email) user.email = String(email).trim().toLowerCase();
    if (avatarColor) user.avatarColor = avatarColor;

    if (password && String(password).trim().length > 0) {
      user.password = await bcrypt.hash(String(password).trim(), 10);
    }

    if (role) {
      let roleRecord = await Role.findOne({ where: { name: role } });
      if (!roleRecord) {
        roleRecord = await Role.create({ name: role });
      }
      user.roleId = roleRecord.id;
    }

    await user.save();

    const updatedUser = await User.findByPk(id, {
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }]
    });

    return res.status(200).json({
      success: true,
      message: `User details updated for "${updatedUser.name}".`,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        regNo: updatedUser.regNo,
        email: updatedUser.email,
        role: updatedUser.role ? updatedUser.role.name : 'User',
        avatarColor: updatedUser.avatarColor,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    console.error('[User Controller Update Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user.'
    });
  }
};

// ── DELETE USER ──
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const userName = user.name;
    await user.destroy();

    return res.status(200).json({
      success: true,
      message: `User "${userName}" has been deleted.`
    });
  } catch (error) {
    console.error('[User Controller Delete Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user.'
    });
  }
};
