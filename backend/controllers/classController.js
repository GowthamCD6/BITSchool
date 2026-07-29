import { ClassModel } from '../models/index.js';
import { INITIAL_CLASSES } from '../utils/initialData.js';

let fallbackClasses = [...INITIAL_CLASSES];

export const getClasses = async (req, res) => {
  try {
    const classes = await ClassModel.findAll();
    if (classes && classes.length > 0) {
      return res.status(200).json({ success: true, data: classes });
    }
    return res.status(200).json({ success: true, data: fallbackClasses });
  } catch (error) {
    return res.status(200).json({ success: true, data: fallbackClasses });
  }
};

export const createClass = async (req, res) => {
  const { name, grade, section, studentCount, homeVenueId } = req.body;
  const id = `c_${Date.now()}`;
  const newClass = {
    id,
    name: name || `Grade ${grade}-${section}`,
    grade: String(grade),
    section: String(section).toUpperCase(),
    studentCount: Number(studentCount) || 35,
    homeVenueId: homeVenueId || ''
  };

  try {
    const created = await ClassModel.create(newClass);
    fallbackClasses.push(created.toJSON());
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    fallbackClasses.push(newClass);
    return res.status(201).json({ success: true, data: newClass });
  }
};

export const updateClass = async (req, res) => {
  const { id } = req.params;
  try {
    const cls = await ClassModel.findByPk(id);
    if (cls) {
      await cls.update(req.body);
      return res.status(200).json({ success: true, data: cls });
    }
  } catch (error) {
    // fallback
  }

  const idx = fallbackClasses.findIndex(c => c.id === id);
  if (idx !== -1) {
    fallbackClasses[idx] = { ...fallbackClasses[idx], ...req.body };
    return res.status(200).json({ success: true, data: fallbackClasses[idx] });
  }
  return res.status(404).json({ success: false, message: 'Class section not found' });
};

export const deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    await ClassModel.destroy({ where: { id } });
  } catch (error) {
    // fallback
  }
  fallbackClasses = fallbackClasses.filter(c => c.id !== id);
  return res.status(200).json({ success: true, message: 'Class section deleted' });
};
