import { Venue } from '../models/index.js';

export const getVenues = async (req, res) => {
  try {
    const venues = await Venue.findAll({ order: [['roomNo', 'ASC']] });
    return res.status(200).json({ success: true, count: venues.length, data: venues });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createVenue = async (req, res) => {
  try {
    const { roomNo, name, type, capacity, building, floor } = req.body;
    const venueId = req.body.id || `v_${Date.now()}`;
    const newVenue = await Venue.create({
      id: venueId,
      roomNo,
      name,
      type: type || 'normal',
      capacity: Number(capacity) || 40,
      building: building || 'Main Block',
      floor: floor || '1st Floor',
      status: 'Available'
    });
    return res.status(201).json({ success: true, data: newVenue });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByPk(id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

    await venue.update(req.body);
    return res.status(200).json({ success: true, data: venue });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByPk(id);
    if (!venue) return res.status(404).json({ success: false, message: 'Venue not found' });

    await venue.destroy();
    return res.status(200).json({ success: true, message: 'Venue deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
