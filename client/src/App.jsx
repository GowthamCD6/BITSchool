import React from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Toast from './components/Toast';

import Login from './pages/Auth/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import PrimaryDataEntry from './pages/PrimaryData/PrimaryDataEntry';
import FacultyManagement from './pages/FacultyManagement';
import VenueManagement from './pages/VenueManagement';
import TimetableScheduler from './pages/TimeTable/TimetableScheduler';

function AppContent() {
  const { isAuthenticated, activeTab, isPageLoading } = useSchool();

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
          {isPageLoading ? (
            <div className="page-loader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '400px', color: '#64748b' }}>
              <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p style={{ marginTop: '1rem', fontWeight: 500 }}>Loading Content...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            renderActivePage()
          )}
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
