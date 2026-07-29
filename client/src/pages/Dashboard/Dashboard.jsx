import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  Building2,
  CalendarCheck2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Tv,
  Monitor,
  ArrowRight,
  Layers,
  ShieldCheck
} from 'lucide-react';

export default function Dashboard() {
  const {
    faculties,
    venues,
    classes,
    timetable,
    timetableStats,
    setActiveTab,
    handleAutoGenerateTimetable
  } = useSchool();

  const projectorVenues = venues.filter((v) => v.type === 'projector').length;
  const normalVenues = venues.filter((v) => v.type === 'normal').length;
  const labVenues = venues.filter((v) => v.type === 'computer_lab' || v.type === 'science_lab').length;
  const totalStudents = classes.reduce((sum, c) => sum + c.studentCount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── 1. WELCOME HERO BANNER ── */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)',
          border: 'none'
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.6rem' }}>
            <span
              style={{
                padding: '0.2rem 0.65rem',
                borderRadius: '20px',
                background: 'rgba(37, 99, 235, 0.25)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}
            >
              ADMIN PORTAL
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <ShieldCheck size={14} color="#10b981" /> System Operational v2.4
            </span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.4px', lineHeight: 1.25 }}>
            Automated Faculty & Venue Timetable Scheduler
          </h2>

          <p style={{ color: '#cbd5e1', marginTop: '0.45rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Configure school grades, sections, teaching staff, and run automatic 6-Day x 8-Period conflict-free timetable matrix scheduling.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-emerald" style={{ padding: '0.7rem 1.3rem', fontSize: '0.9rem' }} onClick={handleAutoGenerateTimetable}>
            <Sparkles size={18} /> Run Auto Scheduler
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '0.7rem 1.2rem', fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={() => setActiveTab('timetable')}
          >
            View Matrix <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* ── 2. METRIC STAT CARDS ── */}
      <div className="stats-grid">
        <div
          className="glass-card stat-card"
          onClick={() => setActiveTab('primary-data')}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div>
            <div className="stat-lbl">Primary Grades & Sections</div>
            <div className="stat-val">{classes.length} Sections</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', marginTop: '0.35rem', fontWeight: 600 }}>
              {totalStudents} Enrolled Students
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Layers size={24} />
          </div>
        </div>

        <div
          className="glass-card stat-card"
          onClick={() => setActiveTab('faculties')}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div>
            <div className="stat-lbl">Total Faculty Members</div>
            <div className="stat-val">{faculties.length} Staff</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontWeight: 600 }}>
              100% Teaching Active
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Users size={24} />
          </div>
        </div>

        <div
          className="glass-card stat-card"
          onClick={() => setActiveTab('venues')}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div>
            <div className="stat-lbl">Classrooms & Venues</div>
            <div className="stat-val">{venues.length} Venues</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-purple)', marginTop: '0.35rem', fontWeight: 600 }}>
              {projectorVenues} Smart AV Rooms
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
            <Building2 size={24} />
          </div>
        </div>

        <div
          className="glass-card stat-card"
          onClick={() => setActiveTab('timetable')}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div>
            <div className="stat-lbl">Scheduled Period Slots</div>
            <div className="stat-val">{timetable.length} Slots</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginTop: '0.35rem', fontWeight: 600 }}>
              {timetableStats.utilizationRate}% Schedule Efficiency
            </div>
          </div>
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CalendarCheck2 size={24} />
          </div>
        </div>
      </div>

      {/* ── 3. QUICK ACTIONS BAR ── */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.85rem' }}>
          Quick Admin Actions & Navigation Shortcuts
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', background: '#f8fafc' }}
            onClick={() => setActiveTab('primary-data')}
          >
            <Layers size={18} color="var(--primary)" />
            <span>Primary Data Entry</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', background: '#f8fafc' }}
            onClick={() => setActiveTab('faculties')}
          >
            <Users size={18} color="var(--accent-emerald)" />
            <span>Manage Teaching Staff</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', background: '#f8fafc' }}
            onClick={() => setActiveTab('venues')}
          >
            <Building2 size={18} color="var(--accent-purple)" />
            <span>Configure Venues</span>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', background: '#f8fafc' }}
            onClick={() => setActiveTab('timetable')}
          >
            <CalendarCheck2 size={18} color="var(--accent-cyan)" />
            <span>Open Timetable Matrix</span>
          </button>
        </div>
      </div>

      {/* ── 4. MIDDLE SECTION: VENUE DISTRIBUTION & SYSTEM CONSTRAINTS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Venue Facilities Overview */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Venue Facility Distribution</h3>
            <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }} onClick={() => setActiveTab('venues')}>
              Manage Venues
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed' }}>
                  <Tv size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Normal Class + Projector</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Smart AV equipped rooms</div>
                </div>
              </div>
              <span className="badge badge-projector">{projectorVenues} Venues</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Normal Classroom</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Standard theory lecture halls</div>
                </div>
              </div>
              <span className="badge badge-normal">{normalVenues} Venues</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7' }}>
                  <Monitor size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>Computer & Science Labs</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Practical experiment labs</div>
                </div>
              </div>
              <span className="badge badge-lab">{labVenues} Venues</span>
            </div>
          </div>
        </div>

        {/* Timetable Working Days & Allocation Rule Summary */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.2rem' }}>
            Scheduler Structure & Constraints
          </h3>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', listStyle: 'none' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>6 Working Days</strong>: Monday through Saturday cycle.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>8 Daily Periods</strong>: 48 total period slots per class per week (+ Lunch break after Period 4).</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Double-Booking Protection</strong>: Zero faculty or venue overlaps allowed.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Smart Venue Routing</strong>: Subject requirements map directly to Projector Rooms or Specialist Labs.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
