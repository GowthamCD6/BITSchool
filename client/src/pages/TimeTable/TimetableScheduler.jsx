import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import ManualEditModal from '../../components/ManualEditModal';
import Modal from '../../components/Modal';
import {
  Sparkles,
  Printer,
  Download,
  Tv,
  AlertTriangle,
  UserCheck,
  Building,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
  History,
  ArrowRight,
  Layers,
  GraduationCap,
  LayoutGrid
} from 'lucide-react';

// ── Helpers ──
function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

function getSaturdayFromMonday(mondayStr) {
  const d = new Date(mondayStr + 'T00:00:00');
  d.setDate(d.getDate() + 5);
  return d;
}

function getWeekDates(mondayStr) {
  const monday = new Date(mondayStr + 'T00:00:00');
  const dates = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toWeekKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function TimetableScheduler() {
  const schoolContext = useSchool();
  const {
    timetable = [],
    classes = [],
    faculties = [],
    venues = [],
    days = [],
    periods = [],
    handleAutoGenerateTimetable,
    activeWeekKey,
    setActiveWeekKey,
    weeklyTimetables = {},
    generatedWeekKeys = [],
    deleteWeekTimetable,
    getMondayOfWeek: contextGetMonday = getMondayOfWeek,
    toWeekKey: contextToWeekKey = toWeekKey
  } = schoolContext || {};

  const safeGetMonday = contextGetMonday || getMondayOfWeek;
  const safeToWeekKey = contextToWeekKey || toWeekKey;


  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Selection Screen State
  // ═══════════════════════════════════════════════════════════════
  const [step, setStep] = useState('select'); // 'select' | 'timetable'

  // Selection values
  const todayWeekKey = toWeekKey(getMondayOfWeek(new Date()));
  const [selClassId, setSelClassId] = useState(classes[0]?.id || 'c1');
  const [selWeekDate, setSelWeekDate] = useState(activeWeekKey || todayWeekKey);

  const selectedClassObj = useMemo(() => {
    return classes.find(c => c.id === selClassId) || classes[0];
  }, [classes, selClassId]);

  // Enter timetable view
  const handleProceed = () => {
    if (!selectedClassObj) return;
    const monday = getMondayOfWeek(new Date(selWeekDate + 'T00:00:00'));
    setActiveWeekKey(toWeekKey(monday));
    setSelectedClassId(selectedClassObj.id);
    setStep('timetable');
  };

  // Go back to selection
  const handleBackToSelection = () => {
    setStep('select');
  };


  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Timetable View State
  // ═══════════════════════════════════════════════════════════════
  const [viewMode, setViewMode] = useState('class');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'c1');
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculties[0]?.id || 'f1');
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || 'v1');
  const [slotToEdit, setSlotToEdit] = useState(null);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [genScope, setGenScope] = useState('all');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Derived
  const weekDates = useMemo(() => getWeekDates(activeWeekKey), [activeWeekKey]);
  const saturdayDate = getSaturdayFromMonday(activeWeekKey);
  const weekLabel = `${formatDateFull(activeWeekKey)} — ${saturdayDate.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`;
  const hasGeneratedTimetable = timetable.length > 0;
  const isCurrentWeek = activeWeekKey === todayWeekKey;

  const navigateWeek = (direction) => {
    const monday = new Date(activeWeekKey + 'T00:00:00');
    monday.setDate(monday.getDate() + (direction * 7));
    setActiveWeekKey(toWeekKey(monday));
  };

  const goToCurrentWeek = () => {
    setActiveWeekKey(todayWeekKey);
  };

  const getSlot = (day, periodId) => {
    if (viewMode === 'class') {
      return timetable.find(
        (t) => t.classId === selectedClassId && t.day === day && t.period === periodId
      );
    } else if (viewMode === 'faculty') {
      return timetable.find(
        (t) => t.facultyId === selectedFacultyId && t.day === day && t.period === periodId
      );
    } else if (viewMode === 'venue') {
      return timetable.find(
        (t) => t.venueId === selectedVenueId && t.day === day && t.period === periodId
      );
    }
    return null;
  };

  const activeClassObj = classes.find(c => c.id === selectedClassId) || classes[0];

  const handleExportCSV = () => {
    const headers = ['Week', 'Class', 'Day', 'Date', 'Period', 'Period Time', 'Subject Code', 'Subject Name', 'Faculty Name', 'Venue Room', 'Venue Type'];
    const satStr = `${saturdayDate.getFullYear()}-${String(saturdayDate.getMonth() + 1).padStart(2, '0')}-${String(saturdayDate.getDate()).padStart(2, '0')}`;
    const rows = timetable.map((t) => {
      const dayIndex = days.indexOf(t.day);
      const dateObj = dayIndex >= 0 ? weekDates[dayIndex] : null;
      const dateStr = dateObj ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}` : '';
      return [
        `"${activeWeekKey} to ${satStr}"`,
        `"${t.className}"`,
        `"${t.day}"`,
        `"${dateStr}"`,
        `"${t.periodName}"`,
        `"${t.periodTime}"`,
        `"${t.subjectCode}"`,
        `"${t.subjectName}"`,
        `"${t.facultyName}"`,
        `"${t.venueRoomNo}"`,
        `"${t.venueType}"`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BITSchool_Timetable_${activeWeekKey}_to_${satStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const runScopeGenerator = () => {
    if (genScope === 'class') {
      handleAutoGenerateTimetable({ targetClassId: selectedClassId });
    } else if (genScope === 'grade') {
      handleAutoGenerateTimetable({ targetGrade: activeClassObj?.grade });
    } else {
      handleAutoGenerateTimetable({ targetClassId: 'all', targetGrade: 'all' });
    }
    setIsScopeModalOpen(false);
  };

  const handleDatePickerChange = (e) => {
    const selectedDate = new Date(e.target.value + 'T00:00:00');
    const monday = getMondayOfWeek(selectedDate);
    setActiveWeekKey(toWeekKey(monday));
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER: SELECTION SCREEN (Step 1)
  // ═══════════════════════════════════════════════════════════════
  if (step === 'select') {
    const selSaturdayDate = getSaturdayFromMonday(toWeekKey(getMondayOfWeek(new Date(selWeekDate + 'T00:00:00'))));
    const selMondayKey = toWeekKey(getMondayOfWeek(new Date(selWeekDate + 'T00:00:00')));
    const selWeekLabel = `${formatDateFull(selMondayKey)} — ${selSaturdayDate.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}`;
    const weekHasData = weeklyTimetables[selMondayKey] && weeklyTimetables[selMondayKey].length > 0;

    return (
      <div className="tt-select-screen">
        {/* Title */}
        <div className="tt-select-header">
          <div className="tt-select-icon">
            <LayoutGrid size={32} />
          </div>
          <h2 className="tt-select-title">Timetable Scheduler</h2>
          <p className="tt-select-subtitle">
            Select the grade, section, and week to view or generate the timetable.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="tt-select-cards">
          {/* Class Section Selection */}
          <div className="tt-select-card">
            <div className="tt-select-card-label">
              <Layers size={18} />
              <span>Select Class Section</span>
            </div>
            <div className="tt-select-pill-group">
              {classes.length > 0 ? classes.map(c => (
                <button
                  key={c.id}
                  className={`tt-select-pill ${selClassId === c.id ? 'active' : ''}`}
                  onClick={() => setSelClassId(c.id)}
                >
                  {c.name}
                  <span style={{ fontSize: '0.7rem', color: selClassId === c.id ? '#dbeafe' : '#94a3b8', marginLeft: '4px' }}>
                    ({c.studentCount} students)
                  </span>
                </button>
              )) : (
                <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No class sections configured yet.</span>
              )}
            </div>
          </div>

          {/* Week Date Selection */}
          <div className="tt-select-card">

            <div className="tt-select-card-label">
              <Calendar size={18} />
              <span>Select Week</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="date"
                className="tt-select-date-input"
                value={selWeekDate}
                onChange={(e) => setSelWeekDate(e.target.value)}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                  {selWeekLabel}
                </span>
                {weekHasData ? (
                  <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle2 size={12} /> Timetable exists ({weeklyTimetables[selMondayKey].length} slots)
                  </span>
                ) : (
                  <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 500 }}>
                    No timetable generated for this week yet
                  </span>
                )}
              </div>
            </div>

            {/* Quick Week Shortcuts */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className={`tt-select-pill small ${selMondayKey === todayWeekKey ? 'active' : ''}`}
                onClick={() => setSelWeekDate(todayWeekKey)}
              >
                This Week
              </button>
              {generatedWeekKeys.slice(0, 4).map(wk => {
                if (wk === todayWeekKey) return null;
                return (
                  <button
                    key={wk}
                    className={`tt-select-pill small ${selMondayKey === wk ? 'active' : ''}`}
                    onClick={() => setSelWeekDate(wk)}
                  >
                    {formatDateShort(wk)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Proceed Button */}
        <div className="tt-select-footer">
          <button
            className="btn btn-primary tt-select-proceed-btn"
            disabled={!selectedClassObj}
            onClick={handleProceed}
          >
            View Timetable
            <ArrowRight size={18} />
          </button>
        </div>

      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // RENDER: TIMETABLE VIEW (Step 2)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── WEEK NAVIGATION BAR ── */}
      <div className="week-nav-bar">
        <div className="week-nav-left">
          {/* Back to Selection */}
          <button
            className="week-nav-arrow"
            onClick={handleBackToSelection}
            title="Back to Selection"
            style={{ background: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Previous Week */}
          <button className="week-nav-arrow" onClick={() => navigateWeek(-1)} title="Previous Week">
            <ChevronLeft size={20} />
          </button>

          <div className="week-nav-label-group">
            <div className="week-nav-label">
              <Calendar size={16} />
              <span>{weekLabel}</span>
            </div>
            <input
              type="date"
              className="week-date-picker"
              value={activeWeekKey}
              onChange={handleDatePickerChange}
              title="Pick any date — jumps to its Monday"
            />
          </div>

          {/* Next Week */}
          <button className="week-nav-arrow" onClick={() => navigateWeek(1)} title="Next Week">
            <ChevronRight size={20} />
          </button>

          {!isCurrentWeek && (
            <button className="btn btn-secondary week-today-btn" onClick={goToCurrentWeek}>
              Today
            </button>
          )}
        </div>

        <div className="week-nav-right">
          {hasGeneratedTimetable ? (
            <span className="week-status-badge week-status-generated">
              <CheckCircle2 size={14} />
              Generated · {timetable.length} slots
            </span>
          ) : (
            <span className="week-status-badge week-status-empty">
              <AlertCircle size={14} />
              No timetable for this week
            </span>
          )}

          {/* Week History */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <History size={15} />
              Week History
              <span style={{
                background: '#e2e8f0',
                color: '#475569',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px',
                marginLeft: '2px'
              }}>
                {generatedWeekKeys.length}
              </span>
            </button>

            {isHistoryOpen && (
              <>
                <div className="week-history-backdrop" onClick={() => setIsHistoryOpen(false)} />
                <div className="week-history-dropdown">
                  <div className="week-history-header">
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>
                      Generated Weeks
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {generatedWeekKeys.length} week{generatedWeekKeys.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {generatedWeekKeys.length === 0 ? (
                    <div className="week-history-empty">
                      <Clock size={28} style={{ color: '#94a3b8' }} />
                      <p>No timetables generated yet.</p>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Generate a timetable to get started.</p>
                    </div>
                  ) : (
                    <div className="week-history-list">
                      {generatedWeekKeys.map((wk) => {
                        const sat = getSaturdayFromMonday(wk);
                        const slotCount = weeklyTimetables[wk]?.length || 0;
                        const isActive = wk === activeWeekKey;
                        const isCurrent = wk === todayWeekKey;
                        return (
                          <div key={wk} className={`week-history-item ${isActive ? 'active' : ''}`}>
                            <div className="week-history-item-info">
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="week-history-item-date">
                                  {formatDateFull(wk)} — {sat.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </span>
                                {isCurrent && (
                                  <span className="week-history-current-badge">Current</span>
                                )}
                              </div>
                              <span className="week-history-item-slots">
                                {slotCount} period slots allocated
                              </span>
                            </div>
                            <div className="week-history-item-actions">
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                onClick={() => { setActiveWeekKey(wk); setIsHistoryOpen(false); }}
                                disabled={isActive}
                              >
                                <Eye size={13} /> View
                              </button>
                              <button
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem', color: '#ef4444' }}
                                onClick={() => deleteWeekTimetable(wk)}
                                title="Delete this week's timetable"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── ACTION HEADER & VIEW SWITCHER ── */}
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
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
              className={`btn ${viewMode === 'class' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', border: 'none' }}
              onClick={() => setViewMode('class')}
            >
              By Grade Class
            </button>
            <button
              className={`btn ${viewMode === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', border: 'none' }}
              onClick={() => setViewMode('faculty')}
            >
              By Faculty Member
            </button>
            <button
              className={`btn ${viewMode === 'venue' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.82rem', border: 'none' }}
              onClick={() => setViewMode('venue')}
            >
              By Classroom Venue
            </button>
          </div>

          {/* Select Target Dropdown */}
          {viewMode === 'class' && (
            <select
              className="select-custom"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount} Students)
                </option>
              ))}
            </select>
          )}

          {viewMode === 'faculty' && (
            <select
              className="select-custom"
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
            >
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.empId})
                </option>
              ))}
            </select>
          )}

          {viewMode === 'venue' && (
            <select
              className="select-custom"
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
            >
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.roomNo} - {v.name} ({v.type === 'projector' ? 'Projector' : v.type})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn-emerald" onClick={() => setIsScopeModalOpen(true)}>
            <Sparkles size={16} /> Auto-Generate Timetable
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Export CSV" disabled={!hasGeneratedTimetable}>
            <Download size={16} /> CSV
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} title="Print Schedule" disabled={!hasGeneratedTimetable}>
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* ── TIMETABLE GRID OR EMPTY STATE ── */}
      {!hasGeneratedTimetable ? (
        <div className="week-empty-state">
          <div className="week-empty-icon">
            <Calendar size={48} />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            No Timetable for This Week
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '420px', lineHeight: 1.6 }}>
            Week of <strong>{weekLabel}</strong> does not have a generated timetable yet.
          </p>
          <button
            className="btn btn-emerald"
            style={{ marginTop: '1rem', padding: '0.65rem 1.5rem' }}
            onClick={() => setIsScopeModalOpen(true)}
          >
            <Sparkles size={16} /> Generate Timetable for This Week
          </button>
        </div>
      ) : (
        <div className="timetable-container">
          <table className="timetable-matrix">
            <thead>
              <tr>
                <th className="day-col">Day / Period</th>
                {periods.map((p) => {
                  const isShortBreak1 = p.id === 2;
                  const isLunchBreak = p.id === 4;
                  const isShortBreak2 = p.id === 6;
                  return (
                    <React.Fragment key={p.id}>
                      <th>
                        <div>{p.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                          {p.time}
                        </div>
                      </th>
                      {isShortBreak1 && (
                        <th style={{ width: '65px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 700 }}>
                          ☕ BREAK
                        </th>
                      )}
                      {isLunchBreak && (
                        <th style={{ width: '75px', background: '#fffbeb', color: '#b45309', fontSize: '0.72rem', fontWeight: 700 }}>
                          🍱 LUNCH
                        </th>
                      )}
                      {isShortBreak2 && (
                        <th style={{ width: '65px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 700 }}>
                          ☕ BREAK
                        </th>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {days.map((day, dayIdx) => {
                const dateObj = weekDates[dayIdx];
                const dateLabel = dateObj
                  ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                  : '';

                return (
                  <tr key={day}>
                    <td
                      style={{
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        color: 'var(--text-main)',
                        background: '#f1f5f9',
                        paddingLeft: '1rem'
                      }}
                    >
                      <div>{day}</div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 500, color: '#64748b', marginTop: '1px' }}>
                        {dateLabel}
                      </div>
                    </td>

                    {periods.map((p) => {
                      const slot = getSlot(day, p.id);
                      const isShortBreak1 = p.id === 2;
                      const isLunchBreak = p.id === 4;
                      const isShortBreak2 = p.id === 6;

                      return (
                        <React.Fragment key={p.id}>
                          <td>
                            {slot ? (
                              <div className="period-cell" onClick={() => setSlotToEdit(slot)} title="Click to edit cell slot">
                                <div>
                                  <div className="period-cell-subj">{slot.subjectName}</div>
                                  <div className="period-cell-fac">
                                    <UserCheck size={11} /> {slot.facultyName}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span className="period-cell-ven">
                                    <Building size={11} /> {slot.venueRoomNo}
                                  </span>
                                  {slot.venueType === 'projector' && (
                                    <span title="Normal Class + Projector Room" style={{ color: '#7c3aed' }}>
                                      <Tv size={13} />
                                    </span>
                                  )}
                                  {slot.isConflict && (
                                    <span title="Schedule Conflict!" style={{ color: 'var(--accent-rose)' }}>
                                      <AlertTriangle size={13} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div
                                className="period-cell"
                                style={{
                                  borderStyle: 'dashed',
                                  borderColor: 'var(--border-color)',
                                  background: 'transparent',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  color: 'var(--text-muted)',
                                  fontSize: '0.75rem'
                                }}
                              >
                                Free Slot
                              </div>
                            )}
                          </td>

                          {isShortBreak1 && (
                            <td>
                              <div style={{
                                background: '#eff6ff', border: '1px dashed #bfdbfe',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700,
                                height: '100%', borderRadius: 'var(--radius-sm)'
                              }}>
                                <div>☕<br />Break</div>
                              </div>
                            </td>
                          )}

                          {isLunchBreak && (
                            <td>
                              <div className="period-cell-lunch">
                                <div>🍱<br />Lunch</div>
                              </div>
                            </td>
                          )}

                          {isShortBreak2 && (
                            <td>
                              <div style={{
                                background: '#eff6ff', border: '1px dashed #bfdbfe',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700,
                                height: '100%', borderRadius: 'var(--radius-sm)'
                              }}>
                                <div>☕<br />Break</div>
                              </div>
                            </td>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── AUTO GENERATE SCOPE MODAL ── */}
      <Modal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        title={`Auto-Generate Timetable — Week of ${formatDateShort(activeWeekKey)}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)' }}>
            Select the target scope for auto-generating timetable period slots for the week of <strong>{weekLabel}</strong>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)', border: '1px solid',
                borderColor: genScope === 'all' ? 'var(--primary)' : 'var(--border-color)',
                background: genScope === 'all' ? '#eff6ff' : '#f8fafc', cursor: 'pointer'
              }}
              onClick={() => setGenScope('all')}
            >
              <input type="radio" name="scope" checked={genScope === 'all'} onChange={() => setGenScope('all')} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Entire School (All Classes)
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Auto-schedule all {classes.length} sections across the school.
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)', border: '1px solid',
                borderColor: genScope === 'grade' ? 'var(--primary)' : 'var(--border-color)',
                background: genScope === 'grade' ? '#eff6ff' : '#f8fafc', cursor: 'pointer'
              }}
              onClick={() => setGenScope('grade')}
            >
              <input type="radio" name="scope" checked={genScope === 'grade'} onChange={() => setGenScope('grade')} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Specific Grade Level (Grade {activeClassObj?.grade || '10'})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Re-schedule all sections in Grade {activeClassObj?.grade || '10'} only.
                </div>
              </div>
            </label>

            <label
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)', border: '1px solid',
                borderColor: genScope === 'class' ? 'var(--primary)' : 'var(--border-color)',
                background: genScope === 'class' ? '#eff6ff' : '#f8fafc', cursor: 'pointer'
              }}
              onClick={() => setGenScope('class')}
            >
              <input type="radio" name="scope" checked={genScope === 'class'} onChange={() => setGenScope('class')} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Selected Class Only ({activeClassObj?.name || 'Grade 10-A'})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Re-schedule timetable slots for {activeClassObj?.name || 'Grade 10-A'} specifically.
                </div>
              </div>
            </label>
          </div>

          <div className="modal-footer" style={{ padding: 0, background: 'transparent', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsScopeModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-emerald" onClick={runScopeGenerator}>
              <Sparkles size={16} /> Run Generator Now
            </button>
          </div>
        </div>
      </Modal>

      {/* Cell Editor Modal */}
      <ManualEditModal
        isOpen={!!slotToEdit}
        onClose={() => setSlotToEdit(null)}
        slotToEdit={slotToEdit}
      />
    </div>
  );
}
