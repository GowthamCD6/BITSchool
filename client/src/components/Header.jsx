import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { Sparkles, Calendar, User as UserIcon } from 'lucide-react';

export default function Header() {
  const { activeTab, handleAutoGenerateTimetable } = useSchool();

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
        <button
          className="btn btn-emerald"
          onClick={handleAutoGenerateTimetable}
          title="Run 6-Day x 8-Period Auto Timetable Generator"
        >
          <Sparkles size={16} />
          Auto Schedule Matrix
        </button>

        <div className="header-info-pill">
          <Calendar size={14} className="calendar-icon" />
          <span>6-Day Work Week</span>
        </div>

        <div className="user-info">
          <div className="user-text">
            <div className="user-name">Principal Admin</div>
            <div className="user-role">Administrator</div>
          </div>
          <div className="user-avatar">
            <UserIcon size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}
