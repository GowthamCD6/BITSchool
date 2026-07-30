import { Grade, Class } from '../models/index.js';

// Get all Grades
export const getGrades = async (req, res) => {
  try {
    const grades = await Grade.findAll({
      order: [['id', 'ASC']]
    });
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ message: 'Failed to fetch grades', error: error.message });
  }
};

// Create a new Grade
export const createGrade = async (req, res) => {
  try {
    let { name, level, id } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Grade name is required' });
    }

    // Standardize name formatting e.g., '12' -> 'Grade 12'
    let gradeName = name.startsWith('Grade') ? name : `Grade ${name}`;
    let gradeNum = parseInt(name.replace(/\D/g, ''), 10);
    let gradeId = id || (isNaN(gradeNum) ? undefined : gradeNum);

    // Determine level if not provided
    if (!level) {
      if (gradeNum >= 11) level = 'Higher Secondary';
      else if (gradeNum >= 9) level = 'High School';
      else if (gradeNum >= 6) level = 'Middle School';
      else level = 'Primary School';
    }

    const payload = { name: gradeName, level };
    if (gradeId) payload.id = gradeId;

    const [grade, created] = await Grade.findOrCreate({
      where: { name: gradeName },
      defaults: payload
    });

    res.status(created ? 201 : 200).json(grade);
  } catch (error) {
    console.error('Error creating grade:', error);
    res.status(500).json({ message: 'Failed to create grade', error: error.message });
  }
};

// Update Grade
export const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level } = req.body;

    const grade = await Grade.findByPk(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    if (name) grade.name = name;
    if (level) grade.level = level;
    await grade.save();

    res.json(grade);
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ message: 'Failed to update grade', error: error.message });
  }
};

// Delete Grade
export const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const grade = await Grade.findByPk(id);
    if (!grade) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    await grade.destroy();
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ message: 'Failed to delete grade', error: error.message });
  }
};
