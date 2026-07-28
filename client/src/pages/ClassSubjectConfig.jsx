import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { BookOpen, Tv, Monitor, FlaskConical, Users, Home } from 'lucide-react';

export default function ClassSubjectConfig() {
  const { classes, subjects, venues } = useSchool();

  const getVenueTypeBadge = (type) => {
    switch (type) {
      case 'projector':
        return <span className="badge badge-projector"><Tv size={12} /> Projector Room</span>;
      case 'computer_lab':
        return <span className="badge badge-lab"><Monitor size={12} /> Computer Lab</span>;
      case 'science_lab':
        return <span className="badge badge-science"><FlaskConical size={12} /> Science Lab</span>;
      default:
        return <span className="badge badge-normal"><BookOpen size={12} /> Normal Class</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Active Classes & Sections */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
          Active Grade Classes & Home Venues
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {classes.map((cls) => {
            const homeVen = venues.find((v) => v.id === cls.homeVenueId);
            return (
              <div
                key={cls.id}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>{cls.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                    <Users size={14} /> {cls.studentCount} Students
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Home Venue</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Home size={14} /> {homeVen ? homeVen.roomNo : 'Unassigned'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Curriculum & Venue Facility Requirements */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
          Subject Curriculum & Required Venue Type
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Subject Code</th>
                <th style={{ padding: '0.75rem 1rem' }}>Subject Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Weekly Target Periods</th>
                <th style={{ padding: '0.75rem 1rem' }}>Required Venue Facility</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subj) => (
                <tr key={subj.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                    {subj.code}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: subj.color }}>
                    {subj.name}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                    {subj.weeklyPeriods} Periods / Week
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    {getVenueTypeBadge(subj.requiredVenueType)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
