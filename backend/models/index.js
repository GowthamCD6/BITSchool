import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';

// ============================================================
// 1. ROLE MODEL
// ============================================================
export const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'roles',
  timestamps: true
});

// ============================================================
// 2. USER MODEL
// ============================================================
export const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  regNo: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Role,
      key: 'id'
    }
  },
  avatarColor: {
    type: DataTypes.STRING(20),
    defaultValue: '#2563eb'
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Define Relationships
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

// ============================================================
// SYNC & SEED DATABASE
// ============================================================
export async function syncDatabase() {
  try {
    // Sync models with MySQL database
    await Role.sync();
    await User.sync();
    console.log('[MySQL] Synced Role and User tables successfully.');

    // Seed "Principal Administrator" role if it does not exist
    let principalRole = await Role.findOne({ where: { name: 'Principal Administrator' } });
    if (!principalRole) {
      principalRole = await Role.create({
        name: 'Principal Administrator',
        description: 'Full institutional administrative access & system authority'
      });
      console.log('[MySQL Seed] Created Role: Principal Administrator');
    }

    // Seed Gowtham (Principal Administrator) User if it does not exist
    const existingGowtham = await User.findOne({ where: { regNo: '7376242IT163' } });
    if (!existingGowtham) {
      const hashedPassword = await bcrypt.hash('1234', 10);
      await User.create({
        id: 'user-gowtham-001',
        name: 'Gowtham',
        regNo: '7376242IT163',
        email: 'gowthamnaveen124@gmail.com',
        password: hashedPassword,
        roleId: principalRole.id,
        avatarColor: '#2563eb'
      });
      console.log('[MySQL Seed] Created Principal Administrator User: Gowtham (Reg: 7376242IT163, Pass: 1234)');
    }

    return true;
  } catch (error) {
    console.error(`[MySQL Sync Error]: ${error.message}`);
    return false;
  }
}
