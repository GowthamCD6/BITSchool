import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import ManualEditModal from '../../components/ManualEditModal';
import Modal from '../../components/Modal';
import { calculateDynamicPeriodsFromBellConfig } from '../../utils/timetableGenerator';
import {
  Sparkles,
  Printer,
  Download,
  Tv,
  AlertTriangle,
  UserCheck,
  Building,
  Calendar,
  Grid,
  ListFilter,
  Activity,
  Coffee,
  Utensils,
  Clock,
  BookOpen
} from 'lucide-react';

function getGradeVal(cls) {
  if (!cls || cls.grade === undefined) return '4';
  if (typeof cls.grade === 'object' && cls.grade !== null) {
    return String(cls.grade.name || cls.grade.id || '4').replace('Grade ', '');
  }
  return String(cls.grade).replace('Grade ', '');
}

// Helper: Convert 12hr/24hr string into total minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const clean = String(timeStr).trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const timeOnly = clean.replace(/AM|PM/g, '').trim();
  let [h, m] = timeOnly.split(':').map(Number);
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

// Helper: Format total minutes into 12-hour AM/PM string (e.g. 08:30 AM, 02:15 PM)
function formatMinutesTo12Hr(totalMins) {
  let mins = totalMins % (24 * 60);
  let hrs = Math.floor(mins / 60);
  const m = mins % 60;
  const period = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12;
  if (hrs === 0) hrs = 12;
  const hh = String(hrs).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm} ${period}`;
}

export default function TimetableScheduler() {
  const schoolContext = useSchool();
  const {
    timetable = [],
    classes = [],
    faculties = [],
    venues = [],
    days = [],
    bellConfig = {},
    ecaSchedule = {},
    handleAutoGenerateTimetable
  } = schoolContext || {};

  // ── Timetable View State ──
  const [viewMode, setViewMode] = useState('class'); // 'class' | 'faculty' | 'venue'
  const [layoutMode, setLayoutMode] = useState('day_wise'); // 'day_wise' | 'period_matrix'
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'c1');
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculties[0]?.id || 'f1');
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || 'v1');
  const [slotToEdit, setSlotToEdit] = useState(null);
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [genScope, setGenScope] = useState('all');

  // Compute dynamic period times from master bell schedule parameters
  const dynamicPeriods = useMemo(() => {
    return calculateDynamicPeriodsFromBellConfig(bellConfig);
  }, [bellConfig]);

  const hasGeneratedTimetable = timetable.length > 0;
  const activeClassObj = classes.find(c => c.id === selectedClassId) || classes[0];
  const activeGradeStr = getGradeVal(activeClassObj);

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

  // Build Day Timeline with Sacred Break Boundaries
  const buildDayTimeline = (day) => {
    const mBStart = bellConfig.morningBreakStart || '10:45 AM';
    const mBEnd = bellConfig.morningBreakEnd || '11:00 AM';
    const lStart = bellConfig.lunchBreakStart || '11:45 AM';
    const lEnd = bellConfig.lunchBreakEnd || '12:30 PM';
    const aBStart = bellConfig.afternoonBreakStart || '02:30 PM';
    const aBEnd = bellConfig.afternoonBreakEnd || '02:45 PM';

    const daySlots = timetable.filter(
      t => (viewMode === 'class' ? t.classId === selectedClassId : viewMode === 'faculty' ? t.facultyId === selectedFacultyId : t.venueId === selectedVenueId) && t.day === day
    ).sort((a, b) => a.period - b.period);

    const timeline = [];
    let insertedMB = false;
    let insertedLunch = false;
    let insertedAB = false;

    daySlots.forEach((slot) => {
      const slotStartMins = parseTimeToMinutes(slot.startTime);
      const mBStartMins = parseTimeToMinutes(mBStart);
      const lStartMins = parseTimeToMinutes(lStart);
      const aBStartMins = parseTimeToMinutes(aBStart);

      // Insert Morning Break
      if (!insertedMB && slotStartMins >= mBStartMins) {
        timeline.push({
          type: 'break',
          name: 'Morning Break',
          icon: Coffee,
          time: `${mBStart} - ${mBEnd}`,
          bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          borderColor: '#fde68a',
          color: '#92400e'
        });
        insertedMB = true;
      }

      // Insert Lunch Break
      if (!insertedLunch && slotStartMins >= lStartMins) {
        if (!insertedMB) {
          timeline.push({
            type: 'break',
            name: 'Morning Break',
            icon: Coffee,
            time: `${mBStart} - ${mBEnd}`,
            bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            borderColor: '#fde68a',
            color: '#92400e'
          });
          insertedMB = true;
        }
        timeline.push({
          type: 'lunch',
          name: 'Lunch Break',
          icon: Utensils,
          time: `${lStart} - ${lEnd}`,
          bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          borderColor: '#fecdd3',
          color: '#991b1b'
        });
        insertedLunch = true;
      }

      // Insert Afternoon Break
      if (!insertedAB && slotStartMins >= aBStartMins) {
        if (!insertedLunch) {
          timeline.push({
            type: 'lunch',
            name: 'Lunch Break',
            icon: Utensils,
            time: `${lStart} - ${lEnd}`,
            bg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
            borderColor: '#fecdd3',
            color: '#991b1b'
          });
          insertedLunch = true;
        }
        timeline.push({
          type: 'break',
          name: 'Afternoon Break',
          icon: Coffee,
          time: `${aBStart} - ${aBEnd}`,
          bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
          borderColor: '#fde68a',
          color: '#92400e'
        });
        insertedAB = true;
      }

      timeline.push({
        type: 'slot',
        slot: slot,
        time: slot.periodTime || `${slot.startTime} - ${slot.endTime}`
      });
    });

    return timeline;
  };

  // Helper to extract active ECA vertical label for day header
  const getDayEcaHeaderTag = (day) => {
    const dayUpper = String(day).toUpperCase();
    const gradeKey = `${activeGradeStr}_${dayUpper}`;
    const dayEcaMap = ecaSchedule[gradeKey] || ecaSchedule[dayUpper] || {};

    if (typeof dayEcaMap === 'object') {
      const activeEntries = Object.entries(dayEcaMap).filter(([_, v]) => v && (v.active || (v.label && v.label !== 'No' && !v.label.startsWith('No'))));
      if (activeEntries.length > 0) {
        return activeEntries[0][0];
      }
    }
    return null;
  };

  const handleExportCSV = () => {
    const headers = ['Class', 'Day', 'Period', 'Period Time', 'Subject Code', 'Subject Name', 'Faculty Name', 'Venue Room', 'Venue Type'];
    const rows = timetable.map((t) => {
      return [
        `"${t.className}"`,
        `"${t.day}"`,
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
    link.setAttribute('download', `BITSchool_Master_Timetable.csv`);
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
      handleAutoGenerateTimetable({ targetGrade: activeGradeStr });
    } else {
      handleAutoGenerateTimetable({ targetClassId: 'all', targetGrade: 'all' });
    }
    setIsScopeModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ── MASTER TIMETABLE HEADER BAR ── */}
      <div
        className="week-nav-bar"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          padding: '1.2rem 1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {/* ROW 1: Header Title & Main Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', padding: '0.65rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
                Master School Timetable Scheduler
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Clock size={13} color="#3b82f6" /> 12-Hour Milestone Engine • Equalized Weekly Periods & Sacred Breaks
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <button
              className="btn"
              onClick={() => setIsScopeModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                padding: '0.6rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                cursor: 'pointer'
              }}
            >
              <Sparkles size={16} /> Auto-Generate Timetable
            </button>

            <button className="btn btn-secondary" onClick={handleExportCSV} title="Export CSV" disabled={!hasGeneratedTimetable} style={{ borderRadius: '10px', fontWeight: 700, padding: '0.6rem 1rem' }}>
              <Download size={16} /> CSV
            </button>
            <button className="btn btn-secondary" onClick={handlePrint} title="Print Schedule" disabled={!hasGeneratedTimetable} style={{ borderRadius: '10px', fontWeight: 700, padding: '0.6rem 1rem' }}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#e2e8f0', width: '100%' }} />

        {/* ROW 2: View Filter Mode Selector & Layout Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Left Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            {/* View Filter Mode Selector */}
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '3px', border: '1px solid #e2e8f0' }}>
              <button
                className={`btn-toggle ${viewMode === 'class' ? 'active' : ''}`}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderRadius: '7px',
                  border: 'none',
                  background: viewMode === 'class' ? '#ffffff' : 'transparent',
                  color: viewMode === 'class' ? '#2563eb' : '#64748b',
                  boxShadow: viewMode === 'class' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setViewMode('class')}
              >
                Class View
              </button>
              <button
                className={`btn-toggle ${viewMode === 'faculty' ? 'active' : ''}`}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderRadius: '7px',
                  border: 'none',
                  background: viewMode === 'faculty' ? '#ffffff' : 'transparent',
                  color: viewMode === 'faculty' ? '#2563eb' : '#64748b',
                  boxShadow: viewMode === 'faculty' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setViewMode('faculty')}
              >
                Faculty View
              </button>
              <button
                className={`btn-toggle ${viewMode === 'venue' ? 'active' : ''}`}
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderRadius: '7px',
                  border: 'none',
                  background: viewMode === 'venue' ? '#ffffff' : 'transparent',
                  color: viewMode === 'venue' ? '#2563eb' : '#64748b',
                  boxShadow: viewMode === 'venue' ? '0 2px 6px rgba(0, 0, 0, 0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setViewMode('venue')}
              >
                Venue View
              </button>
            </div>

            {/* Target Item Selector */}
            {viewMode === 'class' && (
              <select
                className="select-custom"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', minWidth: '180px' }}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Grade {getGradeVal(c)})
                  </option>
                ))}
              </select>
            )}

            {viewMode === 'faculty' && (
              <select
                className="select-custom"
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', minWidth: '180px' }}
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
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', minWidth: '180px' }}
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.roomNo} - {v.name} ({v.type === 'projector' ? 'Projector' : v.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right Layout Switcher */}
          <div style={{ display: 'flex', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '3px', borderRadius: '10px', gap: '3px' }}>
            <button
              onClick={() => setLayoutMode('day_wise')}
              title="Day-Wise Column Layout"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem',
                fontSize: '0.8rem', fontWeight: 700, borderRadius: '7px', border: 'none',
                background: layoutMode === 'day_wise' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
                color: layoutMode === 'day_wise' ? '#ffffff' : '#64748b', cursor: 'pointer',
                boxShadow: layoutMode === 'day_wise' ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <ListFilter size={15} /> Day Columns View
            </button>
            <button
              onClick={() => setLayoutMode('period_matrix')}
              title="Period Matrix Grid Format"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem',
                fontSize: '0.8rem', fontWeight: 700, borderRadius: '7px', border: 'none',
                background: layoutMode === 'period_matrix' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
                color: layoutMode === 'period_matrix' ? '#ffffff' : '#64748b', cursor: 'pointer',
                boxShadow: layoutMode === 'period_matrix' ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Grid size={15} /> Period Matrix
            </button>
          </div>
        </div>
      </div>

      {/* ── TIMETABLE DISPLAY AREA ── */}
      {!hasGeneratedTimetable ? (
        <div className="week-empty-state" style={{ padding: '4rem 1.5rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)' }}>
          <div className="week-empty-icon" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', color: '#059669', width: '76px', height: '76px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', boxShadow: '0 6px 16px rgba(5, 150, 105, 0.15)' }}>
            <Sparkles size={40} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Master Timetable Ready for Auto-Generation
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '500px', lineHeight: 1.6 }}>
            Click below to generate the master timetable using Primary Data parameters, Bell Schedule Milestones, and ECA Non-Academic Schedule.
          </p>
          <button
            className="btn"
            style={{ marginTop: '1.4rem', padding: '0.8rem 2rem', fontSize: '0.95rem', fontWeight: 800, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', color: '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 6px 18px rgba(5, 150, 105, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            onClick={() => setIsScopeModalOpen(true)}
          >
            <Sparkles size={20} /> Generate Master Timetable Now
          </button>
        </div>
      ) : layoutMode === 'day_wise' ? (
        /* ── DAY-WISE CARDS SPREADSHEET LAYOUT (Refined & Modern) ── */
        <div style={{ overflowX: 'auto', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', gap: '1.25rem', minWidth: '1450px' }}>
            {days.map((day) => {
              const ecaTag = getDayEcaHeaderTag(day);
              const dayTimeline = buildDayTimeline(day);

              return (
                <div
                  key={day}
                  style={{
                    flex: 1,
                    minWidth: '235px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.05)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* Day Banner Header */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: '#ffffff',
                      padding: '0.9rem 0.75rem',
                      textAlign: 'center',
                      position: 'relative',
                      borderBottom: '3px solid #2563eb'
                    }}
                  >
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(37, 99, 235, 0.25)', color: '#93c5fd', padding: '2px 8px', borderRadius: '20px', fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', border: '1px solid rgba(147, 197, 253, 0.3)' }}>
                      Grade {activeGradeStr}
                    </div>

                    <div style={{ fontWeight: 900, fontSize: '0.95rem', letterSpacing: '0.06em', color: '#ffffff', textTransform: 'uppercase' }}>
                      {day}
                    </div>

                    {ecaTag && (
                      <div
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: '#fef08a',
                          background: 'rgba(217, 119, 6, 0.25)',
                          border: '1px solid rgba(254, 240, 138, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          marginTop: '6px',
                          display: 'inline-block',
                          maxWidth: '95%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={ecaTag}
                      >
                        ✨ {ecaTag}
                      </div>
                    )}
                  </div>

                  {/* Sub-Header Table */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '0.45rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#475569', letterSpacing: '0.04em' }}>
                      <div style={{ width: '42%', textAlign: 'center', borderRight: '1px solid #cbd5e1', paddingRight: '4px' }}>
                        TIMING
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', paddingLeft: '4px' }}>
                        SCHEDULE / ACTIVITY
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {dayTimeline.map((item, idx) => {
                        if (item.type === 'break' || item.type === 'lunch') {
                          const IconComp = item.icon || Coffee;
                          return (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: item.bg,
                                borderBottom: `1px dashed ${item.borderColor}`,
                                padding: '0.45rem 0.5rem'
                              }}
                            >
                              <div
                                style={{
                                  width: '42%',
                                  fontSize: '0.66rem',
                                  fontWeight: 800,
                                  color: item.color,
                                  textAlign: 'center',
                                  borderRight: `1px dashed ${item.borderColor}`,
                                  paddingRight: '4px'
                                }}
                              >
                                {item.time}
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  fontWeight: 800,
                                  fontSize: '0.72rem',
                                  color: item.color,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px'
                                }}
                              >
                                <IconComp size={12} /> {item.name}
                              </div>
                            </div>
                          );
                        }

                        const slot = item.slot;
                        const isEca = slot?.venueType === 'eca';
                        const isFitness = slot?.subjectName?.toLowerCase().includes('fitness') || slot?.subjectName?.toLowerCase().includes('physical');

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'stretch',
                              borderBottom: '1px solid #f1f5f9',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            {/* Timing Column */}
                            <div
                              style={{
                                width: '42%',
                                padding: '0.5rem 0.3rem',
                                borderRight: '1px solid #f1f5f9',
                                fontSize: '0.67rem',
                                fontWeight: 800,
                                color: '#64748b',
                                textAlign: 'center',
                                background: '#fafafa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {item.time}
                            </div>

                            {/* Schedule / Activity Card */}
                            <div
                              style={{
                                flex: 1,
                                padding: '0.45rem 0.55rem',
                                background: isEca
                                  ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
                                  : isFitness
                                  ? 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)'
                                  : '#ffffff',
                                borderLeft: slot?.subjectColor ? `3px solid ${slot.subjectColor}` : '3px solid #3b82f6',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              onClick={() => slot && setSlotToEdit(slot)}
                              title="Click to edit slot"
                            >
                              {slot ? (
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                    <div
                                      style={{
                                        fontWeight: 800,
                                        fontSize: '0.76rem',
                                        color: isEca ? '#92400e' : isFitness ? '#065f46' : '#0f172a',
                                        lineHeight: 1.3
                                      }}
                                    >
                                      {slot.subjectName}
                                    </div>
                                    {slot.isConflict && (
                                      <span title="Schedule Conflict!" style={{ color: '#ef4444' }}>
                                        <AlertTriangle size={12} />
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ fontSize: '0.67rem', color: isEca ? '#b45309' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontWeight: 600 }}>
                                    <UserCheck size={10} color={isEca ? '#b45309' : '#3b82f6'} />
                                    <span>{slot.facultyName}</span>
                                  </div>

                                  <div style={{ fontSize: '0.65rem', color: isEca ? '#d97706' : '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                                    <Building size={10} color={isEca ? '#d97706' : '#94a3b8'} />
                                    <span>{slot.venueRoomNo}</span>
                                  </div>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontStyle: 'italic' }}>Open Slot</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ── PERIOD MATRIX LAYOUT ── */
        <div className="timetable-container" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)' }}>
          <table className="timetable-matrix">
            <thead>
              <tr>
                <th className="day-col">Day / Period</th>
                {dynamicPeriods.map((p) => {
                  const isBreak1 = p.id === 2;
                  const isLunch = p.id === 4;
                  const isBreak2 = p.id === 6;

                  return (
                    <React.Fragment key={p.id}>
                      <th>
                        <div>{p.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
                          {p.time}
                        </div>
                      </th>
                      {isBreak1 && (
                        <th style={{ width: '80px', background: '#fffbeb', color: '#92400e', fontSize: '0.72rem', fontWeight: 800 }}>
                          ☕ 1ST BREAK<br />
                          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{bellConfig.morningBreakStart || '10:45 AM'} - {bellConfig.morningBreakEnd || '11:00 AM'}</span>
                        </th>
                      )}
                      {isLunch && (
                        <th style={{ width: '90px', background: '#fef2f2', color: '#991b1b', fontSize: '0.72rem', fontWeight: 800 }}>
                          🍱 LUNCH<br />
                          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{bellConfig.lunchBreakStart || '11:45 AM'} - {bellConfig.lunchBreakEnd || '12:30 PM'}</span>
                        </th>
                      )}
                      {isBreak2 && (
                        <th style={{ width: '80px', background: '#fffbeb', color: '#92400e', fontSize: '0.72rem', fontWeight: 800 }}>
                          ☕ 2ND BREAK<br />
                          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{bellConfig.afternoonBreakStart || '02:30 PM'} - {bellConfig.afternoonBreakEnd || '02:45 PM'}</span>
                        </th>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {days.map((day) => {
                return (
                  <tr key={day}>
                    <td
                      style={{
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        color: 'var(--text-main)',
                        background: '#f8fafc',
                        paddingLeft: '1rem'
                      }}
                    >
                      {day}
                    </td>

                    {dynamicPeriods.map((p) => {
                      const slot = getSlot(day, p.id);
                      const isBreak1 = p.id === 2;
                      const isLunch = p.id === 4;
                      const isBreak2 = p.id === 6;

                      return (
                        <React.Fragment key={p.id}>
                          <td>
                            {slot ? (
                              <div
                                className="period-cell"
                                onClick={() => setSlotToEdit(slot)}
                                title="Click to edit slot"
                                style={slot.venueType === 'eca' ? { background: '#fef3c7', borderColor: '#fef08a' } : {}}
                              >
                                <div>
                                  <div className="period-cell-subj" style={slot.venueType === 'eca' ? { color: '#92400e', fontWeight: 800 } : {}}>
                                    {slot.subjectName}
                                  </div>
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
                                Open Slot
                              </div>
                            )}
                          </td>

                          {isBreak1 && (
                            <td>
                              <div style={{
                                background: '#fffbeb', border: '1px dashed #fef08a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#92400e', fontSize: '0.75rem', fontWeight: 800,
                                height: '100%', borderRadius: 'var(--radius-sm)', textAlign: 'center'
                              }}>
                                <div>☕<br />Break</div>
                              </div>
                            </td>
                          )}

                          {isLunch && (
                            <td>
                              <div className="period-cell-lunch" style={{ textAlign: 'center' }}>
                                <div>🍱<br />Lunch</div>
                              </div>
                            </td>
                          )}

                          {isBreak2 && (
                            <td>
                              <div style={{
                                background: '#fffbeb', border: '1px dashed #fef08a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#92400e', fontSize: '0.75rem', fontWeight: 800,
                                height: '100%', borderRadius: 'var(--radius-sm)', textAlign: 'center'
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

      {/* ── AUTO GENERATE MASTER TIMETABLE MODAL ── */}
      <Modal
        isOpen={isScopeModalOpen}
        onClose={() => setIsScopeModalOpen(false)}
        title="Auto-Generate Master Academic Timetable"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-sub)' }}>
            Select the scope for auto-generating the Master Timetable. The algorithm will automatically place academic subjects matching weekly period quotas & locked ECA non-academic slots.
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
                  Entire School (All Classes & Grades)
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
                  Specific Grade Level (Grade {activeGradeStr})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Re-schedule all sections in Grade {activeGradeStr} specifically.
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
                  Selected Class Only ({activeClassObj?.name || 'Grade 4-A'})
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Re-schedule timetable slots for {activeClassObj?.name || 'Grade 4-A'} only.
                </div>
              </div>
            </label>
          </div>

          <div className="modal-footer" style={{ padding: 0, background: 'transparent', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsScopeModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-emerald" onClick={runScopeGenerator}>
              <Sparkles size={16} /> Run Master Generator Now
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
