import { SubjectModel } from '../models/index.js';
import { INITIAL_SUBJECTS } from '../utils/initialData.js';

let fallbackSubjects = [...INITIAL_SUBJECTS];

export const getSubjects = async (req, res) => {
  try {
    const subjects = await SubjectModel.findAll();
    if (subjects && subjects.length > 0) {
      return res.status(200).json({ success: true, data: subjects });
    }
    return res.status(200).json({ success: true, data: fallbackSubjects });
  } catch (error) {
    return res.status(200).json({ success: true, data: fallbackSubjects });
  }
};

export const createSubject = async (req, res) => {
  const { code, name, weeklyPeriods, requiredVenueType, color, grade } = req.body;
  const id = `s_${Date.now()}`;
  const newSubject = {
    id,
    code: code ? code.toUpperCase() : 'CRS101',
    name,
    weeklyPeriods: Number(weeklyPeriods) || 5,
    requiredVenueType: requiredVenueType || 'normal',
    color: color || '#2563eb',
    grade: grade || 'all'
  };

  try {
    const created = await SubjectModel.create(newSubject);
    fallbackSubjects.push(created.toJSON());
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    fallbackSubjects.push(newSubject);
    return res.status(201).json({ success: true, data: newSubject });
  }
};

export const updateSubject = async (req, res) => {
  const { id } = req.params;
  try {
    const subj = await SubjectModel.findByPk(id);
    if (subj) {
      await subj.update(req.body);
      return res.status(200).json({ success: true, data: subj });
    }
  } catch (error) {
    // fallback
  }

  const idx = fallbackSubjects.findIndex(s => s.id === id);
  if (idx !== -1) {
    fallbackSubjects[idx] = { ...fallbackSubjects[idx], ...req.body };
    return res.status(200).json({ success: true, data: fallbackSubjects[idx] });
  }
  return res.status(404).json({ success: false, message: 'Subject not found' });
};

export const deleteSubject = async (req, res) => {
  const { id } = req.params;
  try {
    await SubjectModel.destroy({ where: { id } });
  } catch (error) {
    // fallback
  }
  fallbackSubjects = fallbackSubjects.filter(s => s.id !== id);
  return res.status(200).json({ success: true, message: 'Subject deleted' });
};
