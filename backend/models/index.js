import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import { syncTimeSlotsFromBellConfig } from '../controllers/timeSlotController.js';
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
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

// ============================================================
// 3. GRADE MODEL (Grades & Academic Levels)
// ============================================================
export const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  level: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'High School'
  }
}, {
  tableName: 'grades',
  timestamps: true
});

// ============================================================
// 4. CLASS MODEL (Class Sections)
// ============================================================
export const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gradeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Grade,
      key: 'id'
    }
  },
  gradeName: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  section: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  studentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 35
  },
  homeVenueId: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'classes',
  timestamps: true
});

// ============================================================
// 5. SUBJECT MODEL (Academic Courses & Subjects)
// ============================================================
export const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gradeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'grades',
      key: 'id'
    }
  },
  grade: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: 'all'
  },
  weeklyPeriods: {
    type: DataTypes.INTEGER,
    defaultValue: 6
  },
  weeklyDuration: {
    type: DataTypes.STRING(20),
    defaultValue: '06:00'
  },
  requiredVenueType: {
    type: DataTypes.STRING(50),
    defaultValue: 'normal'
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#2563eb'
  }
}, {
  tableName: 'subjects',
  timestamps: true
});

// ============================================================
// 5B. GRADE-SUBJECT MAP MODEL (grade_subjects Table)
// ============================================================
export const GradeSubject = sequelize.define('GradeSubject', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  gradeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Grade,
      key: 'id'
    }
  },
  subjectId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: Subject,
      key: 'id'
    }
  }
}, {
  tableName: 'grade_subjects',
  timestamps: true
});

// ============================================================
// 7. VENUE MODEL (Classrooms, Labs & Auditoriums)
// ============================================================
export const Venue = sequelize.define('Venue', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  roomNo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    defaultValue: 'normal'
  },
  capacity: {
    type: DataTypes.INTEGER,
    defaultValue: 40
  },
  building: {
    type: DataTypes.STRING(100),
    defaultValue: 'Main Block'
  },
  floor: {
    type: DataTypes.STRING(50),
    defaultValue: '1st Floor'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Available'
  }
}, {
  tableName: 'venues',
  timestamps: true
});

// ============================================================
// 8. FACULTY MODEL (Teaching Staff & Faculty)
// ============================================================
export const Faculty = sequelize.define('Faculty', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  empId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  primarySubjectId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  secondarySubjectIds: {
    type: DataTypes.JSON,
    allowNull: true
  },
  grades: {
    type: DataTypes.JSON,
    allowNull: true
  },
  maxPeriodsPerDay: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  maxPeriodsPerWeek: {
    type: DataTypes.INTEGER,
    defaultValue: 25
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Active'
  },
  avatarColor: {
    type: DataTypes.STRING(20),
    defaultValue: '#4f46e5'
  }
}, {
  tableName: 'faculties',
  timestamps: true
});

// ============================================================
// 9. ECA VERTICAL MODEL (Extra-Curricular Activities)
// ============================================================
export const EcaVertical = sequelize.define('EcaVertical', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    defaultValue: 'Sports'
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#2563eb'
  }
}, {
  tableName: 'eca_verticals',
  timestamps: true
});

// ============================================================
// 10. ECA SCHEDULE MODEL
// ============================================================
export const EcaSchedule = sequelize.define('EcaSchedule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  gradeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'grades',
      key: 'id'
    }
  },
  grade: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '4'
  },
  day: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  verticalId: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  activity: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: ''
  },
  startTime: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: ''
  },
  endTime: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: ''
  },
  periodTime: {
    type: DataTypes.STRING(60),
    allowNull: true,
    defaultValue: ''
  },
  target: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'All'
  },
  color: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#059669'
  },
  facultyInCharge: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  venue: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'eca_schedules',
  timestamps: true
});

// ============================================================
// 11. GRADE-ECA VERTICAL MAP MODEL (grade_eca_verticals Table)
// ============================================================
export const GradeEcaVertical = sequelize.define('GradeEcaVertical', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  gradeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Grade,
      key: 'id'
    }
  },
  ecaVerticalId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: EcaVertical,
      key: 'id'
    }
  }
}, {
  tableName: 'grade_eca_verticals',
  timestamps: true
});

// ============================================================
// 12. TIME SLOT MODEL (time_slots Table for Periods & Breaks)
// ============================================================
export const TimeSlot = sequelize.define('TimeSlot', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  slotNo: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  startTime: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  endTime: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    defaultValue: 'period' // 'period' | 'break' | 'lunch' | 'assembly'
  },
  color: {
    type: DataTypes.STRING(20),
    defaultValue: '#2563eb'
  }
}, {
  tableName: 'time_slots',
  timestamps: true
});

// ============================================================
// 13. BELL SCHEDULE CONFIG MODEL (Key timings: start, break, lunch, end)
// ============================================================
export const BellScheduleConfig = sequelize.define('BellScheduleConfig', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  schoolStartTime: {
    type: DataTypes.STRING(20),
    defaultValue: '08:30 AM'
  },
  morningBreakStart: {
    type: DataTypes.STRING(20),
    defaultValue: '10:00 AM'
  },
  morningBreakEnd: {
    type: DataTypes.STRING(20),
    defaultValue: '10:15 AM'
  },
  lunchBreakStart: {
    type: DataTypes.STRING(20),
    defaultValue: '11:45 AM'
  },
  lunchBreakEnd: {
    type: DataTypes.STRING(20),
    defaultValue: '12:30 PM'
  },
  afternoonBreakStart: {
    type: DataTypes.STRING(20),
    defaultValue: '02:00 PM'
  },
  afternoonBreakEnd: {
    type: DataTypes.STRING(20),
    defaultValue: '02:15 PM'
  },
  schoolEndTime: {
    type: DataTypes.STRING(20),
    defaultValue: '03:45 PM'
  }
}, {
  tableName: 'bell_schedule_configs',
  timestamps: true
});

// ============================================================
// 14. TIMETABLE SLOT MODEL (timetable_slots Table)
// ============================================================
export const TimetableSlot = sequelize.define('TimetableSlot', {
  id: {
    type: DataTypes.STRING(100),
    primaryKey: true
  },
  classId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  className: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  day: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  periodName: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  periodTime: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  startTime: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  endTime: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  durationMins: {
    type: DataTypes.INTEGER,
    defaultValue: 45
  },
  subjectId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  subjectName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  subjectCode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  subjectColor: {
    type: DataTypes.STRING(50),
    defaultValue: '#2563eb'
  },
  facultyId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  facultyName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  venueId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  venueName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  venueRoomNo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  venueType: {
    type: DataTypes.STRING(50),
    defaultValue: 'normal'
  },
  isConflict: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  conflictReason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  ecaTag: {
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'timetable_slots',
  timestamps: true
});

// Define Relationships
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Grade.hasMany(Class, { foreignKey: 'gradeId', as: 'classes' });
Class.belongsTo(Grade, { foreignKey: 'gradeId', as: 'grade' });

Grade.hasMany(Subject, { foreignKey: 'gradeId', as: 'subjects', onDelete: 'CASCADE' });
Subject.belongsTo(Grade, { foreignKey: 'gradeId', as: 'gradeRecord' });

Grade.belongsToMany(Subject, { through: GradeSubject, foreignKey: 'gradeId', as: 'gradeCourses' });
Subject.belongsToMany(Grade, { through: GradeSubject, foreignKey: 'subjectId', as: 'grades' });

Grade.hasMany(EcaSchedule, { foreignKey: 'gradeId', as: 'ecaSchedules', onDelete: 'CASCADE' });
EcaSchedule.belongsTo(Grade, { foreignKey: 'gradeId', as: 'gradeRecord' });

Grade.belongsToMany(EcaVertical, { through: GradeEcaVertical, foreignKey: 'gradeId', as: 'gradeEcaVerticals' });
EcaVertical.belongsToMany(Grade, { through: GradeEcaVertical, foreignKey: 'ecaVerticalId', as: 'grades' });

Faculty.belongsTo(Subject, { foreignKey: 'primarySubjectId', as: 'primarySubject' });

// ============================================================
// SYNC & SEED DATABASE
// ============================================================
export async function syncDatabase() {
  try {
    // Permanently drop legacy class_subjects table if present in MySQL
    await sequelize.query('DROP TABLE IF EXISTS class_subjects;');

    // Ensure refreshToken column exists in users table
    try {
      await sequelize.query("ALTER TABLE users ADD COLUMN refreshToken TEXT NULL;");
      console.log('[MySQL] Added refreshToken column to users table successfully.');
    } catch (e) {}

    // Sync active models in order
    await Role.sync();
    await User.sync();
    await Grade.sync();
    await Class.sync();
    await Subject.sync({ alter: true });

    // Explicitly add weeklyDuration column if not present in subjects table
    try {
      await sequelize.query("ALTER TABLE subjects ADD COLUMN weeklyDuration VARCHAR(20) DEFAULT '06:00';");
      console.log('[MySQL] Added weeklyDuration column to subjects table successfully.');
    } catch (e) {
      console.log('[MySQL] weeklyDuration column status:', e.message);
    }

    try {
      await sequelize.query("ALTER TABLE eca_schedules ADD COLUMN grade VARCHAR(20) DEFAULT '4';");
    } catch (e) {}

    try {
      await sequelize.query("ALTER TABLE eca_schedules ADD COLUMN startTime VARCHAR(30) DEFAULT '';");
    } catch (e) {}

    try {
      await sequelize.query("ALTER TABLE eca_schedules ADD COLUMN endTime VARCHAR(30) DEFAULT '';");
    } catch (e) {}

    try {
      await sequelize.query("ALTER TABLE eca_schedules ADD COLUMN periodTime VARCHAR(60) DEFAULT '';");
    } catch (e) {}

    await GradeSubject.sync();
    await Venue.sync();
    await Faculty.sync();
    await EcaVertical.sync();
    await EcaSchedule.sync({ alter: true });
    await GradeEcaVertical.sync();
    await TimeSlot.sync();
    await BellScheduleConfig.sync();
    await TimetableSlot.sync({ alter: true });

    // Seed / Sync bell config and auto-generate time_slots table with 12-hour AM/PM format
    let bellConfig = await BellScheduleConfig.findOne();
    if (!bellConfig) {
      bellConfig = await BellScheduleConfig.create({
        schoolStartTime: '08:30 AM',
        morningBreakStart: '10:00 AM',
        morningBreakEnd: '10:15 AM',
        lunchBreakStart: '11:45 AM',
        lunchBreakEnd: '12:30 PM',
        afternoonBreakStart: '02:00 PM',
        afternoonBreakEnd: '02:15 PM',
        schoolEndTime: '03:45 PM'
      });
      console.log('[MySQL Seed] Initialized default Bell Schedule Timing Parameters.');
    }

    // Always auto-generate 12-hour AM/PM time_slots from bellConfig
    await syncTimeSlotsFromBellConfig(bellConfig);

    console.log('[MySQL] Synced all tables (Role, User, Grade, Class, Subject, GradeSubject, Venue, Faculty, EcaVertical, EcaSchedule, GradeEcaVertical, TimeSlot) successfully.');

    // 1. Seed Roles & Gowtham User
    let principalRole = await Role.findOne({ where: { name: 'Principal Administrator' } });
    if (!principalRole) {
      principalRole = await Role.create({
        name: 'Principal Administrator',
        description: 'Full institutional administrative access & system authority'
      });
    }

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
      console.log('[MySQL Seed] Created Gowtham user.');
    }

    console.log('[MySQL Seed] System roles & administrator account ready.');
    return true;
  } catch (error) {
    console.error(`[MySQL Sync Error]: ${error.message}`);
    return false;
  }
}
