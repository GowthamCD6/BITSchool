import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { BarChart3, Users, Building2, CalendarDays, CheckCircle2, Download, Printer, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export default function ReportsPage() {
  const { faculties = [], venues = [], classes = [], subjects = [], timetable = [] } = useSchool();

  const totalAllocatedSlots = timetable.length;
  const facultyUtilizationRate = faculties.length > 0 ? Math.round((totalAllocatedSlots / (faculties.length * 25)) * 100) : 85;
  const venueOccupancyRate = venues.length > 0 ? Math.round((totalAllocatedSlots / (venues.length * 30)) * 100) : 78;

  const handleExportSummaryCSV = () => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Faculty Staff', faculties.length],
      ['Total Classrooms & Venues', venues.length],
      ['Total Grade Classes', classes.length],
      ['Total Master Subjects', subjects.length],
      ['Total Scheduled Slots', totalAllocatedSlots],
      ['Faculty Utilization Efficiency', `${facultyUtilizationRate}%`],
      ['Venue Occupancy Rate', `${venueOccupancyRate}%`]
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'BITSchool_Academic_Analytics_Summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 color="#2563eb" size={24} />
            Academic Reports & Master Analytics
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-sub)', marginTop: '3px' }}>
            Institutional Workload Metrics, Room Occupancy Heatmaps, and Timetable Utilization Analysis
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleExportSummaryCSV}>
            <Download size={16} /> Export Summary
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} /> Print Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#eff6ff', color: '#2563eb' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Faculty Efficiency</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{facultyUtilizationRate}%</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#f0fdf4', color: '#16a34a' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Venue Occupancy</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{venueOccupancyRate}%</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: '#faf5ff', color: '#9333ea' }}>
            <CalendarDays size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Allocated Timetable Slots</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>{totalAllocatedSlots} Slots</div>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {/* Faculty Workload Breakdown */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} color="#2563eb" /> Faculty Workload Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faculties.slice(0, 6).map((f) => {
              const assignedCount = timetable.filter(t => t.facultyId === f.id).length;
              const maxWeekly = f.maxPeriodsPerWeek || 25;
              const percentage = Math.min(Math.round((assignedCount / maxWeekly) * 100), 100);

              return (
                <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span>{f.name} ({f.empId})</span>
                    <span style={{ color: '#2563eb' }}>{assignedCount} / {maxWeekly} Periods</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: 'linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Venue Utilization Breakdown */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="#059669" /> Classroom Occupancy Matrix
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {venues.slice(0, 6).map((v) => {
              const assignedCount = timetable.filter(t => t.venueId === v.id).length;
              const maxSlots = 30;
              const percentage = Math.min(Math.round((assignedCount / maxSlots) * 100), 100);

              return (
                <div key={v.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700 }}>
                    <span>{v.roomNo} - {v.name}</span>
                    <span style={{ color: '#059669' }}>{assignedCount} / {maxSlots} Slots</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${percentage}%`, background: 'linear-gradient(90deg, #10b981 0%, #047857 100%)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
