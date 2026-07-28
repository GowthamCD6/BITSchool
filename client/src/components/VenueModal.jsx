import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useSchool } from '../context/SchoolContext';

export default function VenueModal({ isOpen, onClose, venueToEdit }) {
  const { venueTypes, addVenue, updateVenue } = useSchool();

  const [formData, setFormData] = useState({
    roomNo: '',
    name: '',
    type: 'normal',
    capacity: 40,
    building: 'Main Block',
    floor: '1st Floor',
    status: 'Available'
  });

  useEffect(() => {
    if (venueToEdit) {
      setFormData(venueToEdit);
    } else {
      setFormData({
        roomNo: '',
        name: '',
        type: 'normal',
        capacity: 40,
        building: 'Main Block',
        floor: '1st Floor',
        status: 'Available'
      });
    }
  }, [venueToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.roomNo || !formData.name) return;

    if (venueToEdit) {
      updateVenue(formData);
    } else {
      addVenue(formData);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={venueToEdit ? 'Edit Venue Configuration' : 'Add New Venue / Classroom'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {venueToEdit ? 'Save Venue' : 'Create Venue'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Room No. / ID *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Room 102"
              value={formData.roomNo}
              onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Venue Title / Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Smart Classroom 102"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Venue Facility & Type *</label>
          <select
            className="form-control"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            {venueTypes.map((vt) => (
              <option key={vt.id} value={vt.id}>
                {vt.name}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Specifies facility (e.g. "Normal Class" or "Normal Class + Projector" or Specialized Labs)
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Capacity (Seats)</label>
            <input
              type="number"
              className="form-control"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 40 })}
            />
          </div>
          <div className="form-group">
            <label>Building Block</label>
            <input
              type="text"
              className="form-control"
              placeholder="Main Block"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Floor</label>
            <input
              type="text"
              className="form-control"
              placeholder="1st Floor"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
