import { Subject, Grade, GradeSubject, Class } from '../models/index.js';

// ============================================================
// 1. GET ALL SUBJECTS / COURSES
// ============================================================
export const getCourses = async (req, res) => {
  try {
    const subjects = await Subject.findAll({
      order: [['code', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (error) {
    console.error('[Get Courses Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching subjects.'
    });
  }
};

export const getSubjects = getCourses;

// ============================================================
// 2. CREATE A NEW SUBJECT / COURSE
// ============================================================
export const createCourse = async (req, res) => {
  try {
    const { code, name, grade, weeklyPeriods, weeklyDuration, requiredVenueType, color } = req.body;

    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: 'Subject code and name are required.'
      });
    }

    const subjectId = req.body.id || `s_${Date.now()}`;
    const rawGrade = grade ? String(grade).replace('Grade ', '').trim() : '10';
    const gNum = parseInt(rawGrade, 10);

    // Find or create matching Grade in MySQL grades table
    let gradeObj = null;
    if (!isNaN(gNum)) {
      let gLevel = gNum >= 11 ? 'Higher Secondary' : gNum >= 9 ? 'High School' : gNum >= 6 ? 'Middle School' : 'Primary School';
      const [gRecord] = await Grade.findOrCreate({
        where: { name: `Grade ${gNum}` },
        defaults: { id: gNum, name: `Grade ${gNum}`, level: gLevel }
      });
      gradeObj = gRecord;
    }

    const newSubject = await Subject.create({
      id: subjectId,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      gradeId: gradeObj ? gradeObj.id : null,
      grade: rawGrade,
      weeklyPeriods: Number(weeklyPeriods) || 6,
      weeklyDuration: weeklyDuration || '06:00',
      requiredVenueType: requiredVenueType || 'normal',
      color: color || '#2563eb'
    });

    // Populate grade_subjects junction table with foreign keys
    if (gradeObj) {
      await GradeSubject.findOrCreate({
        where: { gradeId: gradeObj.id, subjectId: newSubject.id }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data: newSubject
    });
  } catch (error) {
    console.error('[Create Course Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating subject.'
    });
  }
};

export const createSubject = createCourse;

// ============================================================
// 3. UPDATE AN EXISTING SUBJECT / COURSE
// ============================================================
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, grade, weeklyPeriods, weeklyDuration, requiredVenueType, color } = req.body;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.'
      });
    }

    const rawGrade = grade !== undefined ? String(grade).replace('Grade ', '').trim() : subject.grade;
    const gNum = parseInt(rawGrade, 10);
    let gradeObj = null;
    if (!isNaN(gNum)) {
      let gLevel = gNum >= 11 ? 'Higher Secondary' : gNum >= 9 ? 'High School' : gNum >= 6 ? 'Middle School' : 'Primary School';
      const [gRecord] = await Grade.findOrCreate({
        where: { name: `Grade ${gNum}` },
        defaults: { id: gNum, name: `Grade ${gNum}`, level: gLevel }
      });
      gradeObj = gRecord;
    }

    await subject.update({
      code: code ? code.trim().toUpperCase() : subject.code,
      name: name ? name.trim() : subject.name,
      gradeId: gradeObj ? gradeObj.id : subject.gradeId,
      grade: rawGrade,
      weeklyPeriods: weeklyPeriods !== undefined ? Number(weeklyPeriods) : subject.weeklyPeriods,
      weeklyDuration: weeklyDuration !== undefined ? weeklyDuration : subject.weeklyDuration,
      requiredVenueType: requiredVenueType || subject.requiredVenueType,
      color: color || subject.color
    });

    if (gradeObj) {
      await GradeSubject.findOrCreate({
        where: { gradeId: gradeObj.id, subjectId: subject.id }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      data: subject
    });
  } catch (error) {
    console.error('[Update Course Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating subject.'
    });
  }
};

export const updateSubject = updateCourse;

// ============================================================
// 4. DELETE A SUBJECT / COURSE
// ============================================================
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findByPk(id);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found.'
      });
    }

    await subject.destroy();

    return res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Course Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting subject.'
    });
  }
};

export const deleteSubject = deleteCourse;
