import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import FacultyModal from '../../components/FacultyModal';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/EmptyState';
import { Plus, Search, Mail, Phone, Edit, Trash2, Clock, Users } from 'lucide-react';

export default function FacultyManagement() {
  const { classes, faculties, subjects, grades, deleteFaculty } = useSchool();

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  // Extract unique Grade levels dynamically from backend MySQL database grades + classes
  const uniqueGradeLevels = Array.from(
    new Set([
      ...(grades || []).map((g) => String(g.id || String(g.name).replace(/\D/g, ''))),
      ...(classes || []).map((c) => String(c.gradeName || c.gradeId || c.grade || '').replace('Grade ', '').trim())
    ].filter(Boolean))
  ).sort((a, b) => Number(a) - Number(b));

  // Filter main subjects dropdown options by selected grade filter
  const filteredMainSubjects = subjects.filter((s) => {
    if (gradeFilter === 'ALL') return true;
    if (!s.grade || s.grade === 'all') return true;
    const sGradeNum = String(s.grade).replace('Grade ', '').trim();
    return sGradeNum === String(gradeFilter);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [facultyToEdit, setFacultyToEdit] = useState(null);

  // Deletion Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleOpenAdd = () => {
    setFacultyToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setFacultyToEdit(fac);
    setIsModalOpen(true);
  };

  const confirmDelete = (fac) => {
    setDeleteTarget(fac);
  };

  const filteredFaculties = faculties.filter((fac) => {
    const matchesSearch =
      (fac.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (fac.empId || '').toLowerCase().includes(search.toLowerCase()) ||
      (fac.email || '').toLowerCase().includes(search.toLowerCase());

    const allSubjectIds = [fac.primarySubjectId, ...(fac.secondarySubjectIds || [])].filter(Boolean);

    const matchesSubject =
      subjectFilter === 'ALL' || allSubjectIds.includes(subjectFilter);

    const matchesGrade =
      gradeFilter === 'ALL' || (Array.isArray(fac.grades) && fac.grades.some((g) => String(g).includes(gradeFilter)));

    return matchesSearch && matchesSubject && matchesGrade;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Top Filter & Actions Bar */}
      <div className="section-header">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search faculty by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* 1. Grade Filter (FIRST - FETCHED FROM BACKEND API) */}
          <select
            className="select-custom"
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setSubjectFilter('ALL');
            }}
          >
            <option value="ALL">All Grades</option>
            {uniqueGradeLevels.map((g) => (
              <option key={g} value={g}>
                Grade {g}
              </option>
            ))}
          </select>

          {/* 2. Subject Filter (SECOND - FILTERED BY SELECTED GRADE) */}
          <select
            className="select-custom"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="ALL">
              {gradeFilter === 'ALL' ? 'All Main Subjects' : `All Grade ${gradeFilter} Subjects`}
            </option>
            {filteredMainSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New Faculty
        </button>
      </div>

      {/* Faculty Cards Grid / Empty State */}
      {filteredFaculties.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Faculty Data Available"
          description="There are currently no teaching staff or faculty members matching the selected filters. Click below to add a new faculty profile."
          actionText="Add New Faculty"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="cards-grid">
          {filteredFaculties.map((fac) => {
            const allSubjectIds = [fac.primarySubjectId, ...(fac.secondarySubjectIds || [])].filter(Boolean);
            const coveredSubjects = subjects.filter((s) => allSubjectIds.includes(s.id));

            return (
              <div key={fac.id} className="glass-card faculty-card">
                <div>
                  <div className="card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div
                        className="faculty-avatar-lg"
                        style={{ background: fac.avatarColor || 'var(--primary)' }}
                      >
                        {(fac.name || 'F').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{fac.name}</h3>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                          {fac.empId || 'EMP-STAFF'}
                        </div>
                      </div>
                    </div>

                    <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
                      {fac.status || 'Active'}
                    </span>
                  </div>

                  {/* Covered Subjects */}
                  <div
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid var(--border-color)',
                      marginBottom: '0.85rem'
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
                      Subjects Covering ({coveredSubjects.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {coveredSubjects.length > 0 ? (
                        coveredSubjects.map((subj) => (
                          <span
                            key={subj.id}
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              background: `${subj.color || '#2563eb'}18`,
                              color: subj.color || '#2563eb',
                              border: `1px solid ${subj.color || '#2563eb'}40`
                            }}
                          >
                            {subj.name}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Unassigned</span>
                      )}
                    </div>
                  </div>

                  {/* Contact details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Mail size={14} color="var(--text-muted)" /> {fac.email || 'N/A'}
                    </div>
                    {fac.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} color="var(--text-muted)" /> {fac.phone}
                      </div>
                    )}
                  </div>

                  {/* Grades Undertaking */}
                  <div style={{ marginTop: '0.9rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                      Grades Undertaking:
                    </div>
                    <div className="card-tags">
                      {fac.grades && fac.grades.length > 0 ? (
                        fac.grades.map((grd) => (
                          <span key={grd} className="tag">
                            {grd}
                          </span>
                        ))
                      ) : (
                        <span className="tag">General</span>
                      )}
                    </div>
                  </div>

                  {/* Daily Workload limits */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      paddingTop: '0.5rem',
                      marginTop: '0.75rem',
                      borderTop: '1px solid var(--border-color)'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={13} /> Max Daily: <strong>{fac.maxPeriodsPerDay || 5} periods</strong>
                    </span>
                    <span>Weekly: <strong>{fac.maxPeriodsPerWeek || 25} periods</strong></span>
                  </div>
                </div>

                {/* Action Footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                    marginTop: '1.25rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-color)'
                  }}
                >
                  <button
                    className="btn btn-secondary btn-icon-only"
                    onClick={() => handleOpenEdit(fac)}
                    title="Edit Faculty Details"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn btn-danger btn-icon-only"
                    onClick={() => confirmDelete(fac)}
                    title="Remove Faculty Member"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <FacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facultyToEdit={facultyToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteFaculty(deleteTarget.id);
        }}
        title="Delete Faculty Member"
        message={`Are you sure you want to delete faculty member "${deleteTarget?.name}" (${deleteTarget?.empId})? This action cannot be undone.`}
        confirmText="Delete Faculty"
      />
    </div>
  );
}
