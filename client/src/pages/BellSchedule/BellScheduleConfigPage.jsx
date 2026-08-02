import React, { useState, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Clock, Coffee, Utensils, Save, Bell } from 'lucide-react';

function to12HourFormat(timeStr) {
  if (!timeStr) return '';
  const clean = String(timeStr).trim();
  if (clean.includes('AM') || clean.includes('PM')) return clean;

  const parts = clean.split(':');
  if (parts.length < 2) return clean;

  let h = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);

  if (isNaN(h)) h = 9;
  if (isNaN(m)) m = 0;

  const period = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  const hh = String(h12).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm} ${period}`;
}

export default function BellScheduleConfigPage() {
  const { bellConfig = {}, saveBellConfig, showToast } = useSchool();

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

  useEffect(() => {
    if (bellConfig && Object.keys(bellConfig).length > 0) {
      setBellForm({
        schoolStartTime: to12HourFormat(bellConfig.schoolStartTime || '08:30 AM'),
        morningBreakStart: to12HourFormat(bellConfig.morningBreakStart || '10:00 AM'),
        morningBreakEnd: to12HourFormat(bellConfig.morningBreakEnd || '10:15 AM'),
        lunchBreakStart: to12HourFormat(bellConfig.lunchBreakStart || '11:45 AM'),
        lunchBreakEnd: to12HourFormat(bellConfig.lunchBreakEnd || '12:30 PM'),
        afternoonBreakStart: to12HourFormat(bellConfig.afternoonBreakStart || '02:00 PM'),
        afternoonBreakEnd: to12HourFormat(bellConfig.afternoonBreakEnd || '02:15 PM'),
        schoolEndTime: to12HourFormat(bellConfig.schoolEndTime || '03:45 PM')
      });
    }
  }, [bellConfig]);

  const handleSaveBellConfig = async (e) => {
    e.preventDefault();

    // Formatted payload ensuring 12-hour AM/PM format
    const formattedPayload = {
      schoolStartTime: to12HourFormat(bellForm.schoolStartTime),
      morningBreakStart: to12HourFormat(bellForm.morningBreakStart),
      morningBreakEnd: to12HourFormat(bellForm.morningBreakEnd),
      lunchBreakStart: to12HourFormat(bellForm.lunchBreakStart),
      lunchBreakEnd: to12HourFormat(bellForm.lunchBreakEnd),
      afternoonBreakStart: to12HourFormat(bellForm.afternoonBreakStart),
      afternoonBreakEnd: to12HourFormat(bellForm.afternoonBreakEnd),
      schoolEndTime: to12HourFormat(bellForm.schoolEndTime)
    };

    setBellForm(formattedPayload);

    if (saveBellConfig) {
      await saveBellConfig(formattedPayload);
    } else {
      showToast('School Bell Schedule parameters updated.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 'calc(100vh - 120px)', height: '100%' }}>
      {/* Master Bell Parameters Form Card */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: '16px' }}>
        <div>
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              paddingBottom: '0.85rem',
              marginBottom: '1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Clock size={20} color="#2563eb" /> Configure Daily School Milestones (12-Hour AM/PM)
          </div>

          <form onSubmit={handleSaveBellConfig} id="bell-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Clock size={15} color="#2563eb" /> School Day Start Time (12-Hour AM/PM)
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.55rem 0.85rem', fontSize: '0.92rem', fontWeight: 600 }}
                  placeholder="e.g. 09:15 AM"
                  value={bellForm.schoolStartTime}
                  onChange={(e) => setBellForm({ ...bellForm, schoolStartTime: e.target.value })}
                  onBlur={(e) => setBellForm({ ...bellForm, schoolStartTime: to12HourFormat(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <Bell size={15} color="#2563eb" /> School Day End Time (12-Hour AM/PM)
                </label>
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.55rem 0.85rem', fontSize: '0.92rem', fontWeight: 600 }}
                  placeholder="e.g. 03:40 PM"
                  value={bellForm.schoolEndTime}
                  onChange={(e) => setBellForm({ ...bellForm, schoolEndTime: e.target.value })}
                  onBlur={(e) => setBellForm({ ...bellForm, schoolEndTime: to12HourFormat(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* First Break (Morning) */}
            <div style={{ background: '#fffbeb', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400e', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Coffee size={16} /> First Break (Morning)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#78350f', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>Break Start Time</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.88rem', fontWeight: 600 }}
                    placeholder="10:45 AM"
                    value={bellForm.morningBreakStart}
                    onChange={(e) => setBellForm({ ...bellForm, morningBreakStart: e.target.value })}
                    onBlur={(e) => setBellForm({ ...bellForm, morningBreakStart: to12HourFormat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#78350f', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>Break End Time</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.88rem', fontWeight: 600 }}
                    placeholder="11:00 AM"
                    value={bellForm.morningBreakEnd}
                    onChange={(e) => setBellForm({ ...bellForm, morningBreakEnd: e.target.value })}
                    onBlur={(e) => setBellForm({ ...bellForm, morningBreakEnd: to12HourFormat(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Lunch Break */}
            <div style={{ background: '#fef2f2', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#991b1b', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Utensils size={16} /> Lunch Break
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#7f1d1d', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>Lunch Start Time</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.88rem', fontWeight: 600 }}
                    placeholder="11:45 AM"
                    value={bellForm.lunchBreakStart}
                    onChange={(e) => setBellForm({ ...bellForm, lunchBreakStart: e.target.value })}
                    onBlur={(e) => setBellForm({ ...bellForm, lunchBreakStart: to12HourFormat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#7f1d1d', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>Lunch End Time</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.88rem', fontWeight: 600 }}
                    placeholder="12:30 PM"
                    value={bellForm.lunchBreakEnd}
                    onChange={(e) => setBellForm({ ...bellForm, lunchBreakEnd: e.target.value })}
                    onBlur={(e) => setBellForm({ ...bellForm, lunchBreakEnd: to12HourFormat(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Second Break (Afternoon) */}
            <div style={{ background: '#fffbeb', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #fef08a' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#92400e', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Coffee size={16} /> Second Break (Afternoon)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#78350f', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>Break Start Time</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.88rem', fontWeight: 600 }}
                    placeholder="02:30 PM"
                    value={bellForm.afternoonBreakStart}
                    onChange={(e) => setBellForm({ ...bellForm, afternoonBreakStart: e.target.value })}
                    onBlur={(e) => setBellForm({ ...bellForm, afternoonBreakStart: to12HourFormat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', color: '#78350f', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>Break End Time</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.88rem', fontWeight: 600 }}
                    placeholder="02:45 PM"
                    value={bellForm.afternoonBreakEnd}
                    onChange={(e) => setBellForm({ ...bellForm, afternoonBreakEnd: e.target.value })}
                    onBlur={(e) => setBellForm({ ...bellForm, afternoonBreakEnd: to12HourFormat(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <button
          type="submit"
          form="bell-form"
          className="btn btn-primary"
          style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '10px' }}
        >
          <Save size={18} /> Save School Bell Timing Parameters
        </button>
      </div>
    </div>
  );
}
