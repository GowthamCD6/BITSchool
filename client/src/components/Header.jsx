import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { Sparkles, Calendar, LogOut, User as UserIcon } from 'lucide-react';

export default function Header() {
  const { activeTab, handleAutoGenerateTimetable, currentUser, logout } = useSchool();

  const titles = {
    dashboard: 'Dashboard',
    'primary-data': 'Grade-Wise Academic Data Setup',
    faculties: 'Faculty Management',
    venues: 'Venue & Classroom Management',
    timetable: 'Time Table Scheduler'
  };

  const currentTitle = titles[activeTab] || titles.dashboard;

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="header-title">{currentTitle}</h1>
      </div>

      <div className="header-right">

        <div className="user-info" style={{ gap: '0.75rem' }}>
          <div className="user-text">
            <div className="user-name">{currentUser?.name || 'Dr. Robert Vance'}</div>
            <div className="user-role">{currentUser?.role || 'Administrator'}</div>
          </div>
          <div className="user-avatar" style={{ background: currentUser?.avatarColor || '#2563eb' }}>
            <UserIcon size={18} />
          </div>

          <button
            className="btn btn-secondary"
            onClick={logout}
            title="Sign Out of BITSchool"
            style={{ padding: '0.4rem 0.65rem', marginLeft: '0.2rem', color: '#ef4444', border: '1px solid #fee2e2', background: '#fef2f2' }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
