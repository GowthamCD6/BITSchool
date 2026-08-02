import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import PrimaryDataEntry from './pages/PrimaryData/PrimaryDataEntry';
import FacultyManagement from './pages/Faculty/FacultyManagement';
import VenueManagement from './pages/Venue/VenueManagement';
import TimetableScheduler from './pages/TimeTable/TimetableScheduler';
import BellScheduleConfigPage from './pages/BellSchedule/BellScheduleConfigPage';
import ReportsPage from './pages/Reports/ReportsPage';

function AppContent() {
  const { isAuthenticated, activeTab } = useSchool();

  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <Toast />
      </>
    );
  }

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
      case 'bell-schedule':
        return <BellScheduleConfigPage />;
      case 'timetable':
        return <TimetableScheduler />;
      case 'reports':
        return <ReportsPage />;
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
