let weeklyTimetableStore = {};

export const getTimetables = async (req, res) => {
  return res.status(200).json({ success: true, data: weeklyTimetableStore });
};

export const getTimetableByWeek = async (req, res) => {
  const { weekKey } = req.params;
  const timetable = weeklyTimetableStore[weekKey] || [];
  return res.status(200).json({ success: true, weekKey, data: timetable });
};

export const saveTimetableForWeek = async (req, res) => {
  const { weekKey, slots } = req.body;
  if (!weekKey) {
    return res.status(400).json({ success: false, message: 'Week key is required' });
  }
  weeklyTimetableStore[weekKey] = slots || [];
  return res.status(200).json({ success: true, weekKey, count: weeklyTimetableStore[weekKey].length });
};

export const deleteWeekTimetable = async (req, res) => {
  const { weekKey } = req.params;
  delete weeklyTimetableStore[weekKey];
  return res.status(200).json({ success: true, message: `Timetable for week ${weekKey} deleted` });
};
