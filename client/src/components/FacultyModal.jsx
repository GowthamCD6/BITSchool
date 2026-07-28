import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useSchool } from '../context/SchoolContext';

export default function FacultyModal({ isOpen, onClose, facultyToEdit }) {
  const { subjects, addFaculty, updateFaculty } = useSchool();

  const gradeOptions = ['Grade 8-A', 'Grade 9-A', 'Grade 9-B', 'Grade 10-A', 'Grade 10-B', 'Grade 11-A'];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    primarySubjectId: '',
    secondarySubjectIds: [],
    grades: ['Grade 9-A', 'Grade 10-A'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 25
  });

  useEffect(() => {
    if (facultyToEdit) {
      setFormData({
        ...facultyToEdit,
        primarySubjectId: facultyToEdit.primarySubjectId || (subjects[0]?.id || ''),
        secondarySubjectIds: facultyToEdit.secondarySubjectIds || [],
        grades: facultyToEdit.grades || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        primarySubjectId: subjects[0]?.id || '',
        secondarySubjectIds: [],
        grades: ['Grade 9-A', 'Grade 10-A'],
        maxPeriodsPerDay: 5,
        maxPeriodsPerWeek: 25
      });
    }
  }, [facultyToEdit, subjects, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.primarySubjectId) return;

    if (facultyToEdit) {
      updateFaculty(formData);
    } else {
      addFaculty(formData);
    }
    onClose();
  };

  const handleGradeToggle = (grade) => {
    setFormData((prev) => {
      const exists = prev.grades.includes(grade);
      return {
        ...prev,
        grades: exists ? prev.grades.filter((g) => g !== grade) : [...prev.grades, grade]
      };
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={facultyToEdit ? 'Edit Faculty Profile' : 'Add New Faculty Member'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            {facultyToEdit ? 'Save Changes' : 'Create Faculty'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Dr. Rajesh Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              placeholder="faculty@bitschool.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              className="form-control"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Main Subject Covering *</label>
          <select
            className="form-control"
            value={formData.primarySubjectId}
            onChange={(e) => setFormData({ ...formData, primarySubjectId: e.target.value })}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Grades Undertaking</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.3rem' }}>
            {gradeOptions.map((grd) => {
              const checked = formData.grades.includes(grd);
              return (
                <button
                  type="button"
                  key={grd}
                  onClick={() => handleGradeToggle(grd)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: checked ? 'var(--primary)' : 'var(--border-color)',
                    background: checked ? '#eff6ff' : '#f8fafc',
                    color: checked ? '#2563eb' : 'var(--text-sub)'
                  }}
                >
                  {grd}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Max Periods / Day</label>
            <input
              type="number"
              min="1"
              max="8"
              className="form-control"
              value={formData.maxPeriodsPerDay}
              onChange={(e) => setFormData({ ...formData, maxPeriodsPerDay: parseInt(e.target.value) || 5 })}
            />
          </div>
          <div className="form-group">
            <label>Max Periods / Week</label>
            <input
              type="number"
              min="5"
              max="40"
              className="form-control"
              value={formData.maxPeriodsPerWeek}
              onChange={(e) => setFormData({ ...formData, maxPeriodsPerWeek: parseInt(e.target.value) || 25 })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
