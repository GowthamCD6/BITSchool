import { Faculty, Subject } from '../models/index.js';

export const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.findAll({
      include: [{ model: Subject, as: 'primarySubject', attributes: ['id', 'name', 'code'] }],
      order: [['createdAt', 'DESC']]
    });
    return res.status(200).json({ success: true, count: faculties.length, data: faculties });
  } catch (error) {
    console.error('[Faculty GET Error]:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const { empId, name, email, phone, primarySubjectId, secondarySubjectIds, grades, maxPeriodsPerDay, maxPeriodsPerWeek, avatarColor } = req.body;
    const facultyId = req.body.id || `f_${Date.now()}`;
    const generatedEmpId = empId || `EMP-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const generatedEmail = email || `${(name || 'faculty').toLowerCase().replace(/\s+/g, '.')}@bitschool.edu`;

    const newFaculty = await Faculty.create({
      id: facultyId,
      empId: generatedEmpId,
      name: name || 'Faculty Member',
      email: generatedEmail,
      phone: phone || '',
      primarySubjectId: primarySubjectId || null,
      secondarySubjectIds: secondarySubjectIds || [],
      grades: grades || [],
      maxPeriodsPerDay: Number(maxPeriodsPerDay) || 5,
      maxPeriodsPerWeek: Number(maxPeriodsPerWeek) || 25,
      status: 'Active',
      avatarColor: avatarColor || '#2563eb'
    });

    return res.status(201).json({ success: true, data: newFaculty });
  } catch (error) {
    console.error('[Faculty Create Error]:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await Faculty.findByPk(id);
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty member not found' });

    await faculty.update(req.body);
    return res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    console.error('[Faculty Update Error]:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await Faculty.findByPk(id);
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty member not found' });

    await faculty.destroy();
    return res.status(200).json({ success: true, message: 'Faculty member deleted' });
  } catch (error) {
    console.error('[Faculty Delete Error]:', error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
