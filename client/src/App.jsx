import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

import Dashboard from './pages/Dashboard/Dashboard';
import PrimaryDataEntry from './pages/PrimaryData/PrimaryDataEntry';
import FacultyManagement from './pages/FacultyManagement';
import VenueManagement from './pages/VenueManagement';
import TimetableScheduler from './pages/TimeTable/TimetableScheduler';

function AppContent() {
  const { activeTab } = useSchool();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'primary-data':
      case 'classes':
        return <PrimaryDataEntry />;
      case 'faculties':
        return <FacultyManagement />;
      case 'venues':
        return <VenueManagement />;
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
