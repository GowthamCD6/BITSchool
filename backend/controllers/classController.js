export const getClasses = async (req, res) => {
  return res.status(200).json({ success: true, data: [] });
};

export const createClass = async (req, res) => {
  return res.status(201).json({ success: true, data: req.body });
};

export const updateClass = async (req, res) => {
  return res.status(200).json({ success: true, data: req.body });
};

export const deleteClass = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Class section deleted' });
};
