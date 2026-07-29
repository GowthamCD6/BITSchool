import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import {
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_VENUES,
  INITIAL_ECA_VERTICALS,
  INITIAL_ECA_SCHEDULE
} from '../utils/initialData.js';

import bcrypt from 'bcryptjs';

export const User = sequelize.define('User', {
  id: { type: DataTypes.STRING, primaryKey: true, defaultValue: 'admin-001' },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'Principal Administrator' },
  workspace: { type: DataTypes.STRING, defaultValue: 'Executive Administration' },
  avatarColor: { type: DataTypes.STRING, defaultValue: '#2563eb' },
  googleId: { type: DataTypes.STRING, allowNull: true }
}, { timestamps: true });

export const ClassModel = sequelize.define('Class', {
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  grade: { type: DataTypes.STRING, allowNull: false },
  section: { type: DataTypes.STRING, allowNull: false },
  studentCount: { type: DataTypes.INTEGER, defaultValue: 35 },
  homeVenueId: { type: DataTypes.STRING, allowNull: true }
}, { timestamps: true });

export const SubjectModel = sequelize.define('Subject', {
  id: { type: DataTypes.STRING, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  weeklyPeriods: { type: DataTypes.INTEGER, defaultValue: 5 },
  requiredVenueType: { type: DataTypes.STRING, defaultValue: 'normal' },
  color: { type: DataTypes.STRING, defaultValue: '#2563eb' },
  grade: { type: DataTypes.STRING, defaultValue: 'all' }
}, { timestamps: true });

export const VenueModel = sequelize.define('Venue', {
  id: { type: DataTypes.STRING, primaryKey: true },
  roomNo: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'normal' },
  capacity: { type: DataTypes.INTEGER, defaultValue: 40 },
  building: { type: DataTypes.STRING, defaultValue: 'Main Block' },
  floor: { type: DataTypes.STRING, defaultValue: '1st Floor' },
  status: { type: DataTypes.STRING, defaultValue: 'Available' }
}, { timestamps: true });

export const EcaVertical = sequelize.define('EcaVertical', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true }
}, { timestamps: true });

export const EcaScheduleSlot = sequelize.define('EcaScheduleSlot', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  day: { type: DataTypes.STRING, allowNull: false },
  verticalName: { type: DataTypes.STRING, allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: false },
  label: { type: DataTypes.STRING, defaultValue: 'No' },
  duration: { type: DataTypes.STRING, defaultValue: '30 mins' },
  target: { type: DataTypes.STRING, defaultValue: 'All' },
  color: { type: DataTypes.STRING, defaultValue: '#059669' }
}, { timestamps: true });

export const TimetableSlot = sequelize.define('TimetableSlot', {
  id: { type: DataTypes.STRING, primaryKey: true },
  weekKey: { type: DataTypes.STRING, allowNull: false },
  classId: { type: DataTypes.STRING, allowNull: false },
  day: { type: DataTypes.STRING, allowNull: false },
  period: { type: DataTypes.INTEGER, allowNull: false },
  subjectId: { type: DataTypes.STRING, allowNull: false },
  facultyId: { type: DataTypes.STRING, allowNull: false },
  venueId: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

export async function syncDatabase() {
  try {
    await sequelize.sync({ alter: true });
    console.log('[MySQL Models] Synced database schema tables successfully.');

    // Seed Principal Admin User if empty or missing password
    const adminUser = await User.findOne({ where: { email: 'admin@bitschool.edu' } });
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      await User.create({
        id: 'admin-001',
        name: 'Dr. Robert Vance',
        email: 'admin@bitschool.edu',
        password: hashedPassword,
        role: 'Principal Administrator',
        workspace: 'Executive Administration',
        avatarColor: '#2563eb'
      });
      console.log('[MySQL Seed] Created Principal Administrator (admin@bitschool.edu)');
    }


    // Seed Venues if empty
    const venueCount = await VenueModel.count();
    if (venueCount === 0) {
      await VenueModel.bulkCreate(INITIAL_VENUES);
    }

    // Seed Classes if empty
    const classCount = await ClassModel.count();
    if (classCount === 0) {
      await ClassModel.bulkCreate(INITIAL_CLASSES);
    }

    // Seed Subjects if empty
    const subjectCount = await SubjectModel.count();
    if (subjectCount === 0) {
      await SubjectModel.bulkCreate(INITIAL_SUBJECTS);
    }

    // Seed ECA Verticals if empty
    const verticalCount = await EcaVertical.count();
    if (verticalCount === 0) {
      await EcaVertical.bulkCreate(INITIAL_ECA_VERTICALS.map(name => ({ name })));
    }

    console.log('[MySQL Seed] Initial database data checked and ready.');
    return true;
  } catch (error) {
    console.warn(`[MySQL Sync Warning]: ${error.message}`);
    return false;
  }
}
