export const getSubjects = async (req, res) => {
  return res.status(200).json({ success: true, data: [] });
};

export const createSubject = async (req, res) => {
  return res.status(201).json({ success: true, data: req.body });
};

export const updateSubject = async (req, res) => {
  return res.status(200).json({ success: true, data: req.body });
};

export const deleteSubject = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Subject deleted' });
};
