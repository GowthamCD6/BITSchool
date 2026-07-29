import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Layers,
  Plus,
  BookOpen,
  Users,
  Building2,
  Trash2,
  Edit2,
  Home,
  GraduationCap,
  Tv,
  Monitor,
  FlaskConical,
  BookMarked
} from 'lucide-react';
import Modal from '../components/Modal';

export default function PrimaryDataEntry() {
  const {
    classes,
    subjects,
    venues,
    venueTypes,
    addClass,
    updateClass,
    deleteClass,
    addSubject,
    updateSubject,
    deleteSubject,
    showToast
  } = useSchool();

  const [activeTab, setActiveTab] = useState('grades'); // 'grades' | 'courses'
  const [selectedCourseGrade, setSelectedCourseGrade] = useState('all'); // 'all' | '8' | '9' | '10' | '11' etc.

  // Extract unique Grade levels dynamically
  const uniqueGrades = Array.from(new Set(classes.map((c) => String(c.grade)))).sort(
    (a, b) => Number(a) - Number(b)
  );

  // New Grade Modal State
  const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
  const [newGradeLevel, setNewGradeLevel] = useState('12');

  // Section Modal States (Add / Edit)
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    grade: '10',
    section: 'A',
    studentCount: 38,
    homeVenueId: venues[0]?.id || ''
  });

  // Course / Subject Modal States (Add / Edit)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    weeklyPeriods: 6,
    requiredVenueType: 'normal',
    color: '#2563eb'
  });

  // ── Grade Level Handlers ──
  const handleAddGradeSubmit = (e) => {
    e.preventDefault();
    if (!newGradeLevel) return;

    if (uniqueGrades.includes(String(newGradeLevel))) {
      showToast(`Grade ${newGradeLevel} is already configured in the system.`, 'warning');
      return;
    }

    // Automatically create default section 'A' for new Grade
    const defaultClassName = `Grade ${newGradeLevel}-A`;
    addClass({
      name: defaultClassName,
      grade: String(newGradeLevel),
      section: 'A',
      studentCount: 35,
      homeVenueId: venues[0]?.id || ''
    });

    setIsAddGradeModalOpen(false);
    showToast(`Grade ${newGradeLevel} created with initial section Grade ${newGradeLevel}-A.`);
  };

  // ── Section Handlers ──
  const openSectionModal = (targetGrade = '10', sectionToEdit = null) => {
    if (sectionToEdit) {
      setEditingSection(sectionToEdit);
      setSectionForm({ ...sectionToEdit });
    } else {
      setEditingSection(null);
      setSectionForm({
        grade: String(targetGrade),
        section: 'C',
        studentCount: 38,
        homeVenueId: venues[0]?.id || ''
      });
    }
    setIsSectionModalOpen(true);
  };

  const handleSectionSubmit = (e) => {
    e.preventDefault();
    const className = `Grade ${sectionForm.grade}-${sectionForm.section.toUpperCase()}`;

    if (editingSection) {
      updateClass({
        ...editingSection,
        ...sectionForm,
        name: className,
        section: sectionForm.section.toUpperCase(),
        studentCount: Number(sectionForm.studentCount) || 35
      });
    } else {
      if (classes.some((c) => c.name === className)) {
        showToast(`Section "${className}" already exists.`, 'warning');
        return;
      }
      addClass({
        name: className,
        grade: String(sectionForm.grade),
        section: sectionForm.section.toUpperCase(),
        studentCount: Number(sectionForm.studentCount) || 35,
        homeVenueId: sectionForm.homeVenueId
      });
    }

    setIsSectionModalOpen(false);
  };

  // ── Course / Subject Handlers ──
  const openCourseModal = (subjToEdit = null) => {
    if (subjToEdit) {
      setEditingSubject(subjToEdit);
      setCourseForm({ ...subjToEdit });
    } else {
      setEditingSubject(null);
      setCourseForm({
        code: '',
        name: '',
        weeklyPeriods: 6,
        requiredVenueType: 'normal',
        color: '#2563eb'
      });
    }
    setIsCourseModalOpen(true);
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    if (!courseForm.code || !courseForm.name) {
      showToast('Please specify Course Code and Name.', 'warning');
      return;
    }

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        ...courseForm,
        weeklyPeriods: Number(courseForm.weeklyPeriods) || 5
      });
    } else {
      addSubject({
        ...courseForm,
        weeklyPeriods: Number(courseForm.weeklyPeriods) || 5
      });
    }

    setIsCourseModalOpen(false);
  };

  const getVenueBadge = (typeId) => {
    if (typeId === 'projector') return <span className="badge badge-projector"><Tv size={12} /> Projector Room</span>;
    if (typeId === 'computer_lab') return <span className="badge badge-lab"><Monitor size={12} /> Computer Lab</span>;
    if (typeId === 'science_lab') return <span className="badge badge-science"><FlaskConical size={12} /> Science Lab</span>;
    return <span className="badge badge-normal"><BookOpen size={12} /> Normal Class</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Overview Stat Summary Bar ── */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div>
            <div className="stat-lbl">Active Grade Levels</div>
            <div className="stat-val">{uniqueGrades.length} Grades</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', marginTop: '0.35rem', fontWeight: 600 }}>
              Grades {uniqueGrades.join(', ')}
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <GraduationCap size={26} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <div className="stat-lbl">Total Class Sections</div>
            <div className="stat-val">{classes.length} Sections</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontWeight: 600 }}>
              {classes.reduce((sum, c) => sum + c.studentCount, 0)} Enrolled Students
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <BookOpen size={26} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <div className="stat-lbl">Master Course Curriculum</div>
            <div className="stat-val">{subjects.length} Courses</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', marginTop: '0.35rem', fontWeight: 600 }}>
              {subjects.reduce((sum, s) => sum + s.weeklyPeriods, 0)} Total Period Quotas
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <BookMarked size={26} />
          </div>
        </div>
      </div>

      {/* ── Main Tab Switcher Bar ── */}
      <div className="section-header">
        <div
          style={{
            display: 'flex',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            background: '#f1f5f9',
            border: '1px solid var(--border-color)'
          }}
        >
          <button
            className={`btn ${activeTab === 'grades' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('grades')}
          >
            <GraduationCap size={16} /> Grade & Section Setup ({uniqueGrades.length} Grades)
          </button>

          <button
            className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1.1rem', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('courses')}
          >
            <BookMarked size={16} /> Master Course & Grade Mapping ({subjects.length} Courses)
          </button>
        </div>

        {activeTab === 'grades' ? (
          <button className="btn btn-primary" onClick={() => setIsAddGradeModalOpen(true)}>
            <Plus size={16} /> Add Grade Level
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => openCourseModal()}>
            <Plus size={16} /> Add / Assign Course
          </button>
        )}
      </div>

      {/* ── WORKSPACE 1: GRADE & SECTION SETUP ── */}
      {activeTab === 'grades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {uniqueGrades.map((grd) => {
            const gradeClasses = classes.filter((c) => String(c.grade) === String(grd));
            const totalStudentsInGrade = gradeClasses.reduce((sum, c) => sum + c.studentCount, 0);

            return (
              <div key={grd} className="glass-card" style={{ padding: '1.5rem' }}>
                {/* Grade Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '1rem',
                    marginBottom: '1.25rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        padding: '0.45rem 1.1rem',
                        borderRadius: 'var(--radius-md)',
                        background: '#2563eb',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <GraduationCap size={20} /> Grade {grd}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {gradeClasses.length} Section{gradeClasses.length !== 1 ? 's' : ''} Configured
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {totalStudentsInGrade} Total Enrolled Students
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                    onClick={() => openSectionModal(grd)}
                  >
                    <Plus size={14} /> Add Section to Grade {grd}
                  </button>
                </div>

                {/* Section Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.2rem' }}>
                  {gradeClasses.map((cls) => {
                    const homeVen = venues.find((v) => v.id === cls.homeVenueId);
                    return (
                      <div
                        key={cls.id}
                        style={{
                          padding: '1.1rem',
                          borderRadius: 'var(--radius-md)',
                          background: '#f8fafc',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                              {cls.name}
                            </h4>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                              Section Letter: <strong>{cls.section}</strong>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              className="btn btn-secondary btn-icon-only"
                              style={{ width: '30px', height: '30px' }}
                              onClick={() => openSectionModal(grd, cls)}
                              title="Edit Section"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className="btn btn-danger btn-icon-only"
                              style={{ width: '30px', height: '30px' }}
                              onClick={() => deleteClass(cls.id)}
                              title="Delete Section"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid var(--border-color)',
                            fontSize: '0.82rem'
                          }}
                        >
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-sub)' }}>
                            <Users size={14} color="#2563eb" /> <strong>{cls.studentCount}</strong> Students
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-purple)', fontWeight: 700 }}>
                            <Home size={14} /> Room: {homeVen ? homeVen.roomNo : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── WORKSPACE 2: MASTER COURSE & GRADE CURRICULUM MAPPING ── */}
      {activeTab === 'courses' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Master Course Curriculum & Weekly Target Periods</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Manage course offerings, target weekly period quotas (e.g. Maths 8 periods/week), and required classroom facilities.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Grade Filter Pills */}
              <div style={{ display: 'flex', gap: '0.3rem', background: '#f1f5f9', padding: '0.2rem', borderRadius: 'var(--radius-md)' }}>
                <button
                  className={`btn ${selectedCourseGrade === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', border: 'none' }}
                  onClick={() => setSelectedCourseGrade('all')}
                >
                  All Grades
                </button>
                {uniqueGrades.map((g) => (
                  <button
                    key={g}
                    className={`btn ${selectedCourseGrade === String(g) ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', border: 'none' }}
                    onClick={() => setSelectedCourseGrade(String(g))}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>

              <button className="btn btn-primary" onClick={() => openCourseModal()}>
                <Plus size={16} /> Add / Assign Course
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Course Code</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Course / Subject Name</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Weekly Target Periods</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Required Venue Facility</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subj) => (
                  <tr key={subj.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          background: subj.color || '#2563eb',
                          marginRight: '0.5rem'
                        }}
                      ></span>
                      {subj.code}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: subj.color || '#2563eb' }}>
                      {subj.name}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700 }}>
                      <span className="badge badge-normal" style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        {subj.weeklyPeriods} Periods / Week
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {getVenueBadge(subj.requiredVenueType)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-icon-only" onClick={() => openCourseModal(subj)} title="Edit Target Quota">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon-only" onClick={() => deleteSubject(subj.id)} title="Delete Course">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD NEW GRADE LEVEL ── */}
      <Modal
        isOpen={isAddGradeModalOpen}
        onClose={() => setIsAddGradeModalOpen(false)}
        title="Add New School Grade Level"
      >
        <form onSubmit={handleAddGradeSubmit}>
          <div className="form-group">
            <label>Grade Level (e.g. 1, 2, 6, 8, 9, 10, 11, 12)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 12"
              value={newGradeLevel}
              onChange={(e) => setNewGradeLevel(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, background: 'transparent', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddGradeModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Configure Grade {newGradeLevel}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: ADD / EDIT SECTION IN GRADE ── */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={editingSection ? `Edit Section: ${editingSection.name}` : `Add Section to Grade ${sectionForm.grade}`}
      >
        <form onSubmit={handleSectionSubmit}>
          <div className="form-group">
            <label>Grade Level</label>
            <input
              type="text"
              className="form-control"
              value={sectionForm.grade}
              onChange={(e) => setSectionForm({ ...sectionForm, grade: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Section Letter / Identifier (e.g. A, B, C)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. A, B, C"
              value={sectionForm.section}
              onChange={(e) => setSectionForm({ ...sectionForm, section: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Student Capacity / Enrolled Count</label>
            <input
              type="number"
              className="form-control"
              min="1"
              max="100"
              value={sectionForm.studentCount}
              onChange={(e) => setSectionForm({ ...sectionForm, studentCount: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Assigned Home Classroom Venue</label>
            <select
              className="form-control"
              value={sectionForm.homeVenueId}
              onChange={(e) => setSectionForm({ ...sectionForm, homeVenueId: e.target.value })}
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.roomNo} - {v.name} ({v.type})
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer" style={{ padding: 0, background: 'transparent', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSectionModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSection ? 'Update Section' : 'Create Section'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: ADD / EDIT COURSE ── */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={editingSubject ? `Edit Course: ${editingSubject.code}` : 'Add / Assign Master Course'}
      >
        <form onSubmit={handleCourseSubmit}>
          <div className="form-group">
            <label>Course Code</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. MATH101, ENG101"
              value={courseForm.code}
              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value.toUpperCase() })}
              required
            />
          </div>

          <div className="form-group">
            <label>Course / Subject Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Mathematics, Physics"
              value={courseForm.name}
              onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Target Weekly Periods Allocation (e.g. 8 for Maths)</label>
            <input
              type="number"
              className="form-control"
              min="1"
              max="15"
              value={courseForm.weeklyPeriods}
              onChange={(e) => setCourseForm({ ...courseForm, weeklyPeriods: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Required Classroom Facility Type</label>
            <select
              className="form-control"
              value={courseForm.requiredVenueType}
              onChange={(e) => setCourseForm({ ...courseForm, requiredVenueType: e.target.value })}
            >
              {venueTypes.map((vt) => (
                <option key={vt.id} value={vt.id}>
                  {vt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Course Tag Color</label>
            <input
              type="color"
              className="form-control"
              style={{ height: '42px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
              value={courseForm.color}
              onChange={(e) => setCourseForm({ ...courseForm, color: e.target.value })}
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, background: 'transparent', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCourseModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSubject ? 'Update Course' : 'Save Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
