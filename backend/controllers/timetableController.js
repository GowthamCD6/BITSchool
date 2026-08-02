import { TimetableSlot } from '../models/index.js';

// GET /api/timetables - Fetch all saved timetable slots from MySQL
export const getTimetables = async (req, res) => {
  try {
    const slots = await TimetableSlot.findAll({
      order: [['classId', 'ASC'], ['day', 'ASC'], ['period', 'ASC']]
    });
    return res.status(200).json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('[MySQL Error] Fetching timetables:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/timetables/:weekKey
export const getTimetableByWeek = async (req, res) => {
  try {
    const slots = await TimetableSlot.findAll({
      order: [['classId', 'ASC'], ['day', 'ASC'], ['period', 'ASC']]
    });
    return res.status(200).json({ success: true, data: slots });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/timetables/save - Batch save generated timetable slots to MySQL
export const saveTimetableForWeek = async (req, res) => {
  try {
    const rawSlots = Array.isArray(req.body) ? req.body : (req.body.slots || req.body.timetable || []);

    if (!Array.isArray(rawSlots) || rawSlots.length === 0) {
      const existing = await TimetableSlot.findAll();
      return res.status(200).json({ success: true, data: existing });
    }

    // Clean and validate slot fields for MySQL Insertion
    const sanitizedSlots = rawSlots.map(s => ({
      id: String(s.id || `slot_${s.classId}_${s.day}_${s.period}`),
      classId: String(s.classId || ''),
      className: String(s.className || ''),
      day: String(s.day || ''),
      period: Number(s.period || 1),
      periodName: String(s.periodName || ''),
      periodTime: String(s.periodTime || ''),
      startTime: String(s.startTime || ''),
      endTime: String(s.endTime || ''),
      durationMins: Number(s.durationMins || 45),
      subjectId: s.subjectId ? String(s.subjectId) : null,
      subjectName: s.subjectName ? String(s.subjectName) : null,
      subjectCode: s.subjectCode ? String(s.subjectCode) : null,
      subjectColor: s.subjectColor || '#2563eb',
      facultyId: s.facultyId ? String(s.facultyId) : null,
      facultyName: s.facultyName ? String(s.facultyName) : null,
      venueId: s.venueId ? String(s.venueId) : null,
      venueName: s.venueName ? String(s.venueName) : null,
      venueRoomNo: s.venueRoomNo ? String(s.venueRoomNo) : null,
      venueType: s.venueType || 'normal',
      isConflict: Boolean(s.isConflict),
      conflictReason: s.conflictReason ? String(s.conflictReason) : null,
      ecaTag: s.ecaTag ? String(s.ecaTag) : null
    }));

    // Bulk save with upsert in MySQL
    await TimetableSlot.bulkCreate(sanitizedSlots, {
      updateOnDuplicate: [
        'className', 'day', 'period', 'periodName', 'periodTime',
        'startTime', 'endTime', 'durationMins', 'subjectId', 'subjectName',
        'subjectCode', 'subjectColor', 'facultyId', 'facultyName',
        'venueId', 'venueName', 'venueRoomNo', 'venueType',
        'isConflict', 'conflictReason', 'ecaTag', 'updatedAt'
      ]
    });

    const allSlots = await TimetableSlot.findAll({
      order: [['classId', 'ASC'], ['day', 'ASC'], ['period', 'ASC']]
    });

    console.log(`[MySQL] Successfully saved ${sanitizedSlots.length} timetable slots to MySQL database.`);

    return res.status(200).json({
      success: true,
      message: 'Timetable slots saved to MySQL database successfully.',
      data: allSlots
    });
  } catch (error) {
    console.error('[MySQL Error] Saving timetable slots:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/timetables/slot/:id - Update a single slot in MySQL
export const updateTimetableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    let slot = await TimetableSlot.findByPk(id);

    if (!slot) {
      slot = await TimetableSlot.create({ id, ...req.body });
      return res.status(201).json({ success: true, data: slot });
    }

    await slot.update(req.body);
    return res.status(200).json({ success: true, data: slot });
  } catch (error) {
    console.error('[MySQL Error] Updating slot:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/timetables/:weekKey - Clear all or specific class timetable slots
export const deleteWeekTimetable = async (req, res) => {
  try {
    const { weekKey } = req.params;
    if (weekKey === 'all') {
      await TimetableSlot.destroy({ where: {}, truncate: true });
    } else {
      await TimetableSlot.destroy({ where: { classId: weekKey } });
    }
    return res.status(200).json({ success: true, message: 'Timetable slots deleted from MySQL.' });
  } catch (error) {
    console.error('[MySQL Error] Deleting timetable:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
