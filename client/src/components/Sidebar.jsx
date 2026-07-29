import React from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  GraduationCap,
  Layers,
  User as UserIcon
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, faculties, venues } = useSchool();

  const navGroups = [
    {
      title: '',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'ACADEMIC SETUP & DATA ENTRY',
      items: [
        { id: 'primary-data', label: 'Primary Data Entry', icon: Layers },
        { id: 'faculties', label: 'Faculty Management', icon: Users, badge: faculties.length },
        { id: 'venues', label: 'Venue & Classrooms', icon: Building2, badge: venues.length },
      ]
    },
    {
      title: 'SCHEDULING & MATRIX',
      items: [
        { id: 'timetable', label: 'Time Table Scheduler', icon: CalendarDays, badge: 'Auto' },
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <GraduationCap size={24} />
        </div>
        <div className="brand-text-wrap">
          <div className="brand-title">BITSchool</div>
          <div className="brand-subtitle">Admin Portal</div>
        </div>
      </div>

      {/* NAV GROUPS & SCROLL AREA */}
      <div className="nav-wrapper sidebar-scroll-area">
        {navGroups.map((group, idx) => (
          <div key={idx} className="nav-section">
            {group.title && <div className="nav-section-title">{group.title}</div>}
            <ul className="nav-menu">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <li
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="icon" size={20} />
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`nav-badge ${isActive ? 'active' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* ADMIN PROFILE FOOTER */}
      <div className="sidebar-footer">
        <div className="admin-profile-card">
          <div className="avatar">
            <UserIcon size={18} />
          </div>
          <div className="admin-info">
            <span className="admin-name">Principal Admin</span>
            <span className="admin-role">System Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
