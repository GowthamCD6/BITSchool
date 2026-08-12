import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import bitLogo from '../assets/BIT-logo.png';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarDays,
  GraduationCap,
  Layers,
  Clock,
  BarChart3,
  LogOut,
  ChevronUp,
  MoreVertical,
  UserPlus,
  User as UserIcon
} from 'lucide-react';

export default function Sidebar() {
  const { activeTab, setActiveTab, faculties, venues, users = [], currentUser, logout } = useSchool();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const userPic = currentUser?.picture || currentUser?.avatar || currentUser?.photoURL;

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        { id: 'bell-schedule', label: 'Bell Schedule Engine', icon: Clock },
      ]
    },
    {
      title: 'SCHEDULING & MATRIX',
      items: [
        { id: 'timetable', label: 'Time Table Scheduler', icon: CalendarDays, badge: 'Auto' },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'ADMINISTRATION & ACCESS',
      items: [
        { id: 'users', label: 'User Management', icon: UserPlus, badge: users.length },
      ]
    }
  ];

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-header" style={{ gap: '10px' }}>
        <img
          src={bitLogo}
          alt="Bannari Amman Logo"
          style={{ height: '36px', width: 'auto', objectFit: 'contain', borderRadius: '4px' }}
        />
        <div className="brand-text-wrap">
          <div className="brand-title">BITSchool</div>
          <div className="brand-subtitle">Bannari Amman Admin</div>
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

      {/* ADMIN PROFILE FOOTER WITH POPOUT MENU */}
      <div className="sidebar-footer" ref={userMenuRef} style={{ position: 'relative' }}>

        {/* POPOUT MENU */}
        {isUserMenuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '12px',
              right: '12px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.18), 0 4px 12px -2px rgba(15, 23, 42, 0.08)',
              border: '1px solid #e2e8f0',
              padding: '10px',
              zIndex: 1000,
              animation: 'fadeInUp 0.15s ease-out'
            }}
          >
            {/* User Details in Popup */}
            <div style={{ padding: '4px 6px 8px 6px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                {currentUser?.name || 'Principal Admin'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                {currentUser?.email || 'admin@bitschool.edu'}
              </div>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '2px 8px',
                  background: '#f1f5f9',
                  color: '#475569',
                  borderRadius: '6px',
                  fontSize: '0.65rem',
                  fontWeight: 700
                }}
              >
                {currentUser?.role || 'Administrator'}
              </div>
            </div>

            <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 0' }} />

            {/* Log Out Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsUserMenuOpen(false);
                logout();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #fee2e2',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        )}

        {/* CLICKABLE USER CARD */}
        <div
          className="admin-profile-card"
          onClick={() => setIsUserMenuOpen(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '8px 10px',
            cursor: 'pointer',
            userSelect: 'none',
            transition: 'all 0.15s ease',
            borderColor: isUserMenuOpen ? '#2563eb' : '#e5e7eb',
            backgroundColor: isUserMenuOpen ? '#f0f6ff' : '#f9fafb'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
            <div
              className="avatar"
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '50%',
                backgroundColor: currentUser?.avatarColor || '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: 'none',
                flexShrink: 0
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
            <div className="admin-info" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <span
                className="admin-name"
                style={{
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentUser?.name || 'Principal Admin'}
              </span>
              <span
                className="admin-role"
                style={{
                  fontSize: '0.7rem',
                  color: '#64748b',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {currentUser?.role || 'Administrator'}
              </span>
            </div>
          </div>

          <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <ChevronUp size={16} style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
          </div>
        </div>
      </div>
    </aside>
  );
}
