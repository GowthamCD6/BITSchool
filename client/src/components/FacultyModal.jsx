import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useSchool } from '../context/SchoolContext';

export default function FacultyModal({ isOpen, onClose, facultyToEdit }) {
  const { classes, subjects, addFaculty, updateFaculty } = useSchool();

  // Dynamically derive Grade Undertaking options from MySQL classes database
  const gradeOptions = classes.map((c) => c.name);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    primarySubjectId: '',
    secondarySubjectIds: [],
    grades: [],
    maxPeriodsPerDay: '',
    maxPeriodsPerWeek: ''
  });

  useEffect(() => {
    if (facultyToEdit) {
      setFormData({
        ...facultyToEdit,
        primarySubjectId: facultyToEdit.primarySubjectId || (subjects[0]?.id || ''),
        secondarySubjectIds: facultyToEdit.secondarySubjectIds || [],
        grades: facultyToEdit.grades || [],
        maxPeriodsPerDay: facultyToEdit.maxPeriodsPerDay !== undefined ? facultyToEdit.maxPeriodsPerDay : '',
        maxPeriodsPerWeek: facultyToEdit.maxPeriodsPerWeek !== undefined ? facultyToEdit.maxPeriodsPerWeek : ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        primarySubjectId: '',
        secondarySubjectIds: [],
        grades: [],
        maxPeriodsPerDay: '',
        maxPeriodsPerWeek: ''
      });
    }
  }, [facultyToEdit, subjects, isOpen]);

  const handleSubjectToggle = (subjectId) => {
    setFormData((prev) => {
      const secondary = prev.secondarySubjectIds || [];
      const allSelected = [prev.primarySubjectId, ...secondary].filter(Boolean);
      let nextSelected;
      if (allSelected.includes(subjectId)) {
        nextSelected = allSelected.filter((sId) => sId !== subjectId);
      } else {
        nextSelected = [...allSelected, subjectId];
      }
      return {
        ...prev,
        primarySubjectId: nextSelected[0] || '',
        secondarySubjectIds: nextSelected.slice(1)
      };
    });
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.primarySubjectId) return;

    const payload = {
      ...formData,
      maxPeriodsPerDay: formData.maxPeriodsPerDay !== '' ? Number(formData.maxPeriodsPerDay) : 5,
      maxPeriodsPerWeek: formData.maxPeriodsPerWeek !== '' ? Number(formData.maxPeriodsPerWeek) : 25
    };

    if (facultyToEdit) {
      updateFaculty(payload);
    } else {
      addFaculty(payload);
    }
    onClose();
  };

  const allSelectedSubjects = [formData.primarySubjectId, ...(formData.secondarySubjectIds || [])].filter(Boolean);

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

        {/* Multi-Subject Selection */}
        <div className="form-group">
          <label>Subjects Covering (Select one or more) *</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
            {subjects.map((s) => {
              const checked = allSelectedSubjects.includes(s.id);
              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => handleSubjectToggle(s.id)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: checked ? (s.color || '#2563eb') : 'var(--border-color)',
                    background: checked ? `${s.color || '#2563eb'}18` : '#f8fafc',
                    color: checked ? (s.color || '#2563eb') : 'var(--text-sub)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s'
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: s.color || '#2563eb'
                    }}
                  />
                  <span>{s.name} ({s.code})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Grade Options from MySQL */}
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
              placeholder="e.g. 5"
              value={formData.maxPeriodsPerDay}
              onChange={(e) => setFormData({ ...formData, maxPeriodsPerDay: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Max Periods / Week</label>
            <input
              type="number"
              min="5"
              max="40"
              className="form-control"
              placeholder="e.g. 25"
              value={formData.maxPeriodsPerWeek}
              onChange={(e) => setFormData({ ...formData, maxPeriodsPerWeek: e.target.value })}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
