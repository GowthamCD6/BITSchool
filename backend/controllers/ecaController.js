import { INITIAL_ECA_VERTICALS, INITIAL_ECA_SCHEDULE } from '../utils/initialData.js';

let verticalsStore = [...INITIAL_ECA_VERTICALS];
let scheduleStore = { ...INITIAL_ECA_SCHEDULE };

export const getEcaData = async (req, res) => {
  return res.status(200).json({
    success: true,
    verticals: verticalsStore,
    schedule: scheduleStore
  });
};

export const updateEcaCell = async (req, res) => {
  const { day, vertical, cellData } = req.body;
  if (!day || !vertical) {
    return res.status(400).json({ success: false, message: 'Day and vertical required' });
  }
  if (!scheduleStore[day]) {
    scheduleStore[day] = {};
  }
  scheduleStore[day][vertical] = cellData;
  return res.status(200).json({ success: true, schedule: scheduleStore });
};

export const addEcaVertical = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'Vertical name required' });
  if (verticalsStore.includes(name)) {
    return res.status(400).json({ success: false, message: 'Vertical already exists' });
  }
  verticalsStore.push(name);
  Object.keys(scheduleStore).forEach(d => {
    scheduleStore[d][name] = { active: false, label: 'No' };
  });
  return res.status(201).json({ success: true, verticals: verticalsStore, schedule: scheduleStore });
};

export const deleteEcaVertical = async (req, res) => {
  const { name } = req.params;
  verticalsStore = verticalsStore.filter(v => v !== name);
  Object.keys(scheduleStore).forEach(d => {
    delete scheduleStore[d][name];
  });
  return res.status(200).json({ success: true, verticals: verticalsStore, schedule: scheduleStore });
};
