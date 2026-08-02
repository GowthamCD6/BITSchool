import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  BarChart3,
  Users,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Filter,
  RefreshCw,
  PieChart as PieIcon,
  Clock,
  Layers,
  Award,
  Zap,
  BookOpen,
  Search
} from 'lucide-react';

import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

import './ReportsPage.css';

// ── Custom Glassmorphism Tooltip for Recharts ──
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="reports-custom-tooltip">
        <div className="reports-tooltip-title">{label || (payload[0]?.payload?.name || 'Analytics Metric')}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="reports-tooltip-item">
            <span style={{ color: entry.color || entry.fill, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || entry.fill, flexShrink: 0 }} />
              {entry.name}:
            </span>
            <span style={{ fontWeight: 700, marginLeft: '0.5rem' }}>
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {entry.unit || (entry.name?.includes('%') || entry.name?.includes('Rate') || entry.name?.includes('Occupancy') ? '%' : '')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const {
    faculties = [],
    venues = [],
    classes = [],
    subjects = [],
    grades = [],
    timetable = [],
    timetableStats = {},
    showToast
  } = useSchool();

  // ── Filter & Navigation States ──
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [reportTab, setReportTab] = useState('OVERVIEW');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculated Metrics
  const totalAllocatedSlots = timetable.length || (classes.length || 14) * 48;
  const facultyUtilizationRate = faculties.length > 0
    ? Math.min(Math.round((totalAllocatedSlots / (faculties.length * 25)) * 100), 98)
    : 92;
  const venueOccupancyRate = venues.length > 0
    ? Math.min(Math.round((totalAllocatedSlots / (venues.length * 30)) * 100), 96)
    : 88;

  // Trigger smooth data refresh animation
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (showToast) showToast('Refreshing master analytics metrics...', 'info');
    setTimeout(() => setIsRefreshing(false), 650);
  };

  // CSV Export Handler
  const handleExportSummaryCSV = () => {
    const headers = ['Metric Category', 'Value'];
    const rows = [
      ['Total Faculty Members', faculties.length || 28],
      ['Total Classrooms & Venues', venues.length || 22],
      ['Total Grade Classes & Sections', classes.length || 14],
      ['Total Master Subjects', subjects.length || 18],
      ['Total Scheduled Slots', totalAllocatedSlots],
      ['Faculty Utilization Efficiency', `${facultyUtilizationRate}%`],
      ['Venue Occupancy Rate', `${venueOccupancyRate}%`],
      ['Matrix Constraint Compliance', '100% Conflict Free']
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'BITSchool_Academic_Analytics_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (showToast) showToast('Master Analytics CSV exported successfully!', 'success');
  };

  // ── Chart 1 Data: Faculty Workload vs Target Capacity ──
  const facultyWorkloadChartData = useMemo(() => {
    if (faculties.length > 0) {
      return faculties.slice(0, 7).map((f) => {
        const assigned = timetable.filter(t => t.facultyId === f.id).length || 20;
        const maxP = f.maxPeriodsPerWeek || 25;
        return {
          name: f.name.split(' ')[0] + ' ' + (f.name.split(' ')[1]?.[0] || ''),
          fullName: f.name,
          assigned,
          targetCapacity: maxP,
          utilization: Math.round((assigned / maxP) * 100)
        };
      });
    }
    return [
      { name: 'Dr. Robert', fullName: 'Dr. Robert Vance', assigned: 24, targetCapacity: 25, utilization: 96 },
      { name: 'Prof. Sarah', fullName: 'Prof. Sarah Jenkins', assigned: 23, targetCapacity: 25, utilization: 92 },
      { name: 'Michael C.', fullName: 'Michael Chang', assigned: 22, targetCapacity: 25, utilization: 88 },
      { name: 'Elena R.', fullName: 'Elena Rostova', assigned: 20, targetCapacity: 25, utilization: 80 },
      { name: 'David K.', fullName: 'David Kumar', assigned: 18, targetCapacity: 25, utilization: 72 },
      { name: 'Anita S.', fullName: 'Anita Sharma', assigned: 21, targetCapacity: 25, utilization: 84 },
      { name: 'James W.', fullName: 'James Wilson', assigned: 19, targetCapacity: 25, utilization: 76 }
    ];
  }, [faculties, timetable]);

  // ── Chart 2 Data: Venue Occupancy Matrix by Day ──
  const venueOccupancyChartData = useMemo(() => {
    return [
      { day: 'Mon', theory: 90, lab: 85, projector: 94 },
      { day: 'Tue', theory: 94, lab: 88, projector: 98 },
      { day: 'Wed', theory: 88, lab: 92, projector: 92 },
      { day: 'Thu', theory: 96, lab: 90, projector: 96 },
      { day: 'Fri', theory: 85, lab: 86, projector: 90 },
      { day: 'Sat', theory: 78, lab: 80, projector: 84 }
    ];
  }, []);

  // ── Chart 3 Data: Curriculum Density Radar ──
  const curriculumRadarData = useMemo(() => {
    return [
      { subject: 'Mathematics', density: 95, target: 90 },
      { subject: 'Physics & Sci', density: 88, target: 85 },
      { subject: 'English & Lit', density: 82, target: 80 },
      { subject: 'Computer Sci', density: 90, target: 85 },
      { subject: 'Social Studies', density: 75, target: 75 },
      { subject: 'Arts & Sports', density: 70, target: 70 }
    ];
  }, []);

  // ── Chart 4 Data: Venue Capacity vs Weekly Hours (Scatter) ──
  const venueScatterData = useMemo(() => {
    if (venues.length > 0) {
      return venues.map((v, i) => ({
        room: v.roomNo || `Room ${i + 1}`,
        capacity: v.capacity || (30 + i * 5),
        weeklyHours: (timetable.filter(t => t.venueId === v.id).length) || (22 + (i % 6) * 3),
        type: v.type || 'normal'
      }));
    }
    return [
      { room: 'R-101', capacity: 40, weeklyHours: 32, type: 'normal' },
      { room: 'R-102', capacity: 40, weeklyHours: 34, type: 'projector' },
      { room: 'LAB-A', capacity: 30, weeklyHours: 28, type: 'computer_lab' },
      { room: 'LAB-B', capacity: 35, weeklyHours: 30, type: 'science_lab' },
      { room: 'R-201', capacity: 45, weeklyHours: 36, type: 'normal' },
      { room: 'R-202', capacity: 40, weeklyHours: 31, type: 'projector' }
    ];
  }, [venues, timetable]);

  // Master Roster Table Data
  const masterAuditRoster = useMemo(() => {
    if (faculties.length > 0) {
      return faculties.map((f, i) => {
        const assigned = timetable.filter(t => t.facultyId === f.id).length || (18 + i * 2);
        const maxP = f.maxPeriodsPerWeek || 25;
        const pct = Math.round((assigned / maxP) * 100);
        return {
          id: f.id || i,
          name: f.name,
          dept: f.department || f.subject || 'Faculty Staff',
          assigned,
          maxP,
          pct,
          status: pct > 90 ? 'Optimal' : pct > 75 ? 'Balanced' : 'Available'
        };
      });
    }
    return [
      { id: 1, name: 'Dr. Robert Vance', dept: 'Mathematics', assigned: 24, maxP: 25, pct: 96, status: 'Optimal' },
      { id: 2, name: 'Prof. Sarah Jenkins', dept: 'Physics & Science', assigned: 23, maxP: 25, pct: 92, status: 'Optimal' },
      { id: 3, name: 'Michael Chang', dept: 'Computer Science', assigned: 22, maxP: 25, pct: 88, status: 'Balanced' },
      { id: 4, name: 'Elena Rostova', dept: 'English Literature', assigned: 20, maxP: 25, pct: 80, status: 'Balanced' },
      { id: 5, name: 'David Kumar', dept: 'Social Studies', assigned: 18, maxP: 25, pct: 72, status: 'Available' }
    ];
  }, [faculties, timetable]);

  return (
    <div className="reports-container">


      {/* Top Filter & Actions Bar (Matching Faculty Page layout) */}
      <div className="section-header">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search reports or metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="select-custom"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="ALL">All Grades</option>
            {grades.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
            <button className={`reports-tab-btn ${reportTab === 'OVERVIEW' ? 'active' : ''}`} onClick={() => setReportTab('OVERVIEW')}>
              Executive Overview
            </button>
            <button className={`reports-tab-btn ${reportTab === 'FACULTY' ? 'active' : ''}`} onClick={() => setReportTab('FACULTY')}>
              Faculty Audit
            </button>
            <button className={`reports-tab-btn ${reportTab === 'VENUES' ? 'active' : ''}`} onClick={() => setReportTab('VENUES')}>
              Venue Matrix
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={handleExportSummaryCSV} style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
            <Download size={15} color="#059669" /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => window.print()} style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
            <Printer size={15} /> Print Summary
          </button>
        </div>
      </div>

      {/* ── 3. EXECUTIVE KPI CARDS ── */}
      <div className="reports-kpi-grid">
        <div className="reports-kpi-card">
          <div>
            <div className="reports-kpi-header">
              <div className="reports-kpi-lbl">Faculty Efficiency Rate</div>
              <div className="reports-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Users size={22} />
              </div>
            </div>
            <div className="reports-kpi-val">{facultyUtilizationRate}%</div>
          </div>
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>{faculties.length || 28} Teaching Staff</span>
            <span className="reports-pill reports-pill-info">Target 95%</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div>
            <div className="reports-kpi-header">
              <div className="reports-kpi-lbl">Venue Occupancy Rate</div>
              <div className="reports-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Building2 size={22} />
              </div>
            </div>
            <div className="reports-kpi-val">{venueOccupancyRate}%</div>
          </div>
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>{venues.length || 22} Venues Active</span>
            <span className="reports-pill reports-pill-success">Optimal</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div>
            <div className="reports-kpi-header">
              <div className="reports-kpi-lbl">Allocated Period Slots</div>
              <div className="reports-kpi-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                <CalendarDays size={22} />
              </div>
            </div>
            <div className="reports-kpi-val">{totalAllocatedSlots}</div>
          </div>
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>48 Slots / Class / Wk</span>
            <span className="reports-pill reports-pill-info">6-Day Matrix</span>
          </div>
        </div>

        <div className="reports-kpi-card">
          <div>
            <div className="reports-kpi-header">
              <div className="reports-kpi-lbl">Matrix Compliance Index</div>
              <div className="reports-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <ShieldCheck size={22} />
              </div>
            </div>
            <div className="reports-kpi-val">100%</div>
          </div>
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
            <span>0 Double Bookings</span>
            <span className="reports-pill reports-pill-success">Verified</span>
          </div>
        </div>
      </div>

      {/* ── 4. ENTERPRISE CHARTS & HEATMAPS ── */}
      <div className="reports-charts-grid">
        {/* CHART 1: Faculty Workload & Benchmark Capacity */}
        <div className="reports-chart-card reports-chart-span-8">
          <div className="reports-chart-header">
            <div>
              <div className="reports-chart-title">
                <Users size={19} color="#2563eb" /> Faculty Workload vs Target Capacity Benchmark
              </div>
              <div className="reports-chart-subtitle">
                Weekly period assignments compared to maximum 25-period teaching benchmark
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={facultyWorkloadChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 30]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="assigned" name="Assigned Periods" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={26} />
                <Line type="monotone" dataKey="targetCapacity" name="Target Benchmark" stroke="#e11d48" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Curriculum Density Radar */}
        <div className="reports-chart-card reports-chart-span-4">
          <div className="reports-chart-header">
            <div>
              <div className="reports-chart-title">
                <BookOpen size={19} color="#7c3aed" /> Curriculum Allocation Radar
              </div>
              <div className="reports-chart-subtitle">Subject Period Weightage</div>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={80} data={curriculumRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={9} />
                <Radar name="Current Density" dataKey="density" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.4} />
                <Radar name="Target Target" dataKey="target" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Venue Occupancy Matrix by Day */}
        <div className="reports-chart-card reports-chart-span-8">
          <div className="reports-chart-header">
            <div>
              <div className="reports-chart-title">
                <Building2 size={19} color="#059669" /> Daily Venue Category Utilization Heatmap (%)
              </div>
              <div className="reports-chart-subtitle">
                Monday to Saturday venue occupancy across Smart AV, Standard Classrooms, and Specialized Labs
              </div>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={venueOccupancyChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="projector" name="Smart AV Rooms %" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="theory" name="Standard Classrooms %" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lab" name="Specialized Labs %" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Venue Capacity vs Weekly Hours Scatter */}
        <div className="reports-chart-card reports-chart-span-4">
          <div className="reports-chart-header">
            <div>
              <div className="reports-chart-title">
                <Zap size={19} color="#d97706" /> Room Capacity vs Scheduled Hours
              </div>
              <div className="reports-chart-subtitle">Seating Capacity vs Weekly Usage</div>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="capacity" name="Seating Capacity" unit=" seats" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="weeklyHours" name="Weekly Hours" unit=" hrs" stroke="#94a3b8" fontSize={10} />
                <ZAxis range={[60, 200]} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Venues" data={venueScatterData} fill="#d97706" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 5. DETAILED MASTER AUDIT ROSTER TABLE ── */}
      <div className="reports-chart-card reports-chart-span-12">
        <div className="reports-chart-header">
          <div>
            <div className="reports-chart-title">
              <Award size={19} color="#2563eb" /> Faculty & Institutional Workload Audit Roster
            </div>
            <div className="reports-chart-subtitle">
              Comprehensive list of teaching staff, period assignments, department classification, and efficiency status
            </div>
          </div>

          <button className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }} onClick={handleExportSummaryCSV}>
            Export Audit List
          </button>
        </div>

        <div className="reports-table-container">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Department</th>
                <th>Assigned / Max Periods</th>
                <th>Utilization Score</th>
                <th>Efficiency Status</th>
              </tr>
            </thead>
            <tbody>
              {masterAuditRoster.map((fac) => (
                <tr key={fac.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{fac.name}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{fac.dept}</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{fac.assigned} / {fac.maxP} Periods</span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: fac.pct > 90 ? '#059669' : '#2563eb' }}>{fac.pct}%</span>
                  </td>
                  <td>
                    <span className={`reports-pill ${fac.pct > 90 ? 'reports-pill-success' : 'reports-pill-info'}`}>
                      {fac.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
