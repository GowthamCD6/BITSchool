import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useSchool } from '../context/SchoolContext';

export default function FacultyModal({ isOpen, onClose, facultyToEdit }) {
  const { classes, subjects, addFaculty, updateFaculty } = useSchool();

  // Dynamically derive Grade Undertaking options from MySQL classes database
  const gradeOptions = Array.from(
    new Set(classes.map((c) => c.name || (c.gradeName ? `Grade ${c.gradeName}` : String(c.grade))))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const [formData, setFormData] = useState({
    empId: '',
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
        empId: facultyToEdit.empId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        primarySubjectId: facultyToEdit.primarySubjectId || (subjects[0]?.id || ''),
        secondarySubjectIds: facultyToEdit.secondarySubjectIds || [],
        grades: facultyToEdit.grades || [],
        maxPeriodsPerDay: facultyToEdit.maxPeriodsPerDay !== undefined ? facultyToEdit.maxPeriodsPerDay : '',
        maxPeriodsPerWeek: facultyToEdit.maxPeriodsPerWeek !== undefined ? facultyToEdit.maxPeriodsPerWeek : ''
      });
    } else {
      setFormData({
        empId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
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

  // Derived numerical grade strings from selected grades
  const selectedGradeNums = (formData.grades || []).map((grd) => {
    const match = String(grd).match(/(?:Grade\s*)?(\d+)/i);
    return match ? match[1] : String(grd).replace(/\D/g, '');
  }).filter(Boolean);

  // Filter subjects based on selected grades (faculty can select multiple grades)
  const filteredSubjects = subjects.filter((s) => {
    if ((formData.grades || []).length === 0) return false;
    if (!s.grade || s.grade === 'all') return true;

    const sGradeNum = String(s.grade).replace('Grade ', '').trim();
    if (selectedGradeNums.includes(sGradeNum)) return true;
    if (Array.isArray(s.grades) && s.grades.some(g => selectedGradeNums.includes(String(g).replace('Grade ', '').trim()))) return true;
    if ((formData.grades || []).some(g => String(g).includes(sGradeNum) || String(g) === String(s.grade))) return true;

    return false;
  });

  const handleGradeToggle = (grade) => {
    setFormData((prev) => {
      const exists = (prev.grades || []).includes(grade);
      const nextGrades = exists
        ? prev.grades.filter((g) => g !== grade)
        : [...(prev.grades || []), grade];

      // Calculate valid subjects matching nextGrades
      const nextGradeNums = nextGrades.map((grd) => {
        const match = String(grd).match(/(?:Grade\s*)?(\d+)/i);
        return match ? match[1] : String(grd).replace(/\D/g, '');
      }).filter(Boolean);

      const validSubjectIds = subjects.filter((s) => {
        if (nextGrades.length === 0) return false;
        if (!s.grade || s.grade === 'all') return true;
        const sGradeNum = String(s.grade).replace('Grade ', '').trim();
        if (nextGradeNums.includes(sGradeNum)) return true;
        if (Array.isArray(s.grades) && s.grades.some(g => nextGradeNums.includes(String(g).replace('Grade ', '').trim()))) return true;
        if (nextGrades.some(g => String(g).includes(sGradeNum) || String(g) === String(s.grade))) return true;
        return false;
      }).map(s => s.id);

      const allSelected = [prev.primarySubjectId, ...(prev.secondarySubjectIds || [])].filter(Boolean);
      const filteredSelected = allSelected.filter(sId => validSubjectIds.includes(sId));

      return {
        ...prev,
        grades: nextGrades,
        primarySubjectId: filteredSelected[0] || '',
        secondarySubjectIds: filteredSelected.slice(1)
      };
    });
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const payload = {
      ...formData,
      empId: formData.empId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
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
          <div className="form-group">
            <label>Employee ID *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. EMP-101"
              value={formData.empId || ''}
              onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
              required
            />
          </div>
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

        {/* 1. Dynamic Grade Options (MOVED TO BE FIRST ABOVE SUBJECTS) */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            Grades Undertaking (Select one or more) *
          </label>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Faculty members can teach multiple grades. Selecting grades will filter applicable subjects below.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {gradeOptions.map((grd) => {
              const checked = (formData.grades || []).includes(grd);
              return (
                <button
                  type="button"
                  key={grd}
                  onClick={() => handleGradeToggle(grd)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1.5px solid',
                    borderColor: checked ? '#2563eb' : 'var(--border-color)',
                    background: checked ? '#eff6ff' : '#f8fafc',
                    color: checked ? '#2563eb' : 'var(--text-sub)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {checked ? '✓ ' : ''}{grd}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Multi-Subject Selection (FILTERED BY SELECTED GRADES ABOVE) */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            Subjects Covering (Filtered by Selected Grades) *
          </label>
          {(formData.grades || []).length === 0 ? (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px dashed var(--border-color)',
                color: '#64748b',
                fontSize: '0.83rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.35rem'
              }}
            >
              <span>ℹ️</span>
              <span>Please select one or more <strong>Grades Undertaking</strong> above to view and assign applicable subjects.</span>
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px dashed #fca5a5',
                color: '#991b1b',
                fontSize: '0.83rem',
                marginTop: '0.35rem'
              }}
            >
              No master subjects found for the selected grade(s).
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.35rem' }}>
              {filteredSubjects.map((s) => {
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
          )}
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
