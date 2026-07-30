export const getEcaData = async (req, res) => {
  return res.status(200).json({ success: true, data: {} });
};

export const updateEcaCell = async (req, res) => {
  return res.status(200).json({ success: true, data: req.body });
};

export const addEcaVertical = async (req, res) => {
  return res.status(201).json({ success: true, data: req.body });
};

export const deleteEcaVertical = async (req, res) => {
  return res.status(200).json({ success: true, message: 'ECA Vertical removed' });
};
