import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import FacultyModal from '../components/FacultyModal';
import { Plus, Search, Mail, Phone, Edit, Trash2, BookOpen, Clock } from 'lucide-react';

export default function FacultyManagement() {
  const { faculties, subjects, deleteFaculty } = useSchool();

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [facultyToEdit, setFacultyToEdit] = useState(null);

  const handleOpenAdd = () => {
    setFacultyToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fac) => {
    setFacultyToEdit(fac);
    setIsModalOpen(true);
  };

  const filteredFaculties = faculties.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(search.toLowerCase()) ||
      fac.empId.toLowerCase().includes(search.toLowerCase());

    const matchesSubject =
      subjectFilter === 'ALL' || fac.primarySubjectId === subjectFilter;

    const matchesGrade =
      gradeFilter === 'ALL' || fac.grades.some((g) => g.includes(gradeFilter));

    return matchesSearch && matchesSubject && matchesGrade;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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

          <select
            className="select-custom"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            <option value="ALL">All Main Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            className="select-custom"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="ALL">All Grades</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} /> Add New Faculty
        </button>
      </div>

      {/* Faculty Cards Grid */}
      <div className="cards-grid">
        {filteredFaculties.map((fac) => {
          const primarySubj = subjects.find((s) => s.id === fac.primarySubjectId);

          return (
            <div key={fac.id} className="glass-card faculty-card">
              <div>
                <div className="card-top">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div
                      className="faculty-avatar-lg"
                      style={{ background: fac.avatarColor || 'var(--primary)' }}
                    >
                      {fac.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{fac.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
                        {fac.empId}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
                    {fac.status}
                  </span>
                </div>

                {/* Main Subject Covering */}
                <div
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    border: '1px solid var(--border-color)',
                    marginBottom: '0.85rem'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Main Subject Covering
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: primarySubj?.color || 'var(--primary)', marginTop: '2px' }}>
                    {primarySubj ? primarySubj.name : 'Unassigned'}
                  </div>
                </div>

                {/* Contact details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={14} color="var(--text-muted)" /> {fac.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={14} color="var(--text-muted)" /> {fac.phone}
                  </div>
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
                    borderTop: '1px solid var(--border-color)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> Max Daily: <strong>{fac.maxPeriodsPerDay} periods</strong>
                  </span>
                  <span>Weekly: <strong>{fac.maxPeriodsPerWeek} periods</strong></span>
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
                  onClick={() => deleteFaculty(fac.id)}
                  title="Remove Faculty Member"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <FacultyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        facultyToEdit={facultyToEdit}
      />
    </div>
  );
}
