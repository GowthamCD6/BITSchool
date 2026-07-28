import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard';
import FacultyManagement from './pages/FacultyManagement';
import VenueManagement from './pages/VenueManagement';
import ClassSubjectConfig from './pages/ClassSubjectConfig';
import TimetableScheduler from './pages/TimetableScheduler';

function AppContent() {
  const { activeTab } = useSchool();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'faculties':
        return <FacultyManagement />;
      case 'venues':
        return <VenueManagement />;
      case 'classes':
        return <ClassSubjectConfig />;
      case 'timetable':
        return <TimetableScheduler />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Component strictly located at src/components/Sidebar.jsx */}
      <Sidebar />

      <main className="main-content">
        <Header />
        <div className="page-body">
          {renderActivePage()}
        </div>
      </main>

      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
}
