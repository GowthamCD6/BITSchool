import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  Users,
  Building2,
  CalendarCheck2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Tv,
  Monitor,
  FlaskConical,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const {
    faculties,
    venues,
    classes,
    subjects,
    timetable,
    timetableStats,
    setActiveTab,
    handleAutoGenerateTimetable
  } = useSchool();

  const projectorVenues = venues.filter((v) => v.type === 'projector').length;
  const normalVenues = venues.filter((v) => v.type === 'normal').length;
  const labVenues = venues.filter((v) => v.type === 'computer_lab' || v.type === 'science_lab').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '2rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-projector">ADMIN ROLE</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BITSchool Portal v2.4</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
            Automated Faculty & Venue Timetable Scheduler
          </h2>
          <p style={{ color: '#e0e7ff', maxWidth: '650px', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Manage faculty allocations, normal vs. projector-equipped classrooms, and run automatic 6-Day x 8-Period conflict-free timetable scheduling.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-emerald" onClick={handleAutoGenerateTimetable}>
            <Sparkles size={18} /> Run Auto Scheduler
          </button>
          <button className="btn btn-secondary" onClick={() => setActiveTab('timetable')}>
            View 6x8 Matrix <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card" onClick={() => setActiveTab('faculties')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-lbl">Total Faculty Members</div>
            <div className="stat-val">{faculties.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.3rem' }}>
              100% Active Teaching Staff
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
            <Users size={26} />
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => setActiveTab('venues')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-lbl">Classrooms & Venues</div>
            <div className="stat-val">{venues.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', marginTop: '0.3rem' }}>
              {projectorVenues} Projector Smart Rooms
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
            <Building2 size={26} />
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => setActiveTab('classes')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-lbl">Active Classes / Grades</div>
            <div className="stat-val">{classes.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.3rem' }}>
              {classes.reduce((sum, c) => sum + c.studentCount, 0)} Enrolled Students
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <BookOpen size={26} />
          </div>
        </div>

        <div className="glass-card stat-card" onClick={() => setActiveTab('timetable')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-lbl">Auto-Scheduled Slots</div>
            <div className="stat-val">{timetable.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '0.3rem' }}>
              {timetableStats.utilizationRate}% Schedule Efficiency
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <CalendarCheck2 size={26} />
          </div>
        </div>
      </div>

      {/* Middle Section: Venue Breakdown & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Venue Facilities Overview */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Venue Facility Distribution</h3>
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
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '6px', background: '#f3e8ff', color: '#7c3aed' }}>
                  <Tv size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Normal Class + Projector</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Smart AV equipped rooms</div>
                </div>
              </div>
              <span className="badge badge-projector">{projectorVenues} Venues</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '6px', background: '#eff6ff', color: '#2563eb' }}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Normal Classroom</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard theory lecture halls</div>
                </div>
              </div>
              <span className="badge badge-normal">{normalVenues} Venues</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: '#f8fafc',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.4rem', borderRadius: '6px', background: '#e0f2fe', color: '#0284c7' }}>
                  <Monitor size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Computer & Science Labs</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Practical experiment labs</div>
                </div>
              </div>
              <span className="badge badge-lab">{labVenues} Venues</span>
            </div>
          </div>
        </div>

        {/* Timetable Working Days & Allocation Rule Summary */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.2rem' }}>
            Scheduler Structure & Constraints
          </h3>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>6 Working Days</strong>: Monday through Saturday cycle.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>8 Daily Periods</strong>: 48 total period slots per class per week (+ Lunch break after Period 4).</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Double-Booking Protection</strong>: Zero faculty or venue overlaps allowed.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-sub)' }}>
              <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span><strong>Smart Venue Routing</strong>: Subject requirements map directly to Projector Rooms or Specialist Labs.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
