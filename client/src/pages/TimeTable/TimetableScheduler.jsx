/**
 * TimetableScheduler.jsx — COMPLETE REWRITE FROM SCRATCH
 *
 * Displays the auto-generated master timetable in a clean day-wise column layout.
 *
 * Three data sources drive the timetable:
 *   1. Bell Schedule  → fixed day anchors (start, breaks, end)
 *   2. ECA Schedule   → grade+day specific activities (fixed, immovable)
 *   3. Master Courses → academic subjects (fill the remaining gaps)
 *
 * UI Layout:
 *   • One column per day
 *   • Each column: Header (Grade + Day + ECA label) + TIMING | SCHEDULE/ACTIVITY rows
 *   • Color coding:
 *       - Physical Fitness → green
 *       - Morning/Afternoon Break → amber
 *       - Lunch Break → red
 *       - ECA Activity → orange
 *       - Academic Period → white with subject-colored left border
 */

import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import ManualEditModal from '../../components/ManualEditModal';
import ConfirmModal from '../../components/ConfirmModal';
import { calculateDynamicPeriodsFromBellConfig } from '../../utils/timetableGenerator';
import {
  Sparkles, Printer, Download, AlertTriangle,
  Coffee, Utensils, Activity, Trash2, Edit3, BookOpen
} from 'lucide-react';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function parseTime(t) {
  if (!t) return 0;
  let s = String(t).trim().toUpperCase();
  let pm = s.includes('PM');
  let am = s.includes('AM');
  const [hRaw, mRaw] = s.replace(/AM|PM/g, '').trim().split(':').map(Number);
  let h = isNaN(hRaw) ? 0 : hRaw;
  const m = isNaN(mRaw) ? 0 : mRaw;

  // In a school timetable context (07:00 AM - 07:00 PM), 12:xx AM is a mistyped 12:xx PM (noon/lunch time)
  if (h === 12 && am) {
    am = false;
    pm = true;
  }

  if (pm && h < 12) h += 12;
  if (am && h === 12) h = 0;
  return h * 60 + m;
}

function getGradeStr(cls) {
  if (!cls) return '';
  if (cls.gradeName != null) return String(cls.gradeName).replace(/grade\s*/i, '').trim();
  if (cls.gradeId   != null) return String(cls.gradeId).replace(/grade\s*/i, '').trim();
  if (cls.grade     != null) {
    if (typeof cls.grade === 'object') return String(cls.grade.name || cls.grade.id || '').replace(/grade\s*/i, '').trim();
    return String(cls.grade).replace(/grade\s*/i, '').trim();
  }
  if (cls.name) { const m = String(cls.name).match(/(\d+)/); if (m) return m[1]; }
  return '';
}

// ─── ECA LABEL HELPER (for day header) ───────────────────────────────────────

function getDayEcaLabel(ecaSchedule, grade, day) {
  if (!ecaSchedule || typeof ecaSchedule !== 'object') return null;
  const du = String(day).toUpperCase();
  const g  = String(grade || '').replace(/\D/g, '');

  const keys = [
    `${g}_${du}`, `Grade ${g}_${du}`, `${grade}_${du}`,
    `${g}_${day}`, `Grade ${g}_${day}`
  ];
  let map = null;
  for (const k of keys) {
    if (ecaSchedule[k] && Object.keys(ecaSchedule[k]).length) { map = ecaSchedule[k]; break; }
  }
  if (!map) {
    const found = Object.keys(ecaSchedule).find(k => {
      const ku = k.toUpperCase();
      return ku.includes(du) && (ku.includes(g) || ku.includes(String(grade).toUpperCase()));
    });
    if (found) map = ecaSchedule[found];
  }
  if (!map) return null;

  const active = Object.entries(map).filter(([k, v]) => {
    if (k.toLowerCase().includes('fitness')) return false;
    return v && (v.active === true || (v.label && v.label !== 'No' && !String(v.label).startsWith('No')));
  });
  return active.length > 0 ? active[0][0] : null;
}

// ─── SLOT TYPE DETECTORS ─────────────────────────────────────────────────────

function isLunchSlot(slot) {
  return slot.blockKind === 'LUNCH' ||
    String(slot.subjectId || '').includes('lunch') ||
    String(slot.subjectName || '').toLowerCase() === 'lunch break';
}
function isBreakSlot(slot) {
  return slot.blockKind === 'BREAK' ||
    String(slot.subjectId || '').includes('break') ||
    String(slot.subjectName || '').toLowerCase().includes('break');
}
function isEcaSlot(slot) { return slot.blockKind === 'ECA_ANCHOR' || slot.venueType === 'eca'; }
function isFitnessSlot(slot) {
  return slot.blockKind === 'ANCHOR' ||
    String(slot.subjectName || '').toLowerCase().includes('physical fitness') ||
    String(slot.subjectCode || '').toUpperCase() === 'FITNESS';
}

// ─── SLOT ROW COMPONENT ───────────────────────────────────────────────────────

function SlotRow({ slot, onEdit, onDelete, viewMode }) {
  const isLunch   = isLunchSlot(slot);
  const isBreak   = isBreakSlot(slot);
  const isEca     = isEcaSlot(slot);
  const isFitness = isFitnessSlot(slot);

  // Color schemes per slot type
  let rowBg, timeBg, leftBorderColor, nameColor, timeColor;

  if (isLunch) {
    rowBg = 'linear-gradient(90deg,#fff1f2 0%,#ffe4e6 100%)';
    timeBg = '#fff1f2'; leftBorderColor = '#ef4444'; nameColor = '#9b1827'; timeColor = '#991b1b';
  } else if (isBreak) {
    rowBg = 'linear-gradient(90deg,#fffbeb 0%,#fef3c7 100%)';
    timeBg = '#fffbeb'; leftBorderColor = '#f59e0b'; nameColor = '#92400e'; timeColor = '#92400e';
  } else if (isFitness) {
    rowBg = 'linear-gradient(90deg,#f0fdf4 0%,#d1fae5 100%)';
    timeBg = '#f0fdf4'; leftBorderColor = '#059669'; nameColor = '#065f46'; timeColor = '#065f46';
  } else if (isEca) {
    rowBg = 'linear-gradient(90deg,#fffbeb 0%,#fef3c7 100%)';
    timeBg = '#fffbeb'; leftBorderColor = slot.subjectColor || '#d97706'; nameColor = '#92400e'; timeColor = '#78350f';
  } else {
    rowBg = '#fff';
    timeBg = '#fafafa'; leftBorderColor = slot.subjectColor || '#2563eb'; nameColor = '#0f172a'; timeColor = '#475569';
  }

  const Icon = isLunch ? Utensils : isBreak ? Coffee : isFitness ? Activity : isEca ? Sparkles : BookOpen;
  const isFixed = isLunch || isBreak || isFitness;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        borderBottom: '1px solid #f1f5f9',
        background: rowBg,
        borderLeft: `3px solid ${leftBorderColor}`,
        minHeight: '52px'
      }}
    >
      {/* Timing column */}
      <div
        style={{
          width: '90px',
          minWidth: '90px',
          padding: '6px 4px',
          background: timeBg,
          borderRight: '1px solid #f1f5f9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1px'
        }}
      >
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: timeColor, letterSpacing: '0.01em', textAlign: 'center' }}>
          {slot.startTime}
        </span>
        <span style={{ fontSize: '0.55rem', color: '#94a3b8', lineHeight: 1 }}>—</span>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: timeColor, letterSpacing: '0.01em', textAlign: 'center' }}>
          {slot.endTime}
        </span>
      </div>

      {/* Schedule/Activity column */}
      <div
        style={{
          flex: 1,
          padding: '6px 8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '2px',
          cursor: isFixed ? 'default' : 'pointer'
        }}
        onClick={() => !isFixed && onEdit && onEdit(slot)}
      >
        {/* Subject name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Icon size={10} color={nameColor} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 800, fontSize: '0.72rem', color: nameColor, lineHeight: 1.3 }}>
            {slot.subjectName}
          </span>
          {slot.isConflict && (
            <AlertTriangle size={10} color="#ef4444" title="Scheduling conflict!" />
          )}
        </div>

        {/* Faculty / Class & Venue (only for academic/ECA) */}
        {!isFixed && (
          <>
            {viewMode === 'faculty' ? (
              <span style={{ fontSize: '0.60rem', color: '#1e40af', fontWeight: 700, lineHeight: 1.2 }}>
                🏫 {slot.className || 'Class'}
              </span>
            ) : (
              slot.facultyName && (
                <span style={{ fontSize: '0.60rem', color: '#64748b', lineHeight: 1.2 }}>
                  👤 {slot.facultyName}
                </span>
              )
            )}
            {slot.venueRoomNo && (
              <span className="slot-room-no print-hide" style={{ fontSize: '0.58rem', color: '#94a3b8', lineHeight: 1.2 }}>
                📍 {slot.venueRoomNo}
              </span>
            )}
          </>
        )}

        {/* Duration badge */}
        <span className="slot-duration-badge print-hide" style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 600 }}>
          {slot.durationMins} mins
        </span>
      </div>

      {/* Edit/Delete actions (academic only) */}
      {!isFixed && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '2px',
            padding: '4px 4px',
            opacity: 0.5
          }}
          className="slot-actions"
        >
          {onEdit && (
            <button
              type="button"
              title="Edit slot"
              style={{ border: 'none', background: 'transparent', padding: '2px', cursor: 'pointer', color: '#94a3b8', borderRadius: '4px' }}
              onClick={e => { e.stopPropagation(); onEdit(slot); }}
            >
              <Edit3 size={10} />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              title="Delete slot"
              style={{ border: 'none', background: 'transparent', padding: '2px', cursor: 'pointer', color: '#fca5a5', borderRadius: '4px' }}
              onClick={e => { e.stopPropagation(); onDelete(slot); }}
            >
              <Trash2 size={10} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DAY COLUMN COMPONENT ─────────────────────────────────────────────────────

function DayColumn({ day, gradeStr, ecaLabel, slots, onEdit, onDelete, viewMode }) {
  return (
    <div
      style={{
        flex: '1 1 200px',
        minWidth: '210px',
        maxWidth: '280px',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        overflow: 'hidden',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 16px -2px rgba(0,0,0,0.06)'
      }}
    >
      {/* Day Header */}
      <div
        style={{
          background: 'linear-gradient(135deg,#1e40af 0%,#1d4ed8 100%)',
          padding: '10px 8px 8px',
          textAlign: 'center',
          borderBottom: '3px solid #3b82f6'
        }}
      >
        {/* Grade badge */}
        <div
          style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.18)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#e0f2fe',
            fontSize: '0.62rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            padding: '2px 8px',
            borderRadius: '20px',
            marginBottom: '4px',
            textTransform: 'uppercase'
          }}
        >
          {viewMode === 'faculty' ? 'Faculty Schedule' : `Grade ${gradeStr}`}
        </div>

        {/* Day name */}
        <div
          style={{
            fontWeight: 900,
            fontSize: '0.95rem',
            letterSpacing: '0.08em',
            color: '#fff',
            textTransform: 'uppercase',
            textShadow: '0 1px 3px rgba(0,0,0,0.2)'
          }}
        >
          {day}
        </div>

        {/* ECA Label (if any active ECA for this day) */}
        {ecaLabel && (
          <div
            title={ecaLabel}
            style={{
              marginTop: '5px',
              display: 'inline-block',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#fef08a',
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)',
              maxWidth: '95%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            ✨ {ecaLabel}
          </div>
        )}
      </div>

      {/* Column sub-header */}
      <div
        style={{
          display: 'flex',
          background: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          padding: '5px 4px'
        }}
      >
        <div style={{ width: '90px', minWidth: '90px', textAlign: 'center', borderRight: '1px solid #cbd5e1', fontSize: '0.62rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em' }}>
          TIMING
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontSize: '0.62rem', fontWeight: 800, color: '#475569', letterSpacing: '0.05em' }}>
          SCHEDULE / ACTIVITY
        </div>
      </div>

      {/* Slot rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {slots.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
            No schedule
          </div>
        ) : (
          slots.map((slot, idx) => (
            <SlotRow
              key={slot.id || idx}
              slot={slot}
              onEdit={onEdit}
              onDelete={onDelete}
              viewMode={viewMode}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TimetableScheduler() {
  const schoolCtx = useSchool() || {};
  const {
    timetable           = [],
    classes             = [],
    faculties           = [],
    venues              = [],
    grades              = [],
    days                = [],
    bellConfig          = {},
    ecaSchedule         = {},
    handleAutoGenerateTimetable,
    deleteTimetableSlot,
    clearTimetable
  } = schoolCtx;

  // ── View state ──
  const [selectedGrade,   setSelectedGrade]   = useState('ALL');
  const [selectedClassId, setSelectedClassId] = useState('');

  // ── Modal state ──
  const [slotToEdit,          setSlotToEdit]          = useState(null);
  const [slotToDelete,        setSlotToDelete]        = useState(null);
  const [isConfirmClearOpen,  setIsConfirmClearOpen]  = useState(false);

  // ── Unique grade levels ──
  const uniqueGrades = useMemo(() => {
    const set = new Set([
      ...(grades || []).map(g => String(g.id || String(g.name).replace(/\D/g, ''))),
      ...(classes || []).map(c => getGradeStr(c))
    ].filter(Boolean));
    return Array.from(set).sort((a, b) => Number(a) - Number(b));
  }, [grades, classes]);

  // ── Classes filtered by selected grade ──
  const filteredClasses = useMemo(() => {
    if (selectedGrade === 'ALL') return classes;
    return classes.filter(c => getGradeStr(c) === String(selectedGrade));
  }, [classes, selectedGrade]);

  // ── Sync selectedClassId when grade changes ──
  React.useEffect(() => {
    if (filteredClasses.length > 0) {
      if (!filteredClasses.find(c => c.id === selectedClassId)) {
        setSelectedClassId(filteredClasses[0].id);
      }
    }
  }, [filteredClasses]);

  // ── Active class object & its grade ──
  const activeClass = classes.find(c => c.id === selectedClassId) || filteredClasses[0] || classes[0];
  const activeGrade = activeClass ? getGradeStr(activeClass) : '';

  // ── View mode state ──
  const [viewMode,          setViewMode]          = useState('class'); // 'class' | 'faculty'
  const [selectedFacultyId, setSelectedFacultyId] = useState('');

  // ── Filtered faculties ──
  const filteredFaculties = useMemo(() => {
    if (selectedGrade === 'ALL') return faculties;
    return faculties.filter(f => {
      if (!Array.isArray(f.grades)) return true;
      return f.grades.some(g => String(g).includes(selectedGrade));
    });
  }, [faculties, selectedGrade]);

  React.useEffect(() => {
    if (filteredFaculties.length > 0 && !filteredFaculties.find(f => f.id === selectedFacultyId)) {
      setSelectedFacultyId(filteredFaculties[0].id);
    }
  }, [filteredFaculties]);

  const activeFaculty = faculties.find(f => f.id === selectedFacultyId) || filteredFaculties[0] || faculties[0];

  // ── Days to display ──
  const activeDays = (days && days.length > 0) ? days : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // ── Build slots for a given day ──
  const getDaySlots = (day) => {
    if (viewMode === 'faculty') {
      if (!activeFaculty) return [];
      return timetable
        .filter(s => (s.facultyId === activeFaculty.id || (s.facultyName && activeFaculty.name && s.facultyName.toLowerCase() === activeFaculty.name.toLowerCase())) && s.day === day)
        .sort((a, b) => {
          const tA = a.startMins != null ? a.startMins : parseTime(a.startTime);
          const tB = b.startMins != null ? b.startMins : parseTime(b.startTime);
          return tA - tB;
        });
    }
    if (!activeClass) return [];
    return timetable
      .filter(s => String(s.classId) === String(activeClass.id) && s.day === day)
      .sort((a, b) => {
        const tA = a.startMins != null ? a.startMins : parseTime(a.startTime);
        const tB = b.startMins != null ? b.startMins : parseTime(b.startTime);
        return tA - tB;
      });
  };

  const hasTimetable = viewMode === 'faculty'
    ? timetable.some(s => s.facultyId === activeFaculty?.id || (s.facultyName && activeFaculty?.name && s.facultyName.toLowerCase() === activeFaculty.name.toLowerCase()))
    : timetable.some(s => String(s.classId) === String(activeClass?.id));

  // ── Auto-generate for current active class ONLY ──
  const handleGenerateClassOnly = () => {
    if (!handleAutoGenerateTimetable) return;
    if (!activeClass) return;
    handleAutoGenerateTimetable({
      targetClassId: String(activeClass.id),
      targetGrade:   activeGrade || 'all'
    });
  };

  // ── Auto-generate for ALL classes ──
  const handleGenerateAllClasses = () => {
    if (!handleAutoGenerateTimetable) return;
    handleAutoGenerateTimetable({
      targetClassId: 'all',
      targetGrade:   selectedGrade !== 'ALL' ? selectedGrade : 'all'
    });
  };

  // ── Clear ──
  const handleConfirmClear = () => {
    if (clearTimetable) {
      clearTimetable({
        classId:     activeClass ? activeClass.id : 'ALL',
        gradeFilter: activeGrade || 'ALL'
      });
    }
  };

  // ── Delete single slot ──
  const handleConfirmDelete = () => {
    if (slotToDelete && deleteTimetableSlot) deleteTimetableSlot(slotToDelete.id);
  };

  // ── Export CSV ──
  const handleExportCSV = () => {
    if (!activeClass) return;
    const headers = ['Day', 'Period', 'Timing', 'Subject', 'Code', 'Faculty', 'Venue', 'Duration'];
    const rows = activeDays.flatMap(day =>
      getDaySlots(day).map(s => [
        `"${day}"`, `"${s.periodName}"`, `"${s.periodTime}"`,
        `"${s.subjectName}"`, `"${s.subjectCode}"`, `"${s.facultyName}"`,
        `"${s.venueRoomNo}"`, `"${s.durationMins} mins"`
      ])
    );
    const csv = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `Timetable_${activeClass.name}_Grade${activeGrade}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Summary stats ──
  const daySlotCounts = useMemo(() => {
    if (!activeClass) return {};
    const counts = {};
    activeDays.forEach(day => {
      const slots = getDaySlots(day);
      counts[day] = {
        total:    slots.length,
        academic: slots.filter(s => s.blockKind === 'ACADEMIC').length,
        eca:      slots.filter(s => s.blockKind === 'ECA_ANCHOR').length,
        breaks:   slots.filter(s => s.blockKind === 'BREAK' || s.blockKind === 'LUNCH').length
      };
    });
    return counts;
  }, [timetable, activeClass, activeDays]);

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── TOP CONTROL BAR ── */}
      <div className="section-header">
        <div className="filter-bar" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>

          {/* View Mode Selector Pills */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', gap: '3px', border: '1px solid #cbd5e1' }}>
            <button
              className={`btn ${viewMode === 'class' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px', border: 'none' }}
              onClick={() => setViewMode('class')}
            >
              Class View
            </button>
            <button
              className={`btn ${viewMode === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', borderRadius: '6px', border: 'none' }}
              onClick={() => setViewMode('faculty')}
            >
              Faculty View
            </button>
          </div>

          {/* Grade filter */}
          <select
            className="select-custom"
            value={selectedGrade}
            onChange={e => {
              setSelectedGrade(e.target.value);
              const matched = e.target.value === 'ALL'
                ? classes
                : classes.filter(c => getGradeStr(c) === e.target.value);
              if (matched.length) setSelectedClassId(matched[0].id);
            }}
          >
            <option value="ALL">All Grades</option>
            {uniqueGrades.map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>

          {/* Target Item Selector (Class or Faculty) */}
          {viewMode === 'class' && filteredClasses.length > 0 && (
            <select
              className="select-custom"
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
            >
              {filteredClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Grade {getGradeStr(c)})
                </option>
              ))}
            </select>
          )}

          {viewMode === 'faculty' && (
            <select
              className="select-custom"
              value={selectedFacultyId}
              onChange={e => setSelectedFacultyId(e.target.value)}
            >
              {filteredFaculties.map(f => (
                <option key={f.id} value={f.id}>
                  👤 {f.name} ({f.empId || 'Faculty'})
                </option>
              ))}
            </select>
          )}

          {/* Active summary */}
          {viewMode === 'class' && activeClass && hasTimetable && (
            <div
              style={{
                padding: '4px 12px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#166534',
                fontWeight: 700
              }}
            >
              ✓ {activeClass.name} — Grade {activeGrade} Timetable Ready
            </div>
          )}

          {viewMode === 'faculty' && activeFaculty && hasTimetable && (
            <div
              style={{
                padding: '4px 12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#1e40af',
                fontWeight: 700
              }}
            >
              👤 {activeFaculty.name} — Teaching Schedule
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-emerald"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
            onClick={handleGenerateClassOnly}
            title={`Generate timetable for ${activeClass ? activeClass.name : 'this class'} only`}
          >
            <Sparkles size={16} /> Auto-Generate
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleExportCSV}
            disabled={!hasTimetable}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Download size={15} /> CSV
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => window.print()}
            disabled={!hasTimetable}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Printer size={15} /> Print
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => setIsConfirmClearOpen(true)}
            disabled={!hasTimetable}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444', borderColor: '#fecdd3' }}
          >
            <Trash2 size={15} /> Clear
          </button>
        </div>
      </div>

      {/* ── PRINT HEADER (visible only when printing) ── */}
      <div className="print-only-header">
        <h2>BITSchool Master Timetable</h2>
        <p>
          {viewMode === 'faculty'
            ? `Faculty Teaching Schedule — ${activeFaculty?.name || 'Faculty'} (${activeFaculty?.empId || 'Staff'})`
            : `Grade ${activeGrade} — ${activeClass?.name || 'Class'} Section | Master Weekly Timetable (Monday – Saturday)`}
        </p>
      </div>

      {/* ── LEGEND BAR ── */}
      {hasTimetable && (
        <div
          className="legend-bar no-print"
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            padding: '8px 12px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            fontSize: '0.70rem',
            fontWeight: 700,
            color: '#475569',
            alignItems: 'center'
          }}
        >
          <span>Legend:</span>
          {[
            { color: '#059669', label: 'Physical Fitness' },
            { color: '#f59e0b', label: 'Break' },
            { color: '#ef4444', label: 'Lunch' },
            { color: '#d97706', label: 'ECA Activity' },
            { color: '#2563eb', label: 'Academic' }
          ].map(({ color, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: color, display: 'inline-block' }} />
              {label}
            </span>
          ))}

          {/* Bell times quick reference */}
          <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#94a3b8', fontSize: '0.65rem' }}>
            🏫 {bellConfig.schoolStartTime} → {bellConfig.schoolEndTime}
            &nbsp;|&nbsp;☕ {bellConfig.morningBreakStart} – {bellConfig.morningBreakEnd}
            &nbsp;|&nbsp;🍽 {bellConfig.lunchBreakStart} – {bellConfig.lunchBreakEnd}
            &nbsp;|&nbsp;☕ {bellConfig.afternoonBreakStart} – {bellConfig.afternoonBreakEnd}
          </span>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!hasTimetable ? (
        <div
          style={{
            padding: '5rem 2rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)'
          }}
        >
          <div
            style={{
              background: 'linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%)',
              color: '#059669',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem',
              boxShadow: '0 6px 18px rgba(5,150,105,0.18)'
            }}
          >
            <Sparkles size={42} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Ready to Generate Master Timetable
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', maxWidth: '480px', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            The generator uses your <strong>Bell Schedule</strong> for fixed anchors,
            <strong> ECA table</strong> for grade-specific activities, and
            <strong> Master Courses</strong> for academic periods — with no duplicate subjects per day.
          </p>
          <button
            className="btn"
            style={{
              padding: '0.85rem 2.5rem',
              fontSize: '1rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg,#059669,#047857)',
              color: '#fff',
              borderRadius: '12px',
              border: 'none',
              boxShadow: '0 6px 18px rgba(5,150,105,0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={handleGenerateClassOnly}
          >
            <Sparkles size={20} /> Generate Timetable ({activeClass ? activeClass.name : 'Class'})
          </button>

          {/* Quick Info Cards */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: '🔔', title: 'Bell Schedule', desc: `${bellConfig.schoolStartTime || '08:30 AM'} → ${bellConfig.schoolEndTime || '03:45 PM'}` },
              { icon: '🏃', title: 'Physical Fitness', desc: 'Always first period of the day' },
              { icon: '🎭', title: 'ECA Activities', desc: 'Fixed post-lunch, grade-specific' },
              { icon: '📚', title: 'Academic Periods', desc: 'No duplicate subjects per day' }
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                style={{
                  padding: '1rem 1.25rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  textAlign: 'center',
                  minWidth: '140px'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>{title}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── TIMETABLE GRID ── */
        <div
          style={{
            overflowX: 'auto',
            paddingBottom: '1rem'
          }}
        >
          <div
            className="timetable-grid"
            style={{
              display: 'flex',
              gap: '1rem',
              minWidth: `${activeDays.length * 215}px`,
              alignItems: 'flex-start'
            }}
          >
            {activeDays.map(day => {
              const slots    = getDaySlots(day);
              const ecaLabel = getDayEcaLabel(ecaSchedule, activeGrade, day);
              return (
                <DayColumn
                  key={day}
                  day={day}
                  gradeStr={activeGrade}
                  ecaLabel={ecaLabel}
                  slots={slots}
                  onEdit={setSlotToEdit}
                  onDelete={setSlotToDelete}
                  viewMode={viewMode}
                />
              );
            })}
          </div>

          {/* Summary row */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem',
              flexWrap: 'wrap'
            }}
          >
            {activeDays.map(day => {
              const c = daySlotCounts[day] || {};
              return (
                <div
                  key={day + '_summary'}
                  style={{
                    flex: '1 1 200px',
                    maxWidth: '280px',
                    padding: '6px 10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    gap: '8px',
                    fontSize: '0.63rem',
                    fontWeight: 700,
                    color: '#64748b',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ color: '#2563eb' }}>📚 {c.academic} Academic</span>
                  <span style={{ color: '#d97706' }}>✨ {c.eca} ECA</span>
                  <span style={{ color: '#94a3b8' }}>☕ {c.breaks} Breaks</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {slotToEdit && (
        <ManualEditModal
          slot={slotToEdit}
          subjects={schoolCtx.subjects || []}
          faculties={faculties}
          venues={venues}
          onClose={() => setSlotToEdit(null)}
          onSave={details => {
            if (schoolCtx.updateTimetableSlot) {
              schoolCtx.updateTimetableSlot(slotToEdit.id, details);
            }
            setSlotToEdit(null);
          }}
        />
      )}

      {slotToDelete && (
        <ConfirmModal
          isOpen={Boolean(slotToDelete)}
          title="Delete Slot"
          message={`Remove "${slotToDelete.subjectName}" from ${slotToDelete.day}?`}
          confirmLabel="Delete"
          confirmStyle="danger"
          onConfirm={() => { handleConfirmDelete(); setSlotToDelete(null); }}
          onCancel={() => setSlotToDelete(null)}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmClearOpen}
        title="Clear Timetable"
        message={`This will delete the entire timetable for ${activeClass?.name || 'the selected class'}. Continue?`}
        confirmLabel="Clear All"
        confirmStyle="danger"
        onConfirm={() => { handleConfirmClear(); setIsConfirmClearOpen(false); }}
        onCancel={() => setIsConfirmClearOpen(false)}
      />
    </div>
  );
}
