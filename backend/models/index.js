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
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  weeklyPeriods: {
    type: DataTypes.INTEGER,
    defaultValue: 5
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
// 6. CLASS-SUBJECT MAP MODEL
// ============================================================
export const ClassSubject = sequelize.define('ClassSubject', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  classId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: Class,
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
  },
  weeklyPeriods: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  }
}, {
  tableName: 'class_subjects',
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
  day: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  verticalId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  activity: {
    type: DataTypes.STRING(150),
    allowNull: true
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

// Define Relationships
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

Grade.hasMany(Class, { foreignKey: 'gradeId', as: 'classes' });
Class.belongsTo(Grade, { foreignKey: 'gradeId', as: 'grade' });

Class.belongsToMany(Subject, { through: ClassSubject, foreignKey: 'classId', as: 'subjects' });
Subject.belongsToMany(Class, { through: ClassSubject, foreignKey: 'subjectId', as: 'classes' });

Faculty.belongsTo(Subject, { foreignKey: 'primarySubjectId', as: 'primarySubject' });

// ============================================================
// SYNC & SEED DATABASE
// ============================================================
export async function syncDatabase() {
  try {
    // Sync all models in order
    await Role.sync();
    await User.sync();
    await Grade.sync();
    await Class.sync();
    await Subject.sync();
    await ClassSubject.sync();
    await Venue.sync();
    await Faculty.sync();
    await EcaVertical.sync();
    await EcaSchedule.sync();
    console.log('[MySQL] Synced all tables (Role, User, Grade, Class, Subject, ClassSubject, Venue, Faculty, EcaVertical, EcaSchedule) successfully.');

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

    // 2. Seed Grades
    const defaultGrades = [
      { id: 8, name: 'Grade 8', level: 'Middle School' },
      { id: 9, name: 'Grade 9', level: 'High School' },
      { id: 10, name: 'Grade 10', level: 'High School' },
      { id: 11, name: 'Grade 11', level: 'Higher Secondary' },
      { id: 12, name: 'Grade 12', level: 'Higher Secondary' }
    ];

    for (const g of defaultGrades) {
      await Grade.findOrCreate({ where: { name: g.name }, defaults: g });
    }

    // 3. Seed Classes
    const defaultClasses = [
      { id: 'c1', name: 'Grade 8-A', gradeId: 8, gradeName: '8', section: 'A', studentCount: 36, homeVenueId: 'v1' },
      { id: 'c2', name: 'Grade 9-A', gradeId: 9, gradeName: '9', section: 'A', studentCount: 40, homeVenueId: 'v2' },
      { id: 'c3', name: 'Grade 9-B', gradeId: 9, gradeName: '9', section: 'B', studentCount: 38, homeVenueId: 'v3' },
      { id: 'c4', name: 'Grade 10-A', gradeId: 10, gradeName: '10', section: 'A', studentCount: 42, homeVenueId: 'v4' },
      { id: 'c5', name: 'Grade 10-B', gradeId: 10, gradeName: '10', section: 'B', studentCount: 41, homeVenueId: 'v5' },
      { id: 'c6', name: 'Grade 11-A', gradeId: 11, gradeName: '11', section: 'A', studentCount: 35, homeVenueId: 'v6' }
    ];

    for (const c of defaultClasses) {
      await Class.findOrCreate({ where: { id: c.id }, defaults: c });
    }

    // 4. Seed Subjects
    const defaultSubjects = [
      { id: 's1', code: 'MATH101', name: 'Mathematics', weeklyPeriods: 8, requiredVenueType: 'projector', color: '#4f46e5' },
      { id: 's2', code: 'ENG101', name: 'English Literature', weeklyPeriods: 6, requiredVenueType: 'normal', color: '#2563eb' },
      { id: 's3', code: 'PHY101', name: 'Physics', weeklyPeriods: 5, requiredVenueType: 'projector', color: '#7c3aed' },
      { id: 's4', code: 'CHEM101', name: 'Chemistry', weeklyPeriods: 5, requiredVenueType: 'science_lab', color: '#059669' },
      { id: 's5', code: 'CS101', name: 'Computer Science', weeklyPeriods: 6, requiredVenueType: 'computer_lab', color: '#0891b2' },
      { id: 's6', code: 'BIO101', name: 'Biology', weeklyPeriods: 4, requiredVenueType: 'science_lab', color: '#16a34a' },
      { id: 's7', code: 'HIST101', name: 'History & Civics', weeklyPeriods: 4, requiredVenueType: 'normal', color: '#d97706' },
      { id: 's8', code: 'GEO101', name: 'Geography', weeklyPeriods: 4, requiredVenueType: 'projector', color: '#ca8a04' },
      { id: 's9', code: 'PE101', name: 'Physical Education', weeklyPeriods: 3, requiredVenueType: 'normal', color: '#dc2626' },
      { id: 's10', code: 'ART101', name: 'Art & Craft', weeklyPeriods: 3, requiredVenueType: 'normal', color: '#db2777' }
    ];

    for (const s of defaultSubjects) {
      await Subject.findOrCreate({ where: { id: s.id }, defaults: s });
    }

    // 5. Seed Venues
    const defaultVenues = [
      { id: 'v1', roomNo: 'Room 101', name: 'Grade 8-A Classroom', type: 'normal', capacity: 40, building: 'Main Block', floor: '1st Floor', status: 'Available' },
      { id: 'v2', roomNo: 'Room 102', name: 'Smart Classroom 102', type: 'projector', capacity: 45, building: 'Main Block', floor: '1st Floor', status: 'Available' },
      { id: 'v3', roomNo: 'Room 103', name: 'Grade 9-B Classroom', type: 'normal', capacity: 40, building: 'Main Block', floor: '1st Floor', status: 'Available' },
      { id: 'v4', roomNo: 'Room 201', name: 'Smart Classroom 201', type: 'projector', capacity: 45, building: 'Science Wing', floor: '2nd Floor', status: 'Available' },
      { id: 'v5', roomNo: 'Room 202', name: 'Grade 10-B Classroom', type: 'normal', capacity: 42, building: 'Science Wing', floor: '2nd Floor', status: 'Available' },
      { id: 'v6', roomNo: 'Room 301', name: 'Smart Classroom 301', type: 'projector', capacity: 40, building: 'Senior Block', floor: '3rd Floor', status: 'Available' },
      { id: 'v7', roomNo: 'Lab A', name: 'Advanced Computer Lab', type: 'computer_lab', capacity: 50, building: 'Tech Wing', floor: '2nd Floor', status: 'Available' },
      { id: 'v8', roomNo: 'Lab B', name: 'Central Science Lab', type: 'science_lab', capacity: 45, building: 'Science Wing', floor: '1st Floor', status: 'Available' },
      { id: 'v9', roomNo: 'Audi-1', name: 'Main Auditorium', type: 'auditorium', capacity: 250, building: 'Activity Center', floor: 'Ground Floor', status: 'Available' }
    ];

    for (const v of defaultVenues) {
      await Venue.findOrCreate({ where: { id: v.id }, defaults: v });
    }

    // 6. Seed Faculties
    const defaultFaculties = [
      { id: 'f1', empId: 'FAC-001', name: 'Dr. Rajesh Sharma', email: 'rajesh.sharma@bitschool.edu', phone: '+91 98765 43210', primarySubjectId: 's1', secondarySubjectIds: ['s3'], grades: ['Grade 8-A', 'Grade 9-A', 'Grade 10-A'], maxPeriodsPerDay: 5, maxPeriodsPerWeek: 25, status: 'Active', avatarColor: '#4f46e5' },
      { id: 'f2', empId: 'FAC-002', name: 'Prof. Ananya Sen', email: 'ananya.sen@bitschool.edu', phone: '+91 98765 43211', primarySubjectId: 's2', secondarySubjectIds: ['s7'], grades: ['Grade 8-A', 'Grade 9-B', 'Grade 10-B'], maxPeriodsPerDay: 5, maxPeriodsPerWeek: 25, status: 'Active', avatarColor: '#2563eb' },
      { id: 'f3', empId: 'FAC-003', name: 'Mr. Vikramaditya Rao', email: 'vikram.rao@bitschool.edu', phone: '+91 98765 43212', primarySubjectId: 's3', secondarySubjectIds: ['s1'], grades: ['Grade 9-A', 'Grade 10-A', 'Grade 11-A'], maxPeriodsPerDay: 5, maxPeriodsPerWeek: 24, status: 'Active', avatarColor: '#7c3aed' },
      { id: 'f4', empId: 'FAC-004', name: 'Dr. Meera Nambiar', email: 'meera.nambiar@bitschool.edu', phone: '+91 98765 43213', primarySubjectId: 's4', secondarySubjectIds: ['s6'], grades: ['Grade 9-A', 'Grade 10-A', 'Grade 11-A'], maxPeriodsPerDay: 5, maxPeriodsPerWeek: 22, status: 'Active', avatarColor: '#059669' },
      { id: 'f5', empId: 'FAC-005', name: 'Mr. Suresh Kumar', email: 'suresh.kumar@bitschool.edu', phone: '+91 98765 43214', primarySubjectId: 's5', secondarySubjectIds: ['s1'], grades: ['Grade 9-B', 'Grade 10-B', 'Grade 11-A'], maxPeriodsPerDay: 5, maxPeriodsPerWeek: 25, status: 'Active', avatarColor: '#0891b2' },
      { id: 'f6', empId: 'FAC-006', name: 'Dr. Sunita Patel', email: 'sunita.patel@bitschool.edu', phone: '+91 98765 43215', primarySubjectId: 's6', secondarySubjectIds: ['s4'], grades: ['Grade 8-A', 'Grade 9-B', 'Grade 10-B'], maxPeriodsPerDay: 4, maxPeriodsPerWeek: 20, status: 'Active', avatarColor: '#16a34a' }
    ];

    for (const f of defaultFaculties) {
      await Faculty.findOrCreate({ where: { id: f.id }, defaults: f });
    }

    // 7. Seed ECA Verticals
    const defaultEcaVerticals = [
      { id: 'eca_v1', name: 'Football Club', category: 'Sports & Athletics', color: '#059669' },
      { id: 'eca_v2', name: 'Robotics & STEM Club', category: 'Technology', color: '#2563eb' },
      { id: 'eca_v3', name: 'Music & Choir', category: 'Performing Arts', color: '#7c3aed' },
      { id: 'eca_v4', name: 'Debate & Literary Society', category: 'Academics & Skill', color: '#d97706' },
      { id: 'eca_v5', name: 'Environmental Science Club', category: 'Social & Environment', color: '#16a34a' }
    ];

    for (const v of defaultEcaVerticals) {
      await EcaVertical.findOrCreate({ where: { id: v.id }, defaults: v });
    }

    console.log('[MySQL Seed] Synced and populated all database tables.');
    return true;
  } catch (error) {
    console.error(`[MySQL Sync Error]: ${error.message}`);
    return false;
  }
}
