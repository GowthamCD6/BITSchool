import { EcaVertical, EcaSchedule, GradeEcaVertical, Grade } from '../models/index.js';

// GET /api/eca — Return all ECA verticals (with grade mappings) and schedule data from MySQL
export const getEcaData = async (req, res) => {
  try {
    // 1. Fetch all ECA Verticals with their grade associations
    const verticalRecords = await EcaVertical.findAll({
      order: [['createdAt', 'ASC']],
      include: [{ model: Grade, as: 'grades', through: { attributes: [] } }]
    });

    const verticals = verticalRecords.map(v => v.name);
    const verticalDetails = verticalRecords.map(v => ({
      id: v.id,
      name: v.name,
      category: v.category,
      color: v.color,
      grades: (v.grades || []).map(g => ({ id: g.id, name: g.name }))
    }));

    // 2. Fetch all ECA Schedule entries
    const scheduleRecords = await EcaSchedule.findAll();

    // 3. Reconstruct the nested schedule object: { "4_MONDAY": { "Keyboard": { active, label, ... } }, ... }
    const schedule = {};
    for (const rec of scheduleRecords) {
      const gradeKey = rec.grade ? `${rec.grade}_${rec.day}` : rec.day;

      if (!schedule[gradeKey]) schedule[gradeKey] = {};
      schedule[gradeKey][rec.verticalId] = {
        active: rec.activity ? true : false,
        label: rec.activity || 'No',
        duration: rec.duration || '',
        target: rec.target || 'All',
        color: rec.color || '#059669'
      };
    }

    // 4. Fetch grade_eca_verticals mappings
    const gradeEcaMappings = await GradeEcaVertical.findAll();
    const gradeEcaMap = {};
    for (const m of gradeEcaMappings) {
      if (!gradeEcaMap[m.gradeId]) gradeEcaMap[m.gradeId] = [];
      gradeEcaMap[m.gradeId].push(m.ecaVerticalId);
    }

    return res.status(200).json({
      success: true,
      data: { verticals, verticalDetails, schedule, gradeEcaMap }
    });
  } catch (err) {
    console.error('[ECA GET Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/eca/cell — Save/Update a single ECA schedule cell
export const updateEcaCell = async (req, res) => {
  try {
    const { day, vertical, grade, active, label, duration, target, color } = req.body;

    if (!day || !vertical) {
      return res.status(400).json({ success: false, message: 'day and vertical are required.' });
    }

    const gradeVal = grade || '4';

    // Upsert: find existing or create
    const [record, created] = await EcaSchedule.findOrCreate({
      where: { day, verticalId: vertical, grade: gradeVal },
      defaults: {
        grade: gradeVal,
        activity: active ? (label || 'Yes') : null,
        duration: duration || '',
        target: target || 'All',
        color: color || '#059669'
      }
    });

    if (!created) {
      record.activity = active ? (label || 'Yes') : null;
      record.duration = duration || '';
      record.target = target || 'All';
      record.color = color || '#059669';
      await record.save();
    }

    return res.status(200).json({ success: true, data: record });
  } catch (err) {
    console.error('[ECA Cell Update Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/eca/vertical — Add a new ECA vertical and associate it with grades
export const addEcaVertical = async (req, res) => {
  try {
    const { name, gradeIds } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Vertical name is required.' });
    }

    const existing = await EcaVertical.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ success: false, message: `Vertical "${name}" already exists.` });
    }

    const vertical = await EcaVertical.create({
      id: `eca_${Date.now()}`,
      name,
      category: 'General',
      color: '#2563eb'
    });

    // Associate with grades if provided
    if (gradeIds && Array.isArray(gradeIds) && gradeIds.length > 0) {
      const mappings = gradeIds.map(gId => ({
        gradeId: gId,
        ecaVerticalId: vertical.id
      }));
      await GradeEcaVertical.bulkCreate(mappings);
    }

    // Fetch the vertical with grades to return
    const result = await EcaVertical.findByPk(vertical.id, {
      include: [{ model: Grade, as: 'grades', through: { attributes: [] } }]
    });

    return res.status(201).json({
      success: true,
      data: {
        id: result.id,
        name: result.name,
        category: result.category,
        color: result.color,
        grades: (result.grades || []).map(g => ({ id: g.id, name: g.name }))
      }
    });
  } catch (err) {
    console.error('[ECA Vertical Add Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/eca/vertical/:id — Update ECA vertical grade mappings
export const updateEcaVerticalGrades = async (req, res) => {
  try {
    const { id } = req.params;
    const { gradeIds } = req.body;

    const vertical = await EcaVertical.findByPk(id);
    if (!vertical) {
      return res.status(404).json({ success: false, message: 'ECA Vertical not found.' });
    }

    // Remove old mappings and insert new ones
    await GradeEcaVertical.destroy({ where: { ecaVerticalId: id } });

    if (gradeIds && Array.isArray(gradeIds) && gradeIds.length > 0) {
      const mappings = gradeIds.map(gId => ({
        gradeId: gId,
        ecaVerticalId: id
      }));
      await GradeEcaVertical.bulkCreate(mappings);
    }

    const result = await EcaVertical.findByPk(id, {
      include: [{ model: Grade, as: 'grades', through: { attributes: [] } }]
    });

    return res.status(200).json({
      success: true,
      data: {
        id: result.id,
        name: result.name,
        grades: (result.grades || []).map(g => ({ id: g.id, name: g.name }))
      }
    });
  } catch (err) {
    console.error('[ECA Vertical Update Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/eca/vertical/:name — Delete an ECA vertical and its schedule entries & grade mappings
export const deleteEcaVertical = async (req, res) => {
  try {
    const { name } = req.params;

    // Find vertical by name to get the id
    const vertical = await EcaVertical.findOne({ where: { name } });

    if (vertical) {
      // Delete grade mappings
      await GradeEcaVertical.destroy({ where: { ecaVerticalId: vertical.id } });
    }

    // Delete all schedule entries for this vertical
    await EcaSchedule.destroy({ where: { verticalId: name } });

    // Delete the vertical itself
    await EcaVertical.destroy({ where: { name } });

    return res.status(200).json({ success: true, message: `ECA Vertical "${name}" removed.` });
  } catch (err) {
    console.error('[ECA Vertical Delete Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
