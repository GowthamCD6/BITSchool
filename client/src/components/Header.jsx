import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { Sparkles, Calendar, LogOut, User as UserIcon } from 'lucide-react';

export default function Header() {
  const { activeTab, currentUser } = useSchool();

  const titles = {
    dashboard: 'Dashboard',
    'primary-data': 'Grade-Wise Academic Data Setup',
    users: 'User Account Management',
    faculties: 'Faculty Management',
    venues: 'Venue & Classroom Management',
    'bell-schedule': 'Bell Schedule Engine',
    timetable: 'Time Table Scheduler',
    reports: 'Reports & Analytics'
  };

  const currentTitle = titles[activeTab] || titles.dashboard;
  const userPic = currentUser?.picture || currentUser?.avatar || currentUser?.photoURL;

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
          <div
            className="user-avatar"
            style={{
              background: currentUser?.avatarColor || '#2563eb',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%'
            }}
          >
            {userPic ? (
              <img
                src={userPic}
                alt={currentUser?.name || 'User'}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <UserIcon size={18} color="#ffffff" style={{ color: '#ffffff' }} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
