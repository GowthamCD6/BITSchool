import { Class, Grade, Subject } from '../models/index.js';
import { Op } from 'sequelize';

// ============================================================
// 1. GET ALL CLASSES (WITH GRADE RELATIONS)
// ============================================================
export const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll({
      include: [
        { model: Grade, as: 'grade', attributes: ['id', 'name', 'level'] }
      ],
      order: [['gradeName', 'ASC'], ['section', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    console.error('[Get Classes Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching classes.'
    });
  }
};

// ============================================================
// 2. CREATE A NEW CLASS SECTION
// ============================================================
export const createClass = async (req, res) => {
  try {
    const { name, grade, gradeName, section, studentCount, homeVenueId } = req.body;

    if (!name || !section) {
      return res.status(400).json({
        success: false,
        message: 'Class name and section are required.'
      });
    }

    const rawGrade = grade || gradeName || name.replace(/[^0-9]/g, '') || '10';
    const gNum = parseInt(String(rawGrade).replace(/\D/g, ''), 10);
    const gName = isNaN(gNum) ? rawGrade : String(gNum);
    const fullGradeName = `Grade ${gName}`;
    const classId = req.body.id || `c_${Date.now()}`;

    // Find or create matching Grade record in MySQL 'grades' table
    let gradeObj = await Grade.findOne({
      where: {
        [Op.or]: [
          { name: fullGradeName },
          { id: isNaN(gNum) ? -1 : gNum }
        ]
      }
    });

    if (!gradeObj) {
      let gLevel = 'High School';
      if (!isNaN(gNum)) {
        if (gNum >= 11) gLevel = 'Higher Secondary';
        else if (gNum >= 9) gLevel = 'High School';
        else if (gNum >= 6) gLevel = 'Middle School';
        else gLevel = 'Primary School';
      }
      gradeObj = await Grade.create({
        id: isNaN(gNum) ? undefined : gNum,
        name: fullGradeName,
        level: gLevel
      });
    }

    const newClass = await Class.create({
      id: classId,
      name,
      gradeId: gradeObj ? gradeObj.id : null,
      gradeName: gName,
      section: section.toUpperCase(),
      studentCount: studentCount || 35,
      homeVenueId: homeVenueId || null
    });

    const createdClass = await Class.findByPk(newClass.id, {
      include: [
        { model: Grade, as: 'grade' }
      ]
    });

    return res.status(201).json({
      success: true,
      message: 'Class section created successfully.',
      data: createdClass
    });
  } catch (error) {
    console.error('[Create Class Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating class.'
    });
  }
};

// ============================================================
// 3. UPDATE AN EXISTING CLASS SECTION
// ============================================================
export const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gradeName, section, studentCount, homeVenueId } = req.body;

    const classRecord = await Class.findByPk(id);
    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: 'Class section not found.'
      });
    }

    await classRecord.update({
      name: name || classRecord.name,
      gradeName: gradeName || classRecord.gradeName,
      section: section ? section.toUpperCase() : classRecord.section,
      studentCount: studentCount !== undefined ? studentCount : classRecord.studentCount,
      homeVenueId: homeVenueId !== undefined ? homeVenueId : classRecord.homeVenueId
    });

    return res.status(200).json({
      success: true,
      message: 'Class section updated successfully.',
      data: classRecord
    });
  } catch (error) {
    console.error('[Update Class Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while updating class.'
    });
  }
};

// ============================================================
// 4. DELETE A CLASS SECTION
// ============================================================
export const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classRecord = await Class.findByPk(id);
    if (!classRecord) {
      return res.status(404).json({
        success: false,
        message: 'Class section not found.'
      });
    }

    await classRecord.destroy();

    return res.status(200).json({
      success: true,
      message: 'Class section deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Class Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while deleting class.'
    });
  }
};

// ============================================================
// 5. GET ALL GRADES
// ============================================================
export const getGrades = async (req, res) => {
  try {
    const grades = await Grade.findAll({
      include: [{ model: Class, as: 'classes' }],
      order: [['id', 'ASC']]
    });

    return res.status(200).json({
      success: true,
      count: grades.length,
      data: grades
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while fetching grades.'
    });
  }
};
