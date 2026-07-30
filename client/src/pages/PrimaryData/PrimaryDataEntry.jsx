import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
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
  BookMarked,
  Activity,
  Music,
  Dumbbell,
  Trophy,
  Video,
  Sparkles,
  Clock
} from 'lucide-react';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';

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
    showToast,
    // ECA Context State
    ecaVerticals,
    ecaSchedule,
    updateEcaCell,
    addEcaVertical,
    deleteEcaVertical
  } = useSchool();

  // Deletion Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'class' | 'subject' | 'eca', data: object | string }

  const [activeTab, setActiveTab] = useState('grades'); // 'grades' | 'courses' | 'eca'
  const [selectedClassGrade, setSelectedClassGrade] = useState('all');
  const [selectedCourseGrade, setSelectedCourseGrade] = useState('all');
  const [selectedEcaGrade, setSelectedEcaGrade] = useState('all');

  // Extract unique Grade levels dynamically from class models safely
  const getGradeNum = (c) => {
    if (!c) return '10';
    if (typeof c.grade === 'object' && c.grade !== null) {
      return String(c.grade.name || c.grade.id || '10').replace('Grade ', '');
    }
    if (c.gradeName) return String(c.gradeName).replace('Grade ', '');
    return String(c.grade || '10').replace('Grade ', '');
  };

  const uniqueGrades = Array.from(new Set(classes.map(getGradeNum))).sort(
    (a, b) => Number(a) - Number(b)
  );

  // Derived filtered classes
  const filteredClasses = selectedClassGrade === 'all'
    ? classes
    : classes.filter((c) => getGradeNum(c) === String(selectedClassGrade));

  // Derived filtered subjects
  const filteredSubjects = selectedCourseGrade === 'all'
    ? subjects
    : subjects.filter((s) => !s.grade || String(s.grade) === String(selectedCourseGrade) || (Array.isArray(s.grades) && s.grades.includes(String(selectedCourseGrade))));



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

  // ── ECA Modal States ──
  const [isEcaModalOpen, setIsEcaModalOpen] = useState(false);
  const [editingEcaTarget, setEditingEcaTarget] = useState({ day: '', vertical: '' });
  const [ecaForm, setEcaForm] = useState({
    active: false,
    label: 'No',
    duration: '30 mins',
    target: 'All',
    color: '#059669'
  });

  const [isAddVerticalModalOpen, setIsAddVerticalModalOpen] = useState(false);
  const [newVerticalName, setNewVerticalName] = useState('');

  // ── Grade Handlers ──
  const handleCreateGrade = (e) => {
    e.preventDefault();
    if (!newGradeLevel) return;

    if (uniqueGrades.includes(String(newGradeLevel))) {
      showToast(`Grade ${newGradeLevel} is already configured in the system.`, 'warning');
      return;
    }

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

  // ── ECA Cell Edit Handlers ──
  const openEcaModal = (day, vertical) => {
    const currentSlot = ecaSchedule[day]?.[vertical] || { active: false, label: 'No' };
    setEditingEcaTarget({ day, vertical });
    setEcaForm({
      active: currentSlot.active || false,
      label: currentSlot.label || (currentSlot.active ? 'Yes' : 'No'),
      duration: currentSlot.duration || '30 mins',
      target: currentSlot.target || 'All',
      color: currentSlot.color || '#059669'
    });
    setIsEcaModalOpen(true);
  };

  const handleEcaSubmit = (e) => {
    e.preventDefault();
    const { day, vertical } = editingEcaTarget;
    if (!day || !vertical) return;

    let finalLabel = 'No';
    if (ecaForm.active) {
      if (ecaForm.target === 'Girls') {
        finalLabel = `Yes - Girls (${ecaForm.duration})`;
      } else if (ecaForm.target === 'Boys') {
        finalLabel = `Yes - Boys (${ecaForm.duration})`;
      } else {
        finalLabel = `Yes (${ecaForm.duration})`;
      }
    }

    const newCellData = {
      active: ecaForm.active,
      label: finalLabel,
      duration: ecaForm.duration,
      target: ecaForm.target,
      color: ecaForm.color
    };

    updateEcaCell(day, vertical, newCellData);
    setIsEcaModalOpen(false);
  };

  const handleAddVerticalSubmit = (e) => {
    e.preventDefault();
    if (!newVerticalName.trim()) return;
    addEcaVertical(newVerticalName.trim());
    setNewVerticalName('');
    setIsAddVerticalModalOpen(false);
  };

  const getVenueBadge = (typeId) => {
    if (typeId === 'projector') return <span className="badge badge-projector"><Tv size={12} /> Projector Room</span>;
    if (typeId === 'computer_lab') return <span className="badge badge-lab"><Monitor size={12} /> Computer Lab</span>;
    if (typeId === 'science_lab') return <span className="badge badge-science"><FlaskConical size={12} /> Science Lab</span>;
    return <span className="badge badge-normal"><BookOpen size={12} /> Normal Class</span>;
  };

  const daysList = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  // Calculate totals for ECA verticals
  const calculateEcaTotal = (vertical) => {
    let totalMins = 0;
    daysList.forEach(day => {
      const slot = ecaSchedule[day]?.[vertical];
      if (slot && slot.active) {
        const dur = slot.duration || '';
        if (dur.includes('hour')) {
          const hrs = parseFloat(dur) || 1;
          totalMins += hrs * 60;
        } else if (dur.includes('min')) {
          const mins = parseInt(dur) || 0;
          totalMins += mins;
        }
      }
    });

    if (totalMins === 0) return '0 mins';
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0 && m > 0) return `${h} hour ${m} mins`;
    if (h > 0) return `${h} hour${h > 1 ? 's' : ''}`;
    return `${m} mins`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Main Tab Switcher Header (Attached to Top & Full Width) ── */}
      <div className="section-header">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            background: '#f1f5f9',
            border: '1px solid var(--border-color)',
            gap: '0.25rem'
          }}
        >
          <button
            className={`btn ${activeTab === 'grades' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('grades')}
          >
            <BookOpen size={16} /> Classes & Sections ({classes.length})
          </button>

          <button
            className={`btn ${activeTab === 'courses' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('courses')}
          >
            <BookMarked size={16} /> Master Course Curriculum ({subjects.length} Courses)
          </button>

          <button
            className={`btn ${activeTab === 'eca' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('eca')}
          >
            <Activity size={16} /> Non Academics & ECA Schedule ({ecaVerticals.length} Verticals)
          </button>
        </div>

        {activeTab === 'grades' && (
          <button
            className="btn btn-primary"
            onClick={() => openSectionModal(selectedClassGrade === 'all' ? '10' : selectedClassGrade)}
          >
            <Plus size={16} /> Add Class Section
          </button>
        )}

        {activeTab === 'courses' && (
          <button className="btn btn-primary" onClick={() => openCourseModal()}>
            <Plus size={16} /> Add Master Course
          </button>
        )}

        {activeTab === 'eca' && (
          <button className="btn btn-primary" onClick={() => setIsAddVerticalModalOpen(true)}>
            <Plus size={16} /> Add ECA Vertical
          </button>
        )}
      </div>

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

        <div className="glass-card stat-card">
          <div>
            <div className="stat-lbl">ECA & Non-Academics</div>
            <div className="stat-val">{ecaVerticals.length} Verticals</div>
            <div style={{ fontSize: '0.78rem', color: '#db2777', marginTop: '0.35rem', fontWeight: 600 }}>
              Physical Fitness, Music & Sports
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}>
            <Activity size={26} />
          </div>
        </div>
      </div>

      {/* ── WORKSPACE 1: CLASSES & SECTIONS SETUP ── */}
      {activeTab === 'grades' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Grade Filter Pill Selector & Action Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                Filter Classes by Grade:
              </span>
              <button
                className={`btn ${selectedClassGrade === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setSelectedClassGrade('all')}
              >
                All Grades ({classes.length} Sections)
              </button>
              {uniqueGrades.map((g) => {
                const count = classes.filter((c) => getGradeNum(c) === String(g)).length;
                return (
                  <button
                    key={g}
                    className={`btn ${selectedClassGrade === g ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                    onClick={() => setSelectedClassGrade(g)}
                  >
                    Grade {g} ({count})
                  </button>
                );
              })}
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              onClick={() => openSectionModal(selectedClassGrade === 'all' ? '10' : selectedClassGrade)}
            >
              <Plus size={16} /> Add Class Section
            </button>
          </div>


          {/* Grouped Grade Level Cards */}
          {(selectedClassGrade === 'all' ? uniqueGrades : [selectedClassGrade]).map((grd) => {
            const gradeClasses = classes.filter((c) => getGradeNum(c) === String(grd));
            const totalStudentsInGrade = gradeClasses.reduce((sum, c) => sum + (Number(c.studentCount) || 0), 0);

            return (
              <div key={grd} className="glass-card" style={{ padding: '1.5rem' }}>
                {/* Grade Card Header */}
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
                        fontSize: '1.05rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      Grade {grd}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Grade Level {grd} Academic Standard
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {gradeClasses.length} Active Class Section{gradeClasses.length > 1 ? 's' : ''} · {totalStudentsInGrade} Total Enrolled Students
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    onClick={() => openSectionModal(grd)}
                  >
                    <Plus size={14} /> Add Section to Grade {grd}
                  </button>
                </div>

                {/* Section Cards Grid for this Grade */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.25rem'
                  }}
                >
                  {gradeClasses.map((cls) => {
                    const venue = venues.find((v) => v.id === cls.homeVenueId);

                    return (
                      <div
                        key={cls.id}
                        style={{
                          background: '#ffffff',
                          border: '1.5px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                          boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                            <span
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: '#eff6ff',
                                color: '#2563eb',
                                fontWeight: 800,
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #bfdbfe'
                              }}
                            >
                              {cls.section}
                            </span>
                            <div>
                              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                {cls.name}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Academic Section {cls.section}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.6rem' }}
                              onClick={() => openSectionModal(cls.grade, cls)}
                              title="Edit Section"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.6rem', color: '#ef4444' }}
                              onClick={() => setDeleteTarget({ type: 'class', data: cls })}
                              title="Delete Section"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            fontSize: '0.82rem'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Users size={14} /> Student Capacity:
                            </span>
                            <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                              {cls.studentCount} Students
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Home size={14} /> Assigned Classroom:
                            </span>
                            <span style={{ fontWeight: 700, color: '#0284c7' }}>
                              {venue ? `${venue.roomNo} (${venue.type === 'projector' ? 'Projector Room' : 'Standard Room'})` : 'Main Classroom'}
                            </span>
                          </div>
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


      {/* ── WORKSPACE 2: MASTER COURSE CURRICULUM ── */}
      {activeTab === 'courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Grade Filter Pill Selector & Action Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                Filter by Target Grade:
              </span>
              <button
                className={`btn ${selectedCourseGrade === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setSelectedCourseGrade('all')}
              >
                All Grades ({subjects.length})
              </button>
              {uniqueGrades.map((g) => (
                <button
                  key={g}
                  className={`btn ${selectedCourseGrade === g ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => setSelectedCourseGrade(g)}
                >
                  Grade {g}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              onClick={() => openCourseModal()}
            >
              <Plus size={16} /> Add Course
            </button>
          </div>

          {/* Master Course Table */}
          <div className="glass-card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Subject / Course Name</th>
                  <th>Weekly Target Quota</th>
                  <th>Required Facility Room</th>
                  <th>Color Tag</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.map((subj) => (
                  <tr key={subj.id}>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          background: '#eff6ff',
                          color: '#2563eb',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          fontFamily: 'monospace'
                        }}
                      >
                        {subj.code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{subj.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Standard Academic Curriculum
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: subj.weeklyPeriods >= 8 ? '#4f46e5' : '#0f172a',
                          fontSize: '0.9rem'
                        }}
                      >
                        {subj.weeklyPeriods} Periods / Week
                      </span>
                    </td>
                    <td>{getVenueBadge(subj.requiredVenueType)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '50%',
                            background: subj.color || '#2563eb',
                            display: 'inline-block',
                            border: '1px solid #cbd5e1'
                          }}
                        />
                        <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#64748b' }}>
                          {subj.color || '#2563eb'}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                          onClick={() => openCourseModal(subj)}
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem', color: '#ef4444' }}
                          onClick={() => setDeleteTarget({ type: 'subject', data: subj })}
                        >
                          <Trash2 size={13} /> Delete
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

      {/* ── WORKSPACE 3: NON ACADEMICS & ECA SCHEDULE ── */}
      {activeTab === 'eca' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* ECA Grade Filter Pill Selector & Action Button */}
          <div

            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.75rem 1rem',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                Filter ECA Schedule by Grade:
              </span>
              <button
                className={`btn ${selectedEcaGrade === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setSelectedEcaGrade('all')}
              >
                All Grades
              </button>
              {uniqueGrades.map((g) => (
                <button
                  key={g}
                  className={`btn ${selectedEcaGrade === g ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                  onClick={() => setSelectedEcaGrade(g)}
                >
                  Grade {g}
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              onClick={() => setIsAddVerticalModalOpen(true)}
            >
              <Plus size={16} /> Add ECA Vertical
            </button>
          </div>



          {/* ECA Matrix Table (Exact visual layout matching Non-Academics Excel sheet) */}
          <div className="eca-table-container">
            <table className="eca-matrix">
              <thead>
                <tr>
                  <th className="vertical-day-col">
                    VERTICALS /<br />DAYS
                  </th>
                  {ecaVerticals.map((vert) => (
                    <th key={vert}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                        <span>{vert}</span>
                        <button
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                          onClick={() => setDeleteTarget({ type: 'eca', data: vert })}
                          title={`Delete vertical "${vert}"`}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {daysList.map((day) => (
                  <tr key={day}>
                    <td style={{ fontWeight: 800, color: '#0f172a', background: '#f8fafc', textTransform: 'uppercase', fontSize: '0.82rem' }}>
                      {day}
                    </td>
                    {ecaVerticals.map((vert) => {
                      const slot = ecaSchedule[day]?.[vert] || { active: false, label: 'No' };

                      return (
                        <td key={vert}>
                          <button
                            className="eca-cell-btn"
                            onClick={() => openEcaModal(day, vert)}
                            title={`Click to edit ${vert} on ${day}`}
                          >
                            {slot.active ? (
                              <div
                                className="eca-badge-yes"
                                style={{
                                  background: slot.color ? `${slot.color}15` : '#ecfdf5',
                                  color: slot.color || '#059669',
                                  border: `1px solid ${slot.color ? `${slot.color}40` : '#a7f3d0'}`
                                }}
                              >
                                {slot.label}
                              </div>
                            ) : (
                              <span className="eca-badge-no">No</span>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* TOTAL with Saturday Row */}
                <tr className="total-row">
                  <td style={{ background: '#0f172a', color: '#ffffff', fontWeight: 800 }}>
                    TOTAL with saturday
                  </td>
                  {ecaVerticals.map((vert) => (
                    <td key={vert} style={{ background: '#f1f5f9', fontWeight: 800, color: '#0f172a' }}>
                      {calculateEcaTotal(vert)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD GRADE LEVEL ── */}
      <Modal
        isOpen={isAddGradeModalOpen}
        onClose={() => setIsAddGradeModalOpen(false)}
        title="Add New Grade Level"
      >
        <form onSubmit={handleCreateGrade}>
          <div className="form-group">
            <label>Grade Level (Number or Designation)</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. 12, 11, 7"
              value={newGradeLevel}
              onChange={(e) => setNewGradeLevel(e.target.value)}
              required
            />
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            Creating Grade <strong>{newGradeLevel}</strong> will automatically initialize Section A (Grade {newGradeLevel}-A) with default student capacity and classroom room assignment.
          </div>

          <div className="modal-footer" style={{ padding: 0, background: 'transparent' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddGradeModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Grade Level
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: ADD / EDIT SECTION ── */}
      <Modal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        title={editingSection ? `Edit Section ${editingSection.name}` : `Add Section to Grade ${sectionForm.grade}`}
      >
        <form onSubmit={handleSectionSubmit}>
          <div className="form-group">
            <label>Grade Level</label>
            <input type="text" className="form-control" value={sectionForm.grade} disabled readOnly />
          </div>

          <div className="form-group">
            <label>Section Designation Letter</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. A, B, C, D"
              maxLength="3"
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

      {/* ── MODAL: EDIT ECA CELL SLOT ── */}
      <Modal
        isOpen={isEcaModalOpen}
        onClose={() => setIsEcaModalOpen(false)}
        title={`Edit Activity: ${editingEcaTarget.vertical} on ${editingEcaTarget.day}`}
      >
        <form onSubmit={handleEcaSubmit}>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={ecaForm.active}
                onChange={(e) => setEcaForm({ ...ecaForm, active: e.target.checked })}
              />
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Activity Scheduled on this Day?</span>
            </label>
          </div>

          {ecaForm.active && (
            <>
              <div className="form-group">
                <label>Session Duration</label>
                <select
                  className="form-control"
                  value={ecaForm.duration}
                  onChange={(e) => setEcaForm({ ...ecaForm, duration: e.target.value })}
                >
                  <option value="5 mins">5 mins</option>
                  <option value="10 mins">10 mins</option>
                  <option value="15 mins">15 mins</option>
                  <option value="30 mins">30 mins</option>
                  <option value="45 mins">45 mins</option>
                  <option value="1 hour">1 hour</option>
                  <option value="1 hour 30 mins">1 hour 30 mins</option>
                </select>
              </div>

              <div className="form-group">
                <label>Target Audience / Group</label>
                <select
                  className="form-control"
                  value={ecaForm.target}
                  onChange={(e) => setEcaForm({ ...ecaForm, target: e.target.value })}
                >
                  <option value="All">All Students</option>
                  <option value="Girls">Girls Only</option>
                  <option value="Boys">Boys Only</option>
                </select>
              </div>

              <div className="form-group">
                <label>Badge Highlight Color</label>
                <input
                  type="color"
                  className="form-control"
                  style={{ height: '42px', padding: '0.2rem 0.5rem', cursor: 'pointer' }}
                  value={ecaForm.color}
                  onChange={(e) => setEcaForm({ ...ecaForm, color: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="modal-footer" style={{ padding: 0, background: 'transparent', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEcaModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save ECA Activity
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: ADD ECA VERTICAL ── */}
      <Modal
        isOpen={isAddVerticalModalOpen}
        onClose={() => setIsAddVerticalModalOpen(false)}
        title="Add New ECA Activity Vertical"
      >
        <form onSubmit={handleAddVerticalSubmit}>
          <div className="form-group">
            <label>Vertical / Activity Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Karate, Swimming, Robotics, Yoga"
              value={newVerticalName}
              onChange={(e) => setNewVerticalName(e.target.value)}
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: 0, background: 'transparent', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddVerticalModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Vertical
            </button>
          </div>
        </form>
      </Modal>

      {/* Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          if (deleteTarget.type === 'class') {
            deleteClass(deleteTarget.data.id);
          } else if (deleteTarget.type === 'subject') {
            deleteSubject(deleteTarget.data.id);
          } else if (deleteTarget.type === 'eca') {
            deleteEcaVertical(deleteTarget.data);
          }
        }}
        title={`Delete ${deleteTarget?.type === 'class' ? 'Class Section' : deleteTarget?.type === 'subject' ? 'Subject' : 'ECA Vertical'}`}
        message={`Are you sure you want to delete ${deleteTarget?.type === 'class' ? `class section "${deleteTarget?.data?.name}"` : deleteTarget?.type === 'subject' ? `subject "${deleteTarget?.data?.name}" (${deleteTarget?.data?.code})` : `ECA vertical "${deleteTarget?.data}"`}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
