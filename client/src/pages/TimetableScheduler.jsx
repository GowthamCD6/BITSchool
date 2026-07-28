import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import ManualEditModal from '../components/ManualEditModal';
import {
  Sparkles,
  Printer,
  Download,
  Filter,
  Tv,
  AlertTriangle,
  Clock,
  UserCheck,
  Building
} from 'lucide-react';

export default function TimetableScheduler() {
  const {
    timetable,
    classes,
    faculties,
    venues,
    days,
    periods,
    handleAutoGenerateTimetable
  } = useSchool();

  const [viewMode, setViewMode] = useState('class'); // 'class' | 'faculty' | 'venue'
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'c1');
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculties[0]?.id || 'f1');
  const [selectedVenueId, setSelectedVenueId] = useState(venues[0]?.id || 'v1');

  const [slotToEdit, setSlotToEdit] = useState(null);

  // Filter timetable entries based on active view mode
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

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['Class', 'Day', 'Period', 'Period Time', 'Subject Code', 'Subject Name', 'Faculty Name', 'Venue Room', 'Venue Type'];
    const rows = timetable.map(t => [
      `"${t.className}"`,
      `"${t.day}"`,
      `"${t.periodName}"`,
      `"${t.periodTime}"`,
      `"${t.subjectCode}"`,
      `"${t.subjectName}"`,
      `"${t.facultyName}"`,
      `"${t.venueRoomNo}"`,
      `"${t.venueType}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BITSchool_Timetable_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print view handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Action Header & View Switcher */}
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
          <button className="btn btn-emerald" onClick={handleAutoGenerateTimetable}>
            <Sparkles size={16} /> Auto-Generate Timetable
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV} title="Export CSV">
            <Download size={16} /> CSV
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} title="Print Schedule">
            <Printer size={16} /> Print
          </button>
        </div>
      </div>

      {/* 6-Day x 8-Period Timetable Grid */}
      <div className="timetable-container">
        <table className="timetable-matrix">
          <thead>
            <tr>
              <th className="day-col">Day / Period</th>
              {periods.map((p) => {
                const isLunchAfter = p.id === 4;
                return (
                  <React.Fragment key={p.id}>
                    <th>
                      <div>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                        {p.time}
                      </div>
                    </th>
                    {isLunchAfter && (
                      <th
                        style={{
                          width: '70px',
                          background: 'rgba(245, 158, 11, 0.1)',
                          color: 'var(--accent-amber)',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                      >
                        LUNCH BREAK
                      </th>
                    )}
                  </React.Fragment>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: 'var(--text-main)',
                    background: '#f1f5f9',
                    paddingLeft: '1.25rem'
                  }}
                >
                  {day}
                </td>

                {periods.map((p) => {
                  const slot = getSlot(day, p.id);
                  const isLunchAfter = p.id === 4;

                  return (
                    <React.Fragment key={p.id}>
                      <td>
                        {slot ? (
                          <div
                            className="period-cell"
                            style={{ borderLeftColor: slot.subjectColor || 'var(--primary)' }}
                            onClick={() => setSlotToEdit(slot)}
                            title="Click to edit cell slot"
                          >
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
                                <span title="Normal Class + Projector Room" style={{ color: '#c084fc' }}>
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

                      {/* Lunch Break column slot */}
                      {isLunchAfter && (
                        <td>
                          <div className="period-cell-lunch">
                            <div>
                              🍱<br />
                              Lunch
                            </div>
                          </div>
                        </td>
                      )}
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cell Editor Modal */}
      <ManualEditModal
        isOpen={!!slotToEdit}
        onClose={() => setSlotToEdit(null)}
        slotToEdit={slotToEdit}
      />
    </div>
  );
}
