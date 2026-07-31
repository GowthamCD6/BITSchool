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
  Clock,
  Coffee,
  Utensils
} from 'lucide-react';
import Modal from '../../components/Modal';
import ConfirmModal from '../../components/ConfirmModal';

export default function PrimaryDataEntry() {
  const {
    classes,
    subjects,
    venues,
    venueTypes,
    grades,
    addGrade,
    deleteGrade,
    addClass,
    updateClass,
    deleteClass,
    addSubject,
    updateSubject,
    deleteSubject,
    showToast,
    // ECA Context State
    ecaVerticals,
    ecaVerticalDetails,
    ecaSchedule,
    updateEcaCell,
    addEcaVertical,
    deleteEcaVertical,
    // Bell Schedule Time Slots
    timeSlots,
    addTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    bellConfig,
    saveBellConfig
  } = useSchool();

  // Deletion Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'class' | 'subject' | 'eca', data: object | string }

  const [activeTab, setActiveTab] = useState('grades'); // 'grades' | 'courses' | 'eca' | 'timeslots'
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

  // Extract unique Grade levels dynamically from MySQL grades table + classes
  const uniqueGrades = Array.from(
    new Set([
      ...(grades || []).map((g) => String(g.id || String(g.name).replace(/\D/g, ''))),
      ...classes.map(getGradeNum)
    ].filter(Boolean))
  ).sort((a, b) => Number(a) - Number(b));

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
  const [newGradeLevel, setNewGradeLevel] = useState('');

  const openAddGradeModal = () => {
    setNewGradeLevel('');
    setIsAddGradeModalOpen(true);
  };

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
  const [selectedVerticalGrades, setSelectedVerticalGrades] = useState([]);

  // ── Bell Schedule Timing Parameters Form State ──
  const [bellForm, setBellForm] = useState({
    schoolStartTime: '08:30 AM',
    morningBreakStart: '10:00 AM',
    morningBreakEnd: '10:15 AM',
    lunchBreakStart: '11:45 AM',
    lunchBreakEnd: '12:30 PM',
    afternoonBreakStart: '02:00 PM',
    afternoonBreakEnd: '02:15 PM',
    schoolEndTime: '03:45 PM'
  });

  React.useEffect(() => {
    if (bellConfig) {
      setBellForm({
        schoolStartTime: bellConfig.schoolStartTime || '08:30 AM',
        morningBreakStart: bellConfig.morningBreakStart || '10:00 AM',
        morningBreakEnd: bellConfig.morningBreakEnd || '10:15 AM',
        lunchBreakStart: bellConfig.lunchBreakStart || '11:45 AM',
        lunchBreakEnd: bellConfig.lunchBreakEnd || '12:30 PM',
        afternoonBreakStart: bellConfig.afternoonBreakStart || '02:00 PM',
        afternoonBreakEnd: bellConfig.afternoonBreakEnd || '02:15 PM',
        schoolEndTime: bellConfig.schoolEndTime || '03:45 PM'
      });
    }
  }, [bellConfig]);

  const handleSaveBellConfig = async (e) => {
    e.preventDefault();
    await saveBellConfig(bellForm);
  };
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({
    slotNo: 1,
    name: 'Period 1',
    startTime: '08:30',
    endTime: '09:15',
    type: 'period',
    color: '#2563eb'
  });

  const openSlotModal = (slot = null) => {
    if (slot) {
      setEditingSlot(slot);
      setSlotForm({
        slotNo: slot.slotNo || ((timeSlots || []).length + 1),
        name: slot.name || '',
        startTime: slot.startTime || '08:30',
        endTime: slot.endTime || '09:15',
        type: slot.type || 'period',
        color: slot.color || (slot.type === 'break' ? '#f59e0b' : slot.type === 'lunch' ? '#ef4444' : '#2563eb')
      });
    } else {
      setEditingSlot(null);
      const nextNo = (timeSlots || []).length + 1;
      setSlotForm({
        slotNo: nextNo,
        name: `Period ${nextNo}`,
        startTime: '08:30',
        endTime: '09:15',
        type: 'period',
        color: '#2563eb'
      });
    }
    setIsSlotModalOpen(true);
  };

  const handleSlotFormSubmit = async (e) => {
    e.preventDefault();
    if (!slotForm.name.trim() || !slotForm.startTime || !slotForm.endTime) return;

    if (editingSlot) {
      await updateTimeSlot({
        ...editingSlot,
        ...slotForm
      });
    } else {
      await addTimeSlot(slotForm);
    }
    setIsSlotModalOpen(false);
  };

  const calculateSlotDuration = (start, end) => {
    if (!start || !end) return '0 mins';
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return '0 mins';
    let totalMins = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (totalMins < 0) totalMins += 24 * 60;
    if (totalMins >= 60) {
      const hrs = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return mins > 0 ? `${hrs}h ${mins}m` : `${hrs} hr${hrs > 1 ? 's' : ''}`;
    }
    return `${totalMins} mins`;
  };

  // ── Grade Handlers ──
  const handleCreateGrade = async (e) => {
    e.preventDefault();
    if (!newGradeLevel) return;

    if (uniqueGrades.includes(String(newGradeLevel))) {
      showToast(`Grade ${newGradeLevel} is already configured in the system.`, 'warning');
      return;
    }

    const gNum = Number(newGradeLevel);
    let gLevel = 'High School';
    if (gNum >= 11) gLevel = 'Higher Secondary';
    else if (gNum >= 9) gLevel = 'High School';
    else if (gNum >= 6) gLevel = 'Middle School';
    else gLevel = 'Primary School';

    // 1. Save grade record into MySQL 'grades' table
    await addGrade({
      id: isNaN(gNum) ? undefined : gNum,
      name: `Grade ${newGradeLevel}`,
      level: gLevel
    });

    setIsAddGradeModalOpen(false);
  };

  const confirmDeleteGrade = (grd) => {
    const targetGrade = grades.find((g) => String(g.id) === String(grd) || g.name === `Grade ${grd}`) || { id: grd, name: `Grade ${grd}` };
    setDeleteTarget({
      type: 'grade',
      data: targetGrade
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'grade') {
      const gId = deleteTarget.data.id || deleteTarget.data;
      await deleteGrade(gId);
      const associatedClasses = classes.filter((c) => getGradeNum(c) === String(gId));
      for (const cls of associatedClasses) {
        await deleteClass(cls.id);
      }
    } else if (deleteTarget.type === 'class') {
      await deleteClass(deleteTarget.data.id);
    } else if (deleteTarget.type === 'subject') {
      await deleteSubject(deleteTarget.data.id);
    } else if (deleteTarget.type === 'eca') {
      await deleteEcaVertical(deleteTarget.data.id || deleteTarget.data);
    } else if (deleteTarget.type === 'slot') {
      await deleteTimeSlot(deleteTarget.data.id);
    }

    setDeleteTarget(null);
  };

  // ── Section Handlers ──
  const openSectionModal = (targetGrade = '10', sectionToEdit = null) => {
    if (sectionToEdit) {
      setEditingSection(sectionToEdit);
      const gVal = getGradeNum(sectionToEdit);
      setSectionForm({
        ...sectionToEdit,
        grade: `Grade ${gVal}`,
        section: sectionToEdit.section || '',
        studentCount: sectionToEdit.studentCount !== undefined ? sectionToEdit.studentCount : '',
        homeVenueId: sectionToEdit.homeVenueId || (venues[0]?.id || '')
      });
    } else {
      setEditingSection(null);
      const gVal = typeof targetGrade === 'object' ? getGradeNum({ grade: targetGrade }) : String(targetGrade).replace('Grade ', '');
      setSectionForm({
        grade: `Grade ${gVal || '10'}`,
        section: '',
        studentCount: '',
        homeVenueId: venues[0]?.id || ''
      });
    }
    setIsSectionModalOpen(true);
  };

  const handleSectionSubmit = (e) => {
    e.preventDefault();
    const cleanGradeNum = String(sectionForm.grade).replace('Grade ', '').trim();
    const className = `Grade ${cleanGradeNum}-${sectionForm.section.toUpperCase()}`;

    if (editingSection) {
      updateClass({
        ...editingSection,
        name: className,
        grade: cleanGradeNum,
        section: sectionForm.section.toUpperCase(),
        studentCount: Number(sectionForm.studentCount) || 35,
        homeVenueId: sectionForm.homeVenueId
      });
    } else {
      if (classes.some((c) => c.name === className)) {
        showToast(`Section "${className}" already exists.`, 'warning');
        return;
      }
      addClass({
        name: className,
        grade: cleanGradeNum,
        section: sectionForm.section.toUpperCase(),
        studentCount: Number(sectionForm.studentCount) || 35,
        homeVenueId: sectionForm.homeVenueId
      });
    }

    setIsSectionModalOpen(false);
  };

  // ── Helper: Format duration to HH:MM ──
  const formatToHHMM = (val) => {
    if (!val && val !== 0) return '06:00';
    const str = String(val).trim();
    if (/^\d{2}:\d{2}$/.test(str)) return str;
    if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str.substring(0, 5);
    if (/^\d{1,2}:\d{2}$/.test(str)) {
      const [h, m] = str.split(':');
      return `${String(h).padStart(2, '0')}:${m}`;
    }
    const num = parseFloat(str);
    if (!isNaN(num)) {
      const hrs = Math.floor(num);
      const mins = Math.round((num - hrs) * 60);
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }
    return '06:00';
  };

  const parseHHMMToHours = (val) => {
    if (!val && val !== 0) return 0;
    const str = String(val).trim();
    if (/^\d{2}:\d{2}/.test(str)) {
      const [h, m] = str.split(':').map(Number);
      return h + (m || 0) / 60;
    }
    return parseFloat(str) || 0;
  };

  // ── Course / Subject Handlers ──
  const openCourseModal = (targetGrade = null, subjToEdit = null) => {
    let gVal = '';
    let editObj = subjToEdit;

    if (typeof targetGrade === 'object' && targetGrade !== null) {
      editObj = targetGrade;
      gVal = String(editObj.grade || selectedCourseGrade || uniqueGrades[0] || '10').replace('Grade ', '');
    } else if (targetGrade) {
      gVal = String(targetGrade).replace('Grade ', '');
    } else {
      gVal = String(selectedCourseGrade !== 'all' ? selectedCourseGrade : (uniqueGrades[0] || '10')).replace('Grade ', '');
    }

    if (editObj) {
      setEditingSubject(editObj);
      setCourseForm({
        ...editObj,
        grade: String(editObj.grade || gVal).replace('Grade ', ''),
        weeklyDuration: formatToHHMM(editObj.weeklyDuration || editObj.weeklyPeriods || '06:00'),
        weeklyPeriods: Number(editObj.weeklyPeriods) || 6
      });
    } else {
      setEditingSubject(null);
      setCourseForm({
        code: '',
        name: '',
        grade: gVal || (uniqueGrades[0] || '10'),
        weeklyDuration: '06:00',
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

    const cleanGrade = String(courseForm.grade || uniqueGrades[0] || '10').replace('Grade ', '').trim();
    const formattedDuration = formatToHHMM(courseForm.weeklyDuration);
    const periodsCount = Number(courseForm.weeklyPeriods) || 6;

    if (editingSubject) {
      updateSubject({
        ...editingSubject,
        ...courseForm,
        grade: cleanGrade,
        weeklyDuration: formattedDuration,
        weeklyPeriods: periodsCount
      });
    } else {
      addSubject({
        ...courseForm,
        grade: cleanGrade,
        weeklyDuration: formattedDuration,
        weeklyPeriods: periodsCount
      });
    }

    setIsCourseModalOpen(false);
  };

  // ── ECA Cell Edit Handlers ──
  const openEcaModal = (day, vertical, grade) => {
    const targetG = grade || selectedEcaGrade || uniqueGrades[0] || '4';
    const key = `${targetG}_${day}`;
    const currentSlot = ecaSchedule[key]?.[vertical] || { active: false, label: 'No' };
    setEditingEcaTarget({ day, vertical, grade: targetG });
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
    const { day, vertical, grade } = editingEcaTarget;
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

    updateEcaCell(day, vertical, newCellData, grade || selectedEcaGrade || '4');
    setIsEcaModalOpen(false);
  };

  const handleAddVerticalSubmit = (e) => {
    e.preventDefault();
    if (!newVerticalName.trim()) return;
    addEcaVertical(newVerticalName.trim(), selectedVerticalGrades);
    setNewVerticalName('');
    setSelectedVerticalGrades([]);
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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

          <button
            className={`btn ${activeTab === 'timeslots' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', border: 'none' }}
            onClick={() => setActiveTab('timeslots')}
          >
            <Clock size={16} /> Daily Bell Schedule & Time Slots ({(timeSlots || []).length} Slots)
          </button>
        </div>

        {activeTab === 'grades' && (
          <button
            className="btn btn-primary"
            onClick={openAddGradeModal}
          >
            <Plus size={16} /> Add Grade Level
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

        {activeTab === 'timeslots' && (
          <button className="btn btn-primary" onClick={() => openSlotModal()}>
            <Plus size={16} /> Add Time Slot
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
            <div className="stat-lbl">Master Course Subjects</div>
            <div className="stat-val">{subjects.length} Courses</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-indigo)', marginTop: '0.35rem', fontWeight: 600 }}>
              Academic Core Curriculum
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <BookMarked size={26} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
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
              onClick={openAddGradeModal}
            >
              <Plus size={16} /> Add Grade Level
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => openSectionModal(grd)}
                    >
                      <Plus size={14} /> Add Section to Grade {grd}
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
                      title={`Delete Grade ${grd}`}
                      onClick={() => confirmDeleteGrade(grd)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Section Cards Grid / Empty State for this Grade */}
                {gradeClasses.length === 0 ? (
                  <div
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 500 }}>
                      No class sections created for <strong>Grade {grd}</strong> yet. Click the button to add sections.
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => openSectionModal(grd)}
                    >
                      <Plus size={14} /> Add Section to Grade {grd}
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
            );
          })}
        </div>
      )}


      {/* ── WORKSPACE 2: MASTER COURSE CURRICULUM ── */}
      {activeTab === 'courses' && (
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
                Select Target Grade:
              </span>
              {uniqueGrades.map((g) => {
                const isSel = (selectedCourseGrade === g) || (selectedCourseGrade === 'all' && uniqueGrades[0] === g);
                return (
                  <button
                    key={g}
                    className={`btn ${isSel ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                    onClick={() => setSelectedCourseGrade(g)}
                  >
                    Grade {g}
                  </button>
                );
              })}
            </div>

            <button
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
              onClick={() => openCourseModal(selectedCourseGrade !== 'all' ? selectedCourseGrade : uniqueGrades[0])}
            >
              <Plus size={16} /> Add Course
            </button>
          </div>

          {/* Grouped Grade Level Cards for Courses */}
          {(selectedCourseGrade === 'all' ? uniqueGrades : [selectedCourseGrade || uniqueGrades[0]]).map((grd) => {
            const gradeSubjects = subjects.filter((s) => {
              if (!s.grade) return true; // Show general courses or matched grade courses
              const gStr = String(s.grade).replace('Grade ', '').trim();
              return gStr === String(grd) || (Array.isArray(s.grades) && s.grades.includes(String(grd)));
            });
            const totalQuota = gradeSubjects.reduce((sum, s) => sum + (Number(s.weeklyPeriods) || 0), 0);

            return (
              <div key={grd} className="glass-card" style={{ padding: '1.5rem' }}>
                {/* Grade Course Card Header */}
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
                        background: '#7c3aed',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1.05rem'
                      }}
                    >
                      Grade {grd}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Grade Level {grd} Master Course Curriculum
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {gradeSubjects.length} Master Course{gradeSubjects.length !== 1 ? 's' : ''} Configured · {totalQuota} Total Weekly Hours
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                    onClick={() => openCourseModal(grd)}
                  >
                    <Plus size={14} /> Add Course to Grade {grd}
                  </button>
                </div>

                {/* Grade Course Table / Empty State */}
                {gradeSubjects.length === 0 ? (
                  <div
                    style={{
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: '#f8fafc',
                      border: '1.5px dashed #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', fontWeight: 500 }}>
                      No master courses configured for <strong>Grade {grd}</strong> yet. Click the button to add courses.
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
                      onClick={() => openCourseModal(grd)}
                    >
                      <Plus size={14} /> Add Course to Grade {grd}
                    </button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="table-custom">
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Subject / Course Name</th>
                          <th>Total Weekly Hours</th>
                          <th>Required Facility Room</th>
                          <th>Color Tag</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gradeSubjects.map((subj) => (
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
                                Grade {grd} Standard Curriculum
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                <span style={{ fontWeight: 800, color: '#4f46e5', fontSize: '0.88rem', fontFamily: 'monospace' }}>
                                  {formatToHHMM(subj.weeklyDuration || subj.weeklyPeriods)} Hrs
                                </span>
                                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                  {subj.weeklyPeriods || 6} Periods / Week
                                </span>
                              </div>
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
                                  onClick={() => openCourseModal(grd, subj)}
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
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── WORKSPACE 3: NON ACADEMICS & ECA SCHEDULE ── */}
      {activeTab === 'eca' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* ECA Grade Selector Bar & Action Button */}
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
                Select Target Grade:
              </span>
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

          {/* Grouped Grade Level ECA Matrix Cards */}
          {/* Grouped Grade Level ECA Matrix Cards */}
          {(selectedEcaGrade === 'all' ? uniqueGrades : [selectedEcaGrade || uniqueGrades[0]]).map((grd) => {
            const gradeVerts = ecaVerticals.filter((vert) => {
              const vDetail = (ecaVerticalDetails || []).find((v) => v.name === vert);
              if (!vDetail || !vDetail.grades || vDetail.grades.length === 0) return true;
              return vDetail.grades.some((g) => {
                const gName = String(g.name || g.id).replace('Grade ', '');
                return String(gName) === String(grd) || String(g.id) === String(grd);
              });
            });

            return (
              <div key={grd} className="glass-card" style={{ padding: '1.5rem' }}>
                {/* Grade ECA Card Header */}
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
                        background: '#059669',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1.05rem'
                      }}
                    >
                      Grade {grd}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Grade Level {grd} Non-Academics & ECA Schedule Matrix
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {gradeVerts.length} Active ECA Verticals Configured for Grade {grd}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ECA Matrix Table for Grade */}
                <div className="eca-table-container">
                  <table className="eca-matrix">
                    <thead>
                      <tr>
                        <th className="vertical-day-col">
                          VERTICALS /<br />DAYS
                        </th>
                        {gradeVerts.map((vert) => {
                          const vDetail = (ecaVerticalDetails || []).find((v) => v.name === vert);
                          const assignedGrades = vDetail?.grades || [];
                          return (
                            <th key={vert}>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                                <span>{vert}</span>
                                {assignedGrades.length > 0 && (
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem', justifyContent: 'center' }}>
                                    {assignedGrades.map((ag) => (
                                      <span
                                        key={ag.id}
                                        style={{
                                          fontSize: '0.62rem',
                                          padding: '1px 6px',
                                          borderRadius: '8px',
                                          background: '#ecfdf5',
                                          color: '#059669',
                                          border: '1px solid #a7f3d0',
                                          fontWeight: 700
                                        }}
                                      >
                                        G{String(ag.name).replace('Grade ', '')}
                                      </span>
                                    ))}
                                  </div>
                                )}
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
                          );
                        })}
                      </tr>
                    </thead>

                    <tbody>
                      {daysList.map((day) => (
                        <tr key={day}>
                          <td style={{ fontWeight: 800, color: '#0f172a', background: '#f8fafc', textTransform: 'uppercase', fontSize: '0.82rem' }}>
                            {day}
                          </td>
                          {gradeVerts.map((vert) => {
                            const slotKey = `${grd}_${day}`;
                            const slot = ecaSchedule[slotKey]?.[vert] || { active: false, label: 'No' };

                            return (
                              <td key={vert}>
                                <button
                                  className="eca-cell-btn"
                                  onClick={() => openEcaModal(day, vert, grd)}
                                  title={`Click to edit ${vert} for Grade ${grd} on ${day}`}
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

                      {/* TOTAL Row */}
                      <tr className="total-row">
                        <td style={{ background: '#0f172a', color: '#ffffff', fontWeight: 800 }}>
                          TOTAL with saturday
                        </td>
                        {gradeVerts.map((vert) => {
                          let totalVal = 0;
                          daysList.forEach((d) => {
                            const s = ecaSchedule[`${grd}_${d}`]?.[vert];
                            if (s && s.active) totalVal++;
                          });

                          return (
                            <td key={vert} style={{ background: '#f1f5f9', fontWeight: 800, color: '#0f172a' }}>
                              {totalVal}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── WORKSPACE 4: DAILY BELL SCHEDULE TIMING PARAMETERS ── */}
      {activeTab === 'timeslots' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Workspace Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '1rem 1.25rem',
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              flexWrap: 'wrap'
            }}
          >
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Master School Bell Schedule & Timing Parameters
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Set School Start Time, First Break, Lunch Break, Second Break, and End Time (12-hour AM/PM format).
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Master Bell Parameters Form Card */}
            <div className="glass-card" style={{ padding: '1.75rem', width: '100%', maxWidth: '720px' }}>
              <div
                style={{
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  paddingBottom: '0.75rem',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Clock size={18} color="#2563eb" /> Configure Daily School Milestones (12-Hour AM/PM)
              </div>

              <form onSubmit={handleSaveBellConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>⏰ School Day Start Time</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="08:30 AM"
                      value={bellForm.schoolStartTime}
                      onChange={(e) => setBellForm({ ...bellForm, schoolStartTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontWeight: 700, fontSize: '0.82rem' }}>🔔 School Day End Time</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="03:45 PM"
                      value={bellForm.schoolEndTime}
                      onChange={(e) => setBellForm({ ...bellForm, schoolEndTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ background: '#fffbeb', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fef08a' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Coffee size={15} /> First Break (Morning)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#78350f' }}>Break Start Time</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="10:00 AM"
                        value={bellForm.morningBreakStart}
                        onChange={(e) => setBellForm({ ...bellForm, morningBreakStart: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#78350f' }}>Break End Time</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="10:15 AM"
                        value={bellForm.morningBreakEnd}
                        onChange={(e) => setBellForm({ ...bellForm, morningBreakEnd: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fef2f2', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fecaca' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Utensils size={15} /> Lunch Break
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>Lunch Start Time</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="11:45 AM"
                        value={bellForm.lunchBreakStart}
                        onChange={(e) => setBellForm({ ...bellForm, lunchBreakStart: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#7f1d1d' }}>Lunch End Time</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="12:30 PM"
                        value={bellForm.lunchBreakEnd}
                        onChange={(e) => setBellForm({ ...bellForm, lunchBreakEnd: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div style={{ background: '#fffbeb', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #fef08a' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400e', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Coffee size={15} /> Second Break (Afternoon)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#78350f' }}>Break Start Time</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="02:00 PM"
                        value={bellForm.afternoonBreakStart}
                        onChange={(e) => setBellForm({ ...bellForm, afternoonBreakStart: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: '#78350f' }}>Break End Time</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="02:15 PM"
                        value={bellForm.afternoonBreakEnd}
                        onChange={(e) => setBellForm({ ...bellForm, afternoonBreakEnd: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}>
                  Save School Bell Timing Parameters
                </button>
              </form>
            </div>
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
            Creating Grade <strong>{newGradeLevel || '...'}</strong> will automatically initialize Section A (Grade {newGradeLevel || '...'}-A) with default student capacity and classroom room assignment.
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
        title={editingSection ? `Edit Section ${editingSection.name}` : `Add Section to ${sectionForm.grade.startsWith('Grade') ? sectionForm.grade : `Grade ${sectionForm.grade}`}`}
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
            <label>Target Grade Level</label>
            <select
              className="form-control"
              value={courseForm.grade || ''}
              onChange={(e) => setCourseForm({ ...courseForm, grade: e.target.value })}
              required
            >
              {uniqueGrades.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>

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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Weekly Duration (HH:MM)</label>
              <input
                type="text"
                className="form-control"
                placeholder="06:00"
                value={courseForm.weeklyDuration}
                onChange={(e) => setCourseForm({ ...courseForm, weeklyDuration: e.target.value })}
                required
              />
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Format: <strong>HH:MM</strong> (e.g. 06:00)
              </div>
            </div>

            <div className="form-group">
              <label>Periods / Week</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="40"
                placeholder="e.g. 6"
                value={courseForm.weeklyPeriods}
                onChange={(e) => setCourseForm({ ...courseForm, weeklyPeriods: e.target.value })}
                required
              />
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Weekly Period Count
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Required Classroom Facility Type</label>
            <select
              className="form-control"
              value={courseForm.requiredVenueType}
              onChange={(e) => setCourseForm({ ...courseForm, requiredVenueType: e.target.value })}
            >
              {(venueTypes || []).filter((vt) => vt.id !== 'ALL').map((vt) => (
                <option key={vt.id} value={vt.id}>
                  {vt.label || vt.name || vt.id}
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

          {/* Grade Selection Checkboxes */}
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Assign to Grades</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {grades.map((g) => {
                const gId = g.id;
                const isChecked = selectedVerticalGrades.includes(gId);
                return (
                  <label
                    key={gId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${isChecked ? '#059669' : 'var(--border-color)'}`,
                      background: isChecked ? '#ecfdf5' : '#ffffff',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedVerticalGrades(prev =>
                          isChecked
                            ? prev.filter(id => id !== gId)
                            : [...prev, gId]
                        );
                      }}
                      style={{ accentColor: '#059669' }}
                    />
                    Grade {g.name || g.id}
                  </label>
                );
              })}
            </div>
            {grades.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                No grades configured yet. Add grade levels first.
              </p>
            )}
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

      {/* ── MODAL: ADD / EDIT TIME SLOT ── */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={editingSlot ? `Edit Time Slot: ${editingSlot.name}` : 'Add New Daily Bell Schedule Time Slot'}
      >
        <form onSubmit={handleSlotFormSubmit}>
          <div className="form-group">
            <label>Time Slot Name / Label</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Period 1, Morning Break, Lunch Break, Assembly"
              value={slotForm.name}
              onChange={(e) => setSlotForm({ ...slotForm, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Start Time (HH:MM 24hr or 12hr)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 08:30"
                value={slotForm.startTime}
                onChange={(e) => setSlotForm({ ...slotForm, startTime: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time (HH:MM 24hr or 12hr)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 09:15"
                value={slotForm.endTime}
                onChange={(e) => setSlotForm({ ...slotForm, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Slot Category Type</label>
              <select
                className="form-control"
                value={slotForm.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  let defaultColor = '#2563eb';
                  if (newType === 'break') defaultColor = '#f59e0b';
                  if (newType === 'lunch') defaultColor = '#ef4444';
                  if (newType === 'assembly') defaultColor = '#7c3aed';
                  setSlotForm({ ...slotForm, type: newType, color: defaultColor });
                }}
              >
                <option value="period">Academic Class Period</option>
                <option value="break">Short Break (Morning/Afternoon)</option>
                <option value="lunch">Lunch Break</option>
                <option value="assembly">Assembly / Homeroom</option>
              </select>
            </div>

            <div className="form-group">
              <label>Slot Order Number</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={slotForm.slotNo}
                onChange={(e) => setSlotForm({ ...slotForm, slotNo: Number(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, background: 'transparent', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSlotModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSlot ? 'Update Time Slot' : 'Save Time Slot'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Deletion Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type === 'grade' ? 'Grade Level' : deleteTarget?.type === 'class' ? 'Class Section' : deleteTarget?.type === 'subject' ? 'Subject' : deleteTarget?.type === 'slot' ? 'Time Slot' : 'ECA Vertical'}`}
        message={`Are you sure you want to delete ${deleteTarget?.type === 'grade' ? `Grade ${deleteTarget?.data?.id || deleteTarget?.data} and all its associated class sections` : deleteTarget?.type === 'class' ? `class section "${deleteTarget?.data?.name}"` : deleteTarget?.type === 'subject' ? `subject "${deleteTarget?.data?.name}" (${deleteTarget?.data?.code})` : deleteTarget?.type === 'slot' ? `time slot "${deleteTarget?.data?.name}" (${deleteTarget?.data?.startTime} - ${deleteTarget?.data?.endTime})` : `ECA vertical "${deleteTarget?.data?.name || deleteTarget?.data}"`}? This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
