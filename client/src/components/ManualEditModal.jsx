import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useSchool } from '../context/SchoolContext';

export default function ManualEditModal({ isOpen, onClose, slotToEdit }) {
  const { subjects, faculties, venues, updateTimetableSlot } = useSchool();

  const [formData, setFormData] = useState({
    subjectId: '',
    facultyId: '',
    venueId: ''
  });

  useEffect(() => {
    if (slotToEdit) {
      setFormData({
        subjectId: slotToEdit.subjectId || subjects[0]?.id || '',
        facultyId: slotToEdit.facultyId || faculties[0]?.id || '',
        venueId: slotToEdit.venueId || venues[0]?.id || ''
      });
    }
  }, [slotToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!slotToEdit) return;
    updateTimetableSlot(slotToEdit.id, formData);
    onClose();
  };

  if (!slotToEdit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Slot: ${slotToEdit.className} (${slotToEdit.day} - ${slotToEdit.periodName})`}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Update Slot
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem', padding: '0.65rem 0.9rem', borderRadius: '8px', background: 'rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
          <strong>Slot Info:</strong> {slotToEdit.day} | {slotToEdit.periodName} ({slotToEdit.periodTime})
        </div>

        <div className="form-group">
          <label>Assign Subject</label>
          <select
            className="form-control"
            value={formData.subjectId}
            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Assign Faculty Member</label>
          <select
            className="form-control"
            value={formData.facultyId}
            onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
          >
            {faculties.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.empId})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Assign Venue / Room</label>
          <select
            className="form-control"
            value={formData.venueId}
            onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.roomNo} - {v.name} ({v.type === 'projector' ? 'Projector' : v.type})
              </option>
            ))}
          </select>
        </div>
      </form>
    </Modal>
  );
}
