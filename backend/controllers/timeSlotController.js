import { TimeSlot, BellScheduleConfig } from '../models/index.js';

// Helper: Sync time_slots table with ONLY master daily timing milestones
export async function syncTimeSlotsFromBellConfig(config) {
  try {
    const milestoneSlots = [
      {
        slotNo: 1,
        name: 'School Day Start',
        startTime: config.schoolStartTime || '08:30 AM',
        endTime: config.schoolStartTime || '08:30 AM',
        type: 'period',
        color: '#2563eb'
      },
      {
        slotNo: 2,
        name: 'First Break (Morning)',
        startTime: config.morningBreakStart || '10:00 AM',
        endTime: config.morningBreakEnd || '10:15 AM',
        type: 'break',
        color: '#f59e0b'
      },
      {
        slotNo: 3,
        name: 'Lunch Break',
        startTime: config.lunchBreakStart || '11:45 AM',
        endTime: config.lunchBreakEnd || '12:30 PM',
        type: 'lunch',
        color: '#ef4444'
      },
      {
        slotNo: 4,
        name: 'Second Break (Afternoon)',
        startTime: config.afternoonBreakStart || '02:00 PM',
        endTime: config.afternoonBreakEnd || '02:15 PM',
        type: 'break',
        color: '#f59e0b'
      },
      {
        slotNo: 5,
        name: 'School Day End',
        startTime: config.schoolEndTime || '03:45 PM',
        endTime: config.schoolEndTime || '03:45 PM',
        type: 'period',
        color: '#2563eb'
      }
    ];

    await TimeSlot.destroy({ where: {} });
    const created = await TimeSlot.bulkCreate(milestoneSlots);
    console.log(`[MySQL] Stored ${created.length} bell schedule milestone slots in time_slots table.`);
    return created;
  } catch (err) {
    console.error('[syncTimeSlotsFromBellConfig Error]:', err.message);
    return [];
  }
}

// GET /api/time-slots — Get all configured time slots ordered by slotNo
export const getTimeSlots = async (req, res) => {
  try {
    const slots = await TimeSlot.findAll({
      order: [['slotNo', 'ASC']]
    });
    return res.status(200).json({ success: true, data: slots });
  } catch (err) {
    console.error('[GET TimeSlots Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/time-slots — Create a new time slot
export const createTimeSlot = async (req, res) => {
  try {
    const { name, startTime, endTime, type, color, slotNo } = req.body;

    if (!name || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Name, Start Time, and End Time are required.' });
    }

    const currentMax = await TimeSlot.max('slotNo') || 0;
    const nextSlotNo = slotNo || (currentMax + 1);

    const slot = await TimeSlot.create({
      slotNo: nextSlotNo,
      name,
      startTime,
      endTime,
      type: type || 'period',
      color: color || '#2563eb'
    });

    return res.status(201).json({ success: true, data: slot });
  } catch (err) {
    console.error('[CREATE TimeSlot Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/time-slots/:id — Update an existing time slot
export const updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startTime, endTime, type, color, slotNo } = req.body;

    const slot = await TimeSlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found.' });
    }

    if (name) slot.name = name;
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (type) slot.type = type;
    if (color) slot.color = color;
    if (slotNo) slot.slotNo = slotNo;

    await slot.save();
    return res.status(200).json({ success: true, data: slot });
  } catch (err) {
    console.error('[UPDATE TimeSlot Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/time-slots/:id — Delete a time slot
export const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await TimeSlot.findByPk(id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Time slot not found.' });
    }

    await slot.destroy();
    return res.status(200).json({ success: true, message: 'Time slot deleted successfully.' });
  } catch (err) {
    console.error('[DELETE TimeSlot Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/time-slots/bell-config — Get master timing parameters
export const getBellConfig = async (req, res) => {
  try {
    let config = await BellScheduleConfig.findOne();
    if (!config) {
      config = await BellScheduleConfig.create({
        schoolStartTime: '08:30 AM',
        morningBreakStart: '10:00 AM',
        morningBreakEnd: '10:15 AM',
        lunchBreakStart: '11:45 AM',
        lunchBreakEnd: '12:30 PM',
        afternoonBreakStart: '02:00 PM',
        afternoonBreakEnd: '02:15 PM',
        schoolEndTime: '03:45 PM'
      });
      await syncTimeSlotsFromBellConfig(config);
    }
    return res.status(200).json({ success: true, data: config });
  } catch (err) {
    console.error('[GET BellConfig Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST/PUT /api/time-slots/bell-config — Save master timing parameters & update time_slots table
export const updateBellConfig = async (req, res) => {
  try {
    let config = await BellScheduleConfig.findOne();
    if (!config) {
      config = await BellScheduleConfig.create(req.body);
    } else {
      await config.update(req.body);
    }

    // Automatically sync time_slots table with ONLY timing milestone slots
    const updatedTimeSlots = await syncTimeSlotsFromBellConfig(config);

    return res.status(200).json({ success: true, data: config, timeSlots: updatedTimeSlots });
  } catch (err) {
    console.error('[UPDATE BellConfig Error]:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
