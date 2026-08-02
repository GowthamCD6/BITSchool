import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  DAYS,
  PERIODS,
  VENUE_TYPES
} from '../utils/constants';
import { generateAutoTimetable } from '../utils/timetableGenerator';

const SchoolContext = createContext();

// ── Helper: get Monday of the week for a given date ──



function getMondayOfWeek(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // if Sunday, go back 6 days
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toWeekKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function SchoolProvider({ children }) {
  // ── Authentication State ──
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const saved = localStorage.getItem('bitschool_authenticated');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('bitschool_user');
    return saved ? JSON.parse(saved) : {
      name: 'Gowtham',
      email: 'gowthamnaveen124@gmail.com',
      role: 'Principal Administrator',
      avatarColor: '#2563eb'
    };
  });

  const [activeTab, setActiveTabState] = useState(() => {
    const savedTab = localStorage.getItem('bitschool_active_tab');
    return savedTab || 'dashboard';
  });

  const setActiveTab = (tab) => {
    localStorage.setItem('bitschool_active_tab', tab);
    setActiveTabState(tab);
  };

  // Live Database Entity States (Initialized empty or from database cache)
  const [faculties, setFaculties] = useState(() => {
    const saved = localStorage.getItem('bitschool_faculties');
    return saved ? JSON.parse(saved) : [];
  });

  const [venues, setVenues] = useState(() => {
    const saved = localStorage.getItem('bitschool_venues');
    return saved ? JSON.parse(saved) : [];
  });

  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('bitschool_classes');
    return saved ? JSON.parse(saved) : [];
  });

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('bitschool_subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const [grades, setGrades] = useState(() => {
    const saved = localStorage.getItem('bitschool_grades');
    return saved ? JSON.parse(saved) : [];
  });

  // ── ECA (Extra Curricular Activities / Non Academics) State ──
  const [ecaVerticals, setEcaVerticals] = useState(() => {
    const saved = localStorage.getItem('bitschool_eca_verticals');
    return saved ? JSON.parse(saved) : [];
  });

  const [ecaSchedule, setEcaSchedule] = useState(() => {
    const saved = localStorage.getItem('bitschool_eca_schedule');
    return saved ? JSON.parse(saved) : {};
  });

  // ECA vertical details with grade mappings
  const [ecaVerticalDetails, setEcaVerticalDetails] = useState([]);

  // ── Bell Schedule Time Slots State ──
  const [timeSlots, setTimeSlots] = useState(() => {
    const saved = localStorage.getItem('bitschool_time_slots');
    return saved ? JSON.parse(saved) : PERIODS;
  });

  // ── Master Bell Schedule Timing Parameters ──
  const [bellConfig, setBellConfig] = useState({
    schoolStartTime: '08:30 AM',
    morningBreakStart: '10:00 AM',
    morningBreakEnd: '10:15 AM',
    lunchBreakStart: '11:45 AM',
    lunchBreakEnd: '12:30 PM',
    afternoonBreakStart: '02:00 PM',
    afternoonBreakEnd: '02:15 PM',
    schoolEndTime: '03:45 PM'
  });

  // ── Active Week Key (Monday date string e.g. '2026-07-27') ──
  const [activeWeekKey, setActiveWeekKey] = useState(() => {
    const saved = localStorage.getItem('bitschool_active_week');
    if (saved) return saved;
    return toWeekKey(getMondayOfWeek(new Date()));
  });

  // ── Week-keyed timetable store: { '2026-07-27': [...slots], ... } ──
  const [weeklyTimetables, setWeeklyTimetables] = useState(() => {
    const saved = localStorage.getItem('bitschool_weekly_timetables');
    if (saved) return JSON.parse(saved);

    // Migrate from old single timetable if it exists
    const oldTT = localStorage.getItem('bitschool_timetable');
    if (oldTT) {
      const currentWeek = toWeekKey(getMondayOfWeek(new Date()));
      return { [currentWeek]: JSON.parse(oldTT) };
    }

    return {};
  });

  // ── Derived: current week's timetable ──
  const timetable = useMemo(() => {
    return weeklyTimetables[activeWeekKey] || [];
  }, [weeklyTimetables, activeWeekKey]);

  const [timetableStats, setTimetableStats] = useState({
    totalSlots: timetable.length,
    allocatedSlots: timetable.length,
    conflictCount: 0,
    utilizationRate: timetable.length > 0 ? 100 : 0
  });

  const [toast, setToast] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Fetch ALL data from MySQL Backend API on mount (Classes, Subjects, Venues, Faculties, Grades, ECA, Timetable)
  useEffect(() => {
    const fetchDatabaseData = async () => {
      try {
        const [classesRes, subjectsRes, venuesRes, facultiesRes, gradesRes, ecaRes, timeSlotsRes, bellConfigRes, timetablesRes] = await Promise.all([
          fetch('http://localhost:5000/api/classes'),
          fetch('http://localhost:5000/api/courses'),
          fetch('http://localhost:5000/api/venues'),
          fetch('http://localhost:5000/api/faculties'),
          fetch('http://localhost:5000/api/grades'),
          fetch('http://localhost:5000/api/eca'),
          fetch('http://localhost:5000/api/time-slots'),
          fetch('http://localhost:5000/api/time-slots/bell-config'),
          fetch('http://localhost:5000/api/timetables')
        ]);

        let loadedClasses = [];
        let loadedSubjects = [];
        let loadedVenues = [];
        let loadedFaculties = [];
        let loadedEcaSchedule = {};
        let loadedBellConfig = bellConfig;
        let hasLoadedSavedTimetable = false;

        if (classesRes.ok) {
          const data = await classesRes.json();
          loadedClasses = Array.isArray(data) ? data : (data.data || []);
          setClasses(loadedClasses);
        }

        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          loadedSubjects = Array.isArray(data) ? data : (data.data || []);
          setSubjects(loadedSubjects);
        }

        if (venuesRes.ok) {
          const data = await venuesRes.json();
          loadedVenues = Array.isArray(data) ? data : (data.data || []);
          setVenues(loadedVenues);
        }

        if (facultiesRes.ok) {
          const data = await facultiesRes.json();
          loadedFaculties = Array.isArray(data) ? data : (data.data || []);
          setFaculties(loadedFaculties);
        }

        if (gradesRes && gradesRes.ok) {
          const data = await gradesRes.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          setGrades(items);
        }

        if (ecaRes && ecaRes.ok) {
          const ecaData = await ecaRes.json();
          const ecaPayload = ecaData.data || ecaData;
          if (ecaPayload.verticals && Array.isArray(ecaPayload.verticals)) {
            setEcaVerticals(ecaPayload.verticals);
          }
          if (ecaPayload.verticalDetails && Array.isArray(ecaPayload.verticalDetails)) {
            setEcaVerticalDetails(ecaPayload.verticalDetails);
          }
          if (ecaPayload.schedule && typeof ecaPayload.schedule === 'object') {
            loadedEcaSchedule = ecaPayload.schedule;
            setEcaSchedule(loadedEcaSchedule);
          }
        }

        if (timeSlotsRes && timeSlotsRes.ok) {
          const data = await timeSlotsRes.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          if (items.length > 0) {
            setTimeSlots(items.sort((a, b) => a.slotNo - b.slotNo));
          }
        }

        if (bellConfigRes && bellConfigRes.ok) {
          const data = await bellConfigRes.json();
          if (data.data) {
            loadedBellConfig = data.data;
            setBellConfig(loadedBellConfig);
          }
        }

        if (timetablesRes && timetablesRes.ok) {
          const ttData = await timetablesRes.json();
          const savedSlots = Array.isArray(ttData) ? ttData : (ttData.data || []);
          if (savedSlots.length > 0) {
            const currentWeek = toWeekKey(getMondayOfWeek(new Date()));
            setWeeklyTimetables(prev => ({
              ...prev,
              [currentWeek]: savedSlots
            }));
            setTimetableStats({
              totalSlots: savedSlots.length,
              allocatedSlots: savedSlots.length,
              conflictCount: savedSlots.filter(s => s.isConflict).length,
              utilizationRate: Math.max(0, Math.round(((savedSlots.length - savedSlots.filter(s => s.isConflict).length) / savedSlots.length) * 100))
            });
          }
        }
      } catch (err) {
        console.warn('Backend API connection notice (using database cache):', err.message);
      }
    };

    fetchDatabaseData();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('bitschool_faculties', JSON.stringify(faculties));
  }, [faculties]);

  useEffect(() => {
    localStorage.setItem('bitschool_venues', JSON.stringify(venues));
  }, [venues]);

  useEffect(() => {
    localStorage.setItem('bitschool_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('bitschool_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('bitschool_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('bitschool_time_slots', JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
    localStorage.setItem('bitschool_weekly_timetables', JSON.stringify(weeklyTimetables));
  }, [weeklyTimetables]);

  useEffect(() => {
    localStorage.setItem('bitschool_authenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('bitschool_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // ── Auth Handlers ──
  const login = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    showToast(`Welcome back, ${userData.name}! Logged in as ${userData.role}.`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('bitschool_active_tab');
    setActiveTabState('dashboard');
    showToast('Signed out successfully.', 'warning');
  };

  useEffect(() => {
    localStorage.setItem('bitschool_eca_verticals', JSON.stringify(ecaVerticals));
  }, [ecaVerticals]);

  useEffect(() => {
    localStorage.setItem('bitschool_eca_schedule', JSON.stringify(ecaSchedule));
  }, [ecaSchedule]);

  // ── ECA Handlers (persisted to MySQL via API) ──
  const updateEcaCell = async (day, vertical, newCellData, grade = '4') => {
    const key = `${grade}_${day}`;
    const nextEcaSchedule = {
      ...ecaSchedule,
      [key]: {
        ...ecaSchedule[key],
        [vertical]: newCellData
      }
    };
    setEcaSchedule(nextEcaSchedule);
    try {
      await fetch('http://localhost:5000/api/eca/cell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day, vertical, grade, ...newCellData })
      });
    } catch (err) {
      console.warn('Failed to persist ECA cell to backend:', err.message);
    }
    const result = generateAutoTimetable({
      faculties,
      venues,
      classes,
      subjects,
      ecaSchedule: nextEcaSchedule,
      bellConfig,
      targetClassId: 'all',
      targetGrade: 'all',
      existingTimetable: []
    });
    setWeeklyTimetables(prev => ({
      ...prev,
      [activeWeekKey]: result.timetable
    }));
    setTimetableStats(result.stats);
    showToast(`Updated Grade ${grade} ECA activity for ${vertical} on ${day}.`);
  };

  const addEcaVertical = async (verticalName, gradeIds = []) => {
    if (ecaVerticals.includes(verticalName)) {
      showToast(`Vertical "${verticalName}" already exists.`, 'warning');
      return;
    }
    setEcaVerticals(prev => [...prev, verticalName]);
    setEcaSchedule(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(d => {
        next[d] = { ...next[d], [verticalName]: { active: false, label: 'No' } };
      });
      return next;
    });
    try {
      const res = await fetch('http://localhost:5000/api/eca/vertical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: verticalName, gradeIds })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setEcaVerticalDetails(prev => [...prev, data.data]);
        }
      }
    } catch (err) {
      console.warn('Failed to persist ECA vertical to backend:', err.message);
    }
    showToast(`Added new ECA Vertical: "${verticalName}".`);
  };

  const deleteEcaVertical = async (verticalName) => {
    setEcaVerticals(prev => prev.filter(v => v !== verticalName));
    setEcaSchedule(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(d => {
        const dayCopy = { ...next[d] };
        delete dayCopy[verticalName];
        next[d] = dayCopy;
      });
      return next;
    });
    try {
      await fetch(`http://localhost:5000/api/eca/vertical/${encodeURIComponent(verticalName)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Failed to delete ECA vertical from backend:', err.message);
    }
    showToast(`Removed ECA Vertical "${verticalName}".`, 'warning');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Auto Generate Master Timetable & Persist to MySQL DB
  const handleAutoGenerateTimetable = async (options = {}) => {
    const existingWeekSlots = weeklyTimetables[activeWeekKey] || [];
    const result = generateAutoTimetable({
      faculties,
      venues,
      classes,
      subjects,
      ecaSchedule,
      bellConfig,
      targetClassId: options.targetClassId || 'all',
      targetGrade: options.targetGrade || 'all',
      existingTimetable: existingWeekSlots
    });

    setWeeklyTimetables(prev => ({
      ...prev,
      [activeWeekKey]: result.timetable
    }));
    setTimetableStats(result.stats);

    // Persist all generated slots to MySQL backend database
    try {
      await fetch('http://localhost:5000/api/timetables/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: result.timetable })
      });
    } catch (err) {
      console.warn('MySQL Timetable Save Warning:', err.message);
    }

    showToast(`Master Timetable Auto-Scheduled & Saved to MySQL! ${result.stats.allocatedSlots} slots allocated (${result.stats.utilizationRate}% Efficiency).`, 'success');
  };

  // ── Delete a week's timetable & clear from MySQL ──
  const deleteWeekTimetable = async (weekKey) => {
    setWeeklyTimetables(prev => {
      const copy = { ...prev };
      delete copy[weekKey];
      return copy;
    });

    try {
      await fetch(`http://localhost:5000/api/timetables/all`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to delete timetable slots from MySQL DB:', err.message);
    }

    showToast(`Timetable cleared from MySQL database.`, 'warning');
  };

  // ── Get all generated week keys sorted descending ──
  const generatedWeekKeys = useMemo(() => {
    return Object.keys(weeklyTimetables)
      .filter(k => weeklyTimetables[k] && weeklyTimetables[k].length > 0)
      .sort((a, b) => b.localeCompare(a));
  }, [weeklyTimetables]);

  // Faculty CRUD (MySQL API)
  const addFaculty = async (newFaculty) => {
    try {
      const res = await fetch('http://localhost:5000/api/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFaculty)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFaculties(prev => [...prev, data.data]);
        showToast(`Faculty member "${data.data.name}" added successfully.`);
      }
    } catch (err) {
      showToast('Failed to add faculty member to database.', 'danger');
    }
  };

  const updateFaculty = async (updatedFaculty) => {
    try {
      const res = await fetch(`http://localhost:5000/api/faculties/${updatedFaculty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFaculty)
      });
      const data = await res.json();
      if (data.success) {
        setFaculties(prev => prev.map(f => f.id === updatedFaculty.id ? updatedFaculty : f));
        showToast(`Faculty profile updated for ${updatedFaculty.name}.`);
      }
    } catch (err) {
      showToast('Failed to update faculty member.', 'danger');
    }
  };

  const deleteFaculty = async (facultyId) => {
    try {
      const f = faculties.find(fac => fac.id === facultyId);
      await fetch(`http://localhost:5000/api/faculties/${facultyId}`, { method: 'DELETE' });
      setFaculties(prev => prev.filter(fac => fac.id !== facultyId));
      showToast(`Faculty ${f?.name || ''} removed.`, 'warning');
    } catch (err) {
      showToast('Failed to delete faculty member.', 'danger');
    }
  };

  // Venue CRUD (MySQL API)
  const addVenue = async (newVenue) => {
    try {
      const res = await fetch('http://localhost:5000/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVenue)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setVenues(prev => [...prev, data.data]);
        showToast(`Venue "${data.data.roomNo} - ${data.data.name}" added.`);
      }
    } catch (err) {
      showToast('Failed to add venue.', 'danger');
    }
  };

  const updateVenue = async (updatedVenue) => {
    try {
      const res = await fetch(`http://localhost:5000/api/venues/${updatedVenue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVenue)
      });
      const data = await res.json();
      if (data.success) {
        setVenues(prev => prev.map(v => v.id === updatedVenue.id ? updatedVenue : v));
        showToast(`Venue details updated for ${updatedVenue.roomNo}.`);
      }
    } catch (err) {
      showToast('Failed to update venue.', 'danger');
    }
  };

  const deleteVenue = async (venueId) => {
    try {
      const v = venues.find(ven => ven.id === venueId);
      await fetch(`http://localhost:5000/api/venues/${venueId}`, { method: 'DELETE' });
      setVenues(prev => prev.filter(ven => ven.id !== venueId));
      showToast(`Venue ${v?.roomNo || ''} removed.`, 'warning');
    } catch (err) {
      showToast('Failed to delete venue.', 'danger');
    }
  };

  // Class CRUD (MySQL API)
  const addClass = async (newClass) => {
    try {
      const res = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setClasses(prev => [...prev, data.data]);
        showToast(`Class "${data.data.name}" created.`);
      }
    } catch (err) {
      showToast('Failed to create class in database.', 'danger');
    }
  };

  const updateClass = async (updatedClass) => {
    try {
      const res = await fetch(`http://localhost:5000/api/classes/${updatedClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClass)
      });
      const data = await res.json();
      if (data.success) {
        setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
        showToast(`Class "${updatedClass.name}" updated.`);
      }
    } catch (err) {
      showToast('Failed to update class.', 'danger');
    }
  };

  const deleteClass = async (classId) => {
    try {
      const c = classes.find(item => item.id === classId);
      await fetch(`http://localhost:5000/api/classes/${classId}`, { method: 'DELETE' });
      setClasses(prev => prev.filter(item => item.id !== classId));
      showToast(`Class "${c?.name || ''}" removed.`, 'warning');
    } catch (err) {
      showToast('Failed to delete class from database.', 'danger');
    }
  };

  // Subject CRUD (MySQL API)
  const addSubject = async (newSubj) => {
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubj)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSubjects(prev => [...prev, data.data]);
        showToast(`Subject "${data.data.name}" (${data.data.code}) added.`);
      }
    } catch (err) {
      showToast('Failed to create subject in database.', 'danger');
    }
  };

  const updateSubject = async (updatedSubj) => {
    try {
      const res = await fetch(`http://localhost:5000/api/courses/${updatedSubj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSubj)
      });
      const data = await res.json();
      if (data.success) {
        setSubjects(prev => prev.map(s => s.id === updatedSubj.id ? updatedSubj : s));
        showToast(`Subject "${updatedSubj.name}" updated.`);
      }
    } catch (err) {
      showToast('Failed to update subject.', 'danger');
    }
  };

  const deleteSubject = async (subjectId) => {
    try {
      const s = subjects.find(subj => subj.id === subjectId);
      await fetch(`http://localhost:5000/api/courses/${subjectId}`, { method: 'DELETE' });
      setSubjects(prev => prev.filter(subj => subj.id !== subjectId));
      showToast(`Subject "${s?.name || ''}" removed.`, 'warning');
    } catch (err) {
      showToast('Failed to delete subject from database.', 'danger');
    }
  };

  // Grade Level CRUD Operations (MySQL Persistence)
  const addGrade = async (gradeData) => {
    try {
      const res = await fetch('http://localhost:5000/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
      if (res.ok) {
        const newGrade = await res.json();
        setGrades((prev) => [...prev.filter((g) => String(g.id) !== String(newGrade.id)), newGrade]);
        showToast(`Grade level "${newGrade.name}" saved to MySQL database.`);
        return newGrade;
      }
    } catch (err) {
      showToast('Failed to save grade level to database.', 'danger');
    }
  };

  const updateGrade = async (id, gradeData) => {
    try {
      const res = await fetch(`http://localhost:5000/api/grades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
      if (res.ok) {
        const updated = await res.json();
        setGrades((prev) => prev.map((g) => (String(g.id) === String(id) ? updated : g)));
        showToast(`Grade level updated in database.`);
      }
    } catch (err) {
      showToast('Failed to update grade in database.', 'danger');
    }
  };

  const deleteGrade = async (id) => {
    try {
      const target = grades.find((g) => String(g.id) === String(id));
      await fetch(`http://localhost:5000/api/grades/${id}`, { method: 'DELETE' });
      setGrades((prev) => prev.filter((g) => String(g.id) !== String(id)));
      showToast(`Grade level "${target?.name || ''}" removed from database.`, 'warning');
    } catch (err) {
      showToast('Failed to delete grade from database.', 'danger');
    }
  };

  // ── Time Slot CRUD (MySQL API) ──
  const addTimeSlot = async (newSlot) => {
    try {
      const res = await fetch('http://localhost:5000/api/time-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTimeSlots(prev => [...prev, data.data].sort((a, b) => a.slotNo - b.slotNo));
        showToast(`Time slot "${data.data.name}" added successfully.`);
      }
    } catch (err) {
      showToast('Failed to save time slot to database.', 'danger');
    }
  };

  const updateTimeSlot = async (updatedSlot) => {
    try {
      const res = await fetch(`http://localhost:5000/api/time-slots/${updatedSlot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSlot)
      });
      const data = await res.json();
      if (data.success) {
        setTimeSlots(prev => prev.map(s => String(s.id) === String(updatedSlot.id) ? { ...s, ...updatedSlot } : s).sort((a, b) => a.slotNo - b.slotNo));
        showToast(`Time slot "${updatedSlot.name}" updated.`);
      }
    } catch (err) {
      showToast('Failed to update time slot.', 'danger');
    }
  };

  const deleteTimeSlot = async (slotId) => {
    try {
      const target = timeSlots.find(s => String(s.id) === String(slotId));
      await fetch(`http://localhost:5000/api/time-slots/${slotId}`, { method: 'DELETE' });
      setTimeSlots(prev => prev.filter(s => String(s.id) !== String(slotId)));
      showToast(`Time slot "${target?.name || ''}" deleted.`, 'warning');
    } catch (err) {
      showToast('Failed to delete time slot.', 'danger');
    }
  };

  const saveBellConfig = async (newConfig) => {
    try {
      const res = await fetch('http://localhost:5000/api/time-slots/bell-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBellConfig(data.data);
        if (data.timeSlots && Array.isArray(data.timeSlots)) {
          setTimeSlots(data.timeSlots);
        }
        showToast('School Bell Schedule parameters saved & time slots generated.');
      }
    } catch (err) {
      showToast('Failed to save bell schedule parameters.', 'danger');
    }
  };

  // Update a single Timetable cell slot (within active week) & persist to MySQL DB
  const updateTimetableSlot = async (slotId, newDetails) => {
    let updatedSlotObj = null;

    setWeeklyTimetables(prev => {
      const weekSlots = prev[activeWeekKey] || [];
      const updatedSlots = weekSlots.map(slot => {
        if (slot.id === slotId) {
          const subj = subjects.find(s => s.id === newDetails.subjectId);
          const fac = faculties.find(f => f.id === newDetails.facultyId);
          const ven = venues.find(v => v.id === newDetails.venueId);

          updatedSlotObj = {
            ...slot,
            subjectId: subj ? subj.id : slot.subjectId,
            subjectName: subj ? subj.name : slot.subjectName,
            subjectCode: subj ? subj.code : slot.subjectCode,
            subjectColor: subj ? subj.color : slot.subjectColor,
            facultyId: fac ? fac.id : slot.facultyId,
            facultyName: fac ? fac.name : slot.facultyName,
            venueId: ven ? ven.id : slot.venueId,
            venueName: ven ? ven.name : slot.venueName,
            venueRoomNo: ven ? ven.roomNo : slot.venueRoomNo,
            venueType: ven ? ven.type : slot.venueType
          };
          return updatedSlotObj;
        }
        return slot;
      });
      return { ...prev, [activeWeekKey]: updatedSlots };
    });

    if (updatedSlotObj) {
      try {
        await fetch(`http://localhost:5000/api/timetables/slot/${encodeURIComponent(slotId)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSlotObj)
        });
      } catch (err) {
        console.warn('Failed to update slot in MySQL DB:', err.message);
      }
    }

    showToast('Timetable period slot updated and saved to MySQL database.');
  };

  const handleSetTab = (tabId) => {
    if (tabId === activeTab) return;
    setIsPageLoading(true);
    setActiveTab(tabId);
    setTimeout(() => {
      setIsPageLoading(false);
    }, 400); // 400ms simulate page loading
  };

  return (
    <SchoolContext.Provider
      value={{
        // Auth
        isAuthenticated,
        currentUser,
        login,
        logout,
        activeTab,
        setActiveTab: handleSetTab,
        isPageLoading,
        faculties,
        venues,
        classes,
        subjects,
        grades,
        timetable,
        timetableStats,
        days: DAYS,
        periods: PERIODS,
        venueTypes: VENUE_TYPES,
        toast,
        showToast,
        handleAutoGenerateTimetable,
        // Week navigation
        activeWeekKey,
        setActiveWeekKey,
        weeklyTimetables,
        generatedWeekKeys,
        deleteWeekTimetable,
        getMondayOfWeek,
        toWeekKey,
        // ECA (Non Academics)
        ecaVerticals,
        ecaVerticalDetails,
        ecaSchedule,
        updateEcaCell,
        addEcaVertical,
        deleteEcaVertical,
        // Time Slots (Bell Schedule)
        timeSlots,
        addTimeSlot,
        updateTimeSlot,
        deleteTimeSlot,
        bellConfig,
        saveBellConfig,
        // CRUD
        addFaculty,
        updateFaculty,
        deleteFaculty,
        addVenue,
        updateVenue,
        deleteVenue,
        addClass,
        updateClass,
        deleteClass,
        addSubject,
        updateSubject,
        deleteSubject,
        addGrade,
        updateGrade,
        deleteGrade,
        updateTimetableSlot
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  return useContext(SchoolContext);
}