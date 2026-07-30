export const getTimetables = async (req, res) => {
  return res.status(200).json({ success: true, data: [] });
};

export const getTimetableByWeek = async (req, res) => {
  return res.status(200).json({ success: true, data: [] });
};

export const saveTimetableForWeek = async (req, res) => {
  return res.status(200).json({ success: true, data: req.body });
};

export const deleteWeekTimetable = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Timetable week deleted' });
};
