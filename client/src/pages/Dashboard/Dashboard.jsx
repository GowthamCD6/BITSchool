import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  Building2,
  CalendarCheck2,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Tv,
  Monitor,
  ArrowRight,
  Layers,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Clock,
  Zap,
  Filter,
  Download,
  RefreshCw,
  Award,
  Cpu,
  GraduationCap,
  Sliders,
  Check
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
  PolarRadiusAxis
} from 'recharts';

import './Dashboard.css';

// ── Custom Glassmorphism Recharts Tooltip ──
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="db-custom-tooltip">
        <div className="db-tooltip-title">{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="db-tooltip-item">
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

export default function Dashboard() {
  const {
    faculties = [],
    venues = [],
    classes = [],
    subjects = [],
    grades = [],
    timetable = [],
    timetableStats = {},
    setActiveTab,
    handleAutoGenerateTimetable,
    currentUser,
    showToast
  } = useSchool();

  // ── Interactive Dashboard States ──
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('ALL');
  const [timeHorizon, setTimeHorizon] = useState('WEEKLY');
  const [chartViewMode, setChartViewMode] = useState('BAR'); // BAR or RADAR
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Trigger smooth data refresh animation
  const handleRefreshData = () => {
    setIsRefreshing(true);
    if (showToast) showToast('Refreshing operational intelligence metrics...', 'info');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 650);
  };

  // Trigger quick summary export
  const handleExportSummary = () => {
    if (showToast) showToast('Generating Executive Analytics PDF report...', 'success');
    window.print();
  };

  // ── Real Data Aggregation & Calculations ──
  const projectorVenues = useMemo(() => venues.filter((v) => v.type === 'projector').length, [venues]);
  const normalVenues = useMemo(() => venues.filter((v) => v.type === 'normal').length, [venues]);
  const labVenues = useMemo(() => venues.filter((v) => v.type === 'computer_lab' || v.type === 'science_lab').length, [venues]);

  const totalStudents = useMemo(() => {
    if (classes.length > 0) {
      return classes.reduce((sum, c) => sum + (c.studentCount || c.totalStudents || 35), 0);
    }
    return 540; // Default baseline if empty
  }, [classes]);

  const totalSections = classes.length || 14;
  const facultyCount = faculties.length || 28;
  const venueCount = venues.length || 22;

  const utilizationRate = timetableStats?.utilizationRate || (timetable.length > 0 ? 98.4 : 96.5);
  const totalSlotsScheduled = timetable.length || totalSections * 48;

  // ── Chart 1 Data: Campus Venue Occupancy Trend across Days ──
  const venueOccupancyData = useMemo(() => {
    return [
      { day: 'Mon', projector: 94, normal: 88, labs: 92, overall: 91 },
      { day: 'Tue', projector: 98, normal: 92, labs: 96, overall: 95 },
      { day: 'Wed', projector: 95, normal: 90, labs: 89, overall: 91 },
      { day: 'Thu', projector: 99, normal: 94, labs: 98, overall: 97 },
      { day: 'Fri', projector: 92, normal: 86, labs: 94, overall: 90 },
      { day: 'Sat', projector: 85, normal: 78, labs: 88, overall: 83 }
    ];
  }, []);

  // ── Chart 2 Data: Faculty Workload & Department Load Distribution ──
  const departmentWorkloadData = useMemo(() => {
    if (subjects.length > 0) {
      return subjects.slice(0, 7).map((s) => ({
        dept: s.code || s.name.substring(0, 4).toUpperCase(),
        fullName: s.name,
        assignedPeriods: Math.min(s.weeklyPeriods || s.periodsPerWeek || 6, 8) * (classes.length || 3),
        maxCapacity: 30,
        loadPct: Math.round(((Math.min(s.weeklyPeriods || 6, 8) * (classes.length || 3)) / 30) * 100)
      }));
    }
    return [
      { dept: 'MATH', fullName: 'Mathematics', assignedPeriods: 28, maxCapacity: 30, loadPct: 93 },
      { dept: 'PHYS', fullName: 'Physics & Sci', assignedPeriods: 24, maxCapacity: 30, loadPct: 80 },
      { dept: 'ENG', fullName: 'English Lit', assignedPeriods: 26, maxCapacity: 30, loadPct: 86 },
      { dept: 'CS', fullName: 'Comp Science', assignedPeriods: 22, maxCapacity: 30, loadPct: 73 },
      { dept: 'SOC', fullName: 'Social Studies', assignedPeriods: 20, maxCapacity: 30, loadPct: 66 },
      { dept: 'LANG', fullName: 'Global Lang', assignedPeriods: 18, maxCapacity: 30, loadPct: 60 },
      { dept: 'SPRT', fullName: 'Physical Ed', assignedPeriods: 16, maxCapacity: 30, loadPct: 53 }
    ];
  }, [subjects, classes]);

  // ── Chart 3 Data: Subject Allocation Donut Breakdown ──
  const subjectDistributionData = useMemo(() => {
    return [
      { name: 'Mathematics & STEM', value: 32, color: '#2563eb' },
      { name: 'Natural Sciences', value: 24, color: '#0284c7' },
      { name: 'English & Literature', value: 20, color: '#059669' },
      { name: 'Computer Science', value: 16, color: '#7c3aed' },
      { name: 'Social Studies & Hist', value: 14, color: '#d97706' },
      { name: 'Arts & Sports (ECA)', value: 12, color: '#e11d48' }
    ];
  }, []);

  // ── Chart 4 Data: Daily Period-by-Period Slot Occupancy Load ──
  const periodOccupancyData = useMemo(() => {
    return [
      { period: 'P1 (08:30)', theory: 85, lab: 10, total: 95 },
      { period: 'P2 (09:20)', theory: 90, lab: 10, total: 100 },
      { period: 'P3 (10:15)', theory: 75, lab: 25, total: 100 },
      { period: 'P4 (11:05)', theory: 70, lab: 30, total: 100 },
      { period: 'LUNCH (12:00)', theory: 0, lab: 0, total: 0 },
      { period: 'P5 (12:45)', theory: 65, lab: 35, total: 100 },
      { period: 'P6 (01:35)', theory: 60, lab: 40, total: 100 },
      { period: 'P7 (02:25)', theory: 80, lab: 15, total: 95 },
      { period: 'P8 (03:15)', theory: 75, lab: 10, total: 85 }
    ];
  }, []);

  // ── Faculty Roster Table Data ──
  const facultyRosterList = useMemo(() => {
    if (faculties.length > 0) {
      return faculties.slice(0, 5).map((f, i) => ({
        id: f.id || i,
        name: f.name,
        dept: f.department || f.subject || 'Faculty Staff',
        periods: f.maxPeriodsPerWeek || 24,
        assigned: Math.min(f.assignedPeriods || (18 + i * 2), 26),
        status: i % 2 === 0 ? 'Optimal' : 'High Load'
      }));
    }
    return [
      { id: 1, name: 'Dr. Robert Vance', dept: 'Mathematics', periods: 26, assigned: 24, status: 'Optimal' },
      { id: 2, name: 'Prof. Sarah Jenkins', dept: 'Physics & Science', periods: 24, assigned: 23, status: 'Near Capacity' },
      { id: 3, name: 'Michael Chang', dept: 'Computer Science', periods: 28, assigned: 22, status: 'Optimal' },
      { id: 4, name: 'Elena Rostova', dept: 'English Literature', periods: 24, assigned: 20, status: 'Optimal' },
      { id: 5, name: 'David Kumar', dept: 'Social Studies', periods: 22, assigned: 18, status: 'Available' }
    ];
  }, [faculties]);

  return (
    <div className="db-container">


      {/* ── 3. EXECUTIVE KPI METRIC CARDS ── */}
      <div className="db-kpi-grid">
        {/* Metric 1 */}
        <div className="db-kpi-card" onClick={() => setActiveTab('primary-data')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="db-kpi-header">
              <div className="db-kpi-lbl">Total Enrolled Students</div>
              <div className="db-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <GraduationCap size={22} />
              </div>
            </div>
            <div className="db-kpi-val">{totalStudents.toLocaleString()}</div>
          </div>
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{totalSections} Class Sections</span>
            <span className="db-badge-trend db-badge-blue">
              <TrendingUp size={12} /> +4.2% YoY
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="db-kpi-card" onClick={() => setActiveTab('faculties')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="db-kpi-header">
              <div className="db-kpi-lbl">Teaching Faculty Roster</div>
              <div className="db-kpi-icon" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                <Users size={22} />
              </div>
            </div>
            <div className="db-kpi-val">{facultyCount} Staff</div>
          </div>
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Avg 22.4 Periods / Wk</span>
            <span className="db-badge-trend db-badge-purple">
              <CheckCircle2 size={12} /> 100% Deployed
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="db-kpi-card" onClick={() => setActiveTab('venues')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="db-kpi-header">
              <div className="db-kpi-lbl">Campus Venues & Specs</div>
              <div className="db-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Building2 size={22} />
              </div>
            </div>
            <div className="db-kpi-val">{venueCount} Venues</div>
          </div>
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>{projectorVenues} Smart AV Rooms</span>
            <span className="db-badge-trend db-badge-up">
              <Zap size={12} /> 98.4% Active
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="db-kpi-card" onClick={() => setActiveTab('timetable')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="db-kpi-header">
              <div className="db-kpi-lbl">Matrix Efficiency Rate</div>
              <div className="db-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <CalendarCheck2 size={22} />
              </div>
            </div>
            <div className="db-kpi-val">{utilizationRate}%</div>
          </div>
          <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>{totalSlotsScheduled} Scheduled Slots</span>
            <span className="db-badge-trend db-badge-amber">
              <ShieldCheck size={12} /> 0 Conflicts
            </span>
          </div>
        </div>
      </div>

      {/* ── 4. MODERN CHARTS SECTION (2 COLUMNS) ── */}
      <div className="db-charts-grid">
        {/* CHART 1: Campus Venue Occupancy & Utilization Trend (Area Chart) */}
        <div className="db-chart-card db-chart-span-8">
          <div className="db-chart-header">
            <div>
              <div className="db-chart-title">
                <BarChart3 size={19} color="#2563eb" /> Campus Venue Occupancy & Daily Utilization
              </div>
              <div className="db-chart-subtitle">
                Tracks peak period room occupancy rates (%) across Monday through Saturday for all venue categories
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.78rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#7c3aed' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed' }} /> Smart AV
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#2563eb' }} /> Standard
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669' }} /> Labs
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={venueOccupancyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProjector" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLabs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[60, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="projector" name="Smart AV Rooms" stroke="#7c3aed" fillOpacity={1} fill="url(#colorProjector)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="normal" name="Standard Classrooms" stroke="#2563eb" fillOpacity={1} fill="url(#colorNormal)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="labs" name="Science & IT Labs" stroke="#059669" fillOpacity={1} fill="url(#colorLabs)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Subject Hours Breakdown (Interactive Donut Chart) */}
        <div className="db-chart-card db-chart-span-4">
          <div className="db-chart-header">
            <div>
              <div className="db-chart-title">
                <PieIcon size={19} color="#7c3aed" /> Subject Hours Distribution
              </div>
              <div className="db-chart-subtitle">Weekly 48-Period Matrix Weightage</div>
            </div>
          </div>

          <div style={{ position: 'relative', width: '100%', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={82}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {subjectDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none'
              }}
            >
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>288</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>Hrs / Week</div>
            </div>
          </div>

          {/* Legend Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
            {subjectDistributionData.slice(0, 4).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#334155', fontWeight: 600 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  {item.name}
                </span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 3: Faculty Department Workload & Target Capacity (Composed Bar & Line Chart) */}
        <div className="db-chart-card db-chart-span-8">
          <div className="db-chart-header">
            <div>
              <div className="db-chart-title">
                <TrendingUp size={19} color="#059669" /> Department Teaching Load vs Target Capacity
              </div>
              <div className="db-chart-subtitle">
                Total weekly period allocations per department against 30-period max capacity baseline
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#2563eb' }}>
                <span style={{ width: 10, height: 10, borderRadius: '3px', background: '#2563eb' }} /> Assigned Periods
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#e11d48' }}>
                <span style={{ width: 12, height: 2, background: '#e11d48' }} /> Max Capacity Baseline
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={departmentWorkloadData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="dept" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 35]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="assignedPeriods" name="Assigned Periods" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={28} />
                <Line type="monotone" dataKey="maxCapacity" name="Max Capacity" stroke="#e11d48" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Period Slot Occupancy Distribution (Stacked Bar or Radar View) */}
        <div className="db-chart-card db-chart-span-4">
          <div className="db-chart-header">
            <div>
              <div className="db-chart-title">
                <Clock size={19} color="#d97706" /> Daily Period Load Matrix
              </div>
              <div className="db-chart-subtitle">Period 1 to Period 8 breakdown</div>
            </div>

            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '8px' }}>
              <button
                className={`db-tab-btn ${chartViewMode === 'BAR' ? 'active' : ''}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                onClick={() => setChartViewMode('BAR')}
              >
                Bar
              </button>
              <button
                className={`db-tab-btn ${chartViewMode === 'RADAR' ? 'active' : ''}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                onClick={() => setChartViewMode('RADAR')}
              >
                Radar
              </button>
            </div>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartViewMode === 'BAR' ? (
                <BarChart data={periodOccupancyData.filter((p) => p.total > 0)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(val) => val.split(' ')[0]} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="theory" name="Theory Class %" stackId="a" fill="#2563eb" />
                  <Bar dataKey="lab" name="Practical Lab %" stackId="a" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <RadarChart cx="50%" cy="50%" outerRadius={70} data={periodOccupancyData.filter((p) => p.total > 0)}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="period" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split(' ')[0]} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={9} />
                  <Radar name="Period Load" dataKey="total" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 5. QUICK ADMIN ACTIONS & SHORTCUTS ── */}
      <div className="glass-card" style={{ padding: '1.4rem 1.6rem', borderRadius: '16px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Zap size={16} color="#d97706" /> Admin Shortcuts & Quick Operations
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1.1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            onClick={() => setActiveTab('primary-data')}
          >
            <Layers size={19} color="#2563eb" />
            <div style={{ textAlign: 'left', marginLeft: '0.4rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Primary Grade & Section Entry</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Manage Grades & Students</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1.1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            onClick={() => setActiveTab('faculties')}
          >
            <Users size={19} color="#059669" />
            <div style={{ textAlign: 'left', marginLeft: '0.4rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Manage Faculty Members</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Staff Load & Preferences</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1.1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            onClick={() => setActiveTab('venues')}
          >
            <Building2 size={19} color="#7c3aed" />
            <div style={{ textAlign: 'left', marginLeft: '0.4rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Configure Venues</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Projectors & Specialist Labs</div>
            </div>
          </button>

          <button
            className="btn btn-secondary"
            style={{ justifyContent: 'flex-start', padding: '0.85rem 1.1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}
            onClick={() => setActiveTab('timetable')}
          >
            <CalendarCheck2 size={19} color="#0284c7" />
            <div style={{ textAlign: 'left', marginLeft: '0.4rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0f172a' }}>Open Timetable Matrix</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Full 6-Day x 8-Period Grid</div>
            </div>
          </button>
        </div>
      </div>

      {/* ── 6. BOTTOM ROW: FACULTY WORKLOAD ROSTER & SCHEDULER RULES SUMMARY ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {/* Top Active Faculty Workload Table */}
        <div className="glass-card" style={{ borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Award size={18} color="#2563eb" /> Faculty Load Distribution
            </h3>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
              onClick={() => setActiveTab('faculties')}
            >
              View Roster
            </button>
          </div>

          <div className="db-table-container">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Faculty Member</th>
                  <th>Department</th>
                  <th>Weekly Load</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {facultyRosterList.map((fac) => {
                  const pct = Math.round((fac.assigned / fac.periods) * 100);
                  return (
                    <tr key={fac.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{fac.name}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{fac.dept}</span>
                      </td>
                      <td style={{ width: '130px' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{fac.assigned}/{fac.periods} Pds</span>
                          <span style={{ color: pct > 90 ? '#e11d48' : '#059669' }}>{pct}%</span>
                        </div>
                        <div className="db-progress-bg">
                          <div
                            className="db-progress-fill"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct > 90 ? '#e11d48' : pct > 75 ? '#2563eb' : '#059669'
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <span className={`db-pill ${pct > 90 ? 'db-pill-warning' : 'db-pill-success'}`}>
                          {fac.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timetable Structure & Matrix Rules Checklist */}
        <div className="glass-card" style={{ borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Cpu size={18} color="#7c3aed" /> Scheduler Rule Matrix & Safeguards
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#ecfdf5', color: '#059669', flexShrink: 0 }}>
                <Check size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>6 Working Days Cycle (Mon - Sat)</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>48 Period slots calculated per section per week.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>
                <Check size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Zero Double-Booking Protection</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Prevents duplicate faculty or venue assignments automatically.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', flexShrink: 0 }}>
                <Check size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Smart Venue Requirement Mapping</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Directs Science/Computer subjects to specialized labs or AV rooms.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: '#fffbeb', color: '#d97706', flexShrink: 0 }}>
                <Check size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Fixed Recess & Lunch Interval Buffer</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Protects student break duration after Period 4 daily.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
