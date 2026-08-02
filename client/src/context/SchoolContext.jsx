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

  // Safe helper to fetch JSON endpoints without throwing on blocked/offline endpoints
  const safeFetchJSON = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn(`Endpoint ${url} unavailable or blocked by network tab:`, err.message);
      return null;
    }
  };

  // Fetch ALL data from Backend API safely on mount
  useEffect(() => {
    const fetchDatabaseData = async () => {
      const [
        classesData,
        subjectsData,
        venuesData,
        facultiesData,
        gradesData,
        ecaData,
        timeSlotsData,
        bellConfigData,
        timetablesData
      ] = await Promise.all([
        safeFetchJSON('http://localhost:5000/api/classes'),
        safeFetchJSON('http://localhost:5000/api/courses'),
        safeFetchJSON('http://localhost:5000/api/venues'),
        safeFetchJSON('http://localhost:5000/api/faculties'),
        safeFetchJSON('http://localhost:5000/api/grades'),
        safeFetchJSON('http://localhost:5000/api/eca'),
        safeFetchJSON('http://localhost:5000/api/time-slots'),
        safeFetchJSON('http://localhost:5000/api/time-slots/bell-config'),
        safeFetchJSON('http://localhost:5000/api/timetables')
      ]);

      if (classesData) {
        const loaded = Array.isArray(classesData) ? classesData : (classesData.data || []);
        if (loaded.length > 0) setClasses(loaded);
      }
      if (subjectsData) {
        const loaded = Array.isArray(subjectsData) ? subjectsData : (subjectsData.data || []);
        if (loaded.length > 0) setSubjects(loaded);
      }
      if (venuesData) {
        const loaded = Array.isArray(venuesData) ? venuesData : (venuesData.data || []);
        if (loaded.length > 0) setVenues(loaded);
      }
      if (facultiesData) {
        const loaded = Array.isArray(facultiesData) ? facultiesData : (facultiesData.data || []);
        if (loaded.length > 0) setFaculties(loaded);
      }
      if (gradesData) {
        const loaded = Array.isArray(gradesData) ? gradesData : (gradesData.data || []);
        if (loaded.length > 0) setGrades(loaded);
      }
      if (ecaData) {
        const ecaPayload = ecaData.data || ecaData;
        if (ecaPayload.verticals && Array.isArray(ecaPayload.verticals)) setEcaVerticals(ecaPayload.verticals);
        if (ecaPayload.verticalDetails && Array.isArray(ecaPayload.verticalDetails)) setEcaVerticalDetails(ecaPayload.verticalDetails);
        if (ecaPayload.schedule && typeof ecaPayload.schedule === 'object') setEcaSchedule(ecaPayload.schedule);
      }
      if (timeSlotsData) {
        const loaded = Array.isArray(timeSlotsData) ? timeSlotsData : (timeSlotsData.data || []);
        if (loaded.length > 0) setTimeSlots(loaded.sort((a, b) => a.slotNo - b.slotNo));
      }
      if (bellConfigData && bellConfigData.data) {
        setBellConfig(bellConfigData.data);
      }
      if (timetablesData) {
        const savedSlots = Array.isArray(timetablesData) ? timetablesData : (timetablesData.data || []);
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
    const cleanVertical = verticalName.trim();
    const isAlreadyPresent = ecaVerticals.some(v => v.toLowerCase() === cleanVertical.toLowerCase());

    const newGradeObjects = (gradeIds || []).map(gId => {
      const cleanG = String(gId).replace('Grade ', '');
      return { id: cleanG, name: `Grade ${cleanG}` };
    });

    if (isAlreadyPresent) {
      // Vertical exists — update its grade level associations
      setEcaVerticalDetails(prev => {
        const found = prev.some(v => v.name.toLowerCase() === cleanVertical.toLowerCase());
        if (found) {
          return prev.map(v => {
            if (v.name.toLowerCase() === cleanVertical.toLowerCase()) {
              const currentGrades = [...(v.grades || [])];
              newGradeObjects.forEach(newG => {
                if (!currentGrades.some(g => String(g.id || g.name).replace('Grade ', '') === newG.id)) {
                  currentGrades.push(newG);
                }
              });
              return { ...v, grades: currentGrades };
            }
            return v;
          });
        }
        return [...prev, { id: `vert_${Date.now()}`, name: cleanVertical, grades: newGradeObjects }];
      });

      try {
        const res = await fetch('http://localhost:5000/api/eca/vertical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: cleanVertical, gradeIds })
        });
        if (!res.ok) {
          console.warn(`ECA vertical sync notice (${res.status}): Updated in local cache.`);
        }
      } catch (err) {
        console.warn('Failed to persist ECA vertical to backend:', err.message);
      }

      showToast(`Updated ECA Vertical "${cleanVertical}" for the selected grade level(s).`);
      return;
    }

    // New vertical creation
    setEcaVerticals(prev => [...prev, cleanVertical]);
    setEcaVerticalDetails(prev => [
      ...prev,
      { id: `vert_${Date.now()}`, name: cleanVertical, grades: newGradeObjects }
    ]);
    setEcaSchedule(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(d => {
        next[d] = { ...next[d], [cleanVertical]: { active: false, label: 'No' } };
      });
      return next;
    });

    try {
      const res = await fetch('http://localhost:5000/api/eca/vertical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanVertical, gradeIds })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data) {
          setEcaVerticalDetails(prev => prev.map(v => v.name.toLowerCase() === cleanVertical.toLowerCase() ? data.data : v));
        }
      }
    } catch (err) {
      console.warn('Failed to persist ECA vertical to backend:', err.message);
    }
    showToast(`Added ECA Vertical: "${cleanVertical}".`);
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
    const rawTargetGrade = options.targetGrade || 'all';
    const targetGrade = typeof rawTargetGrade === 'object'
      ? String(rawTargetGrade.name || rawTargetGrade.id || 'all').replace('Grade ', '').trim()
      : String(rawTargetGrade).replace('Grade ', '').trim();
    const targetClassId = String(options.targetClassId || 'all');

    // ⛔ CONSTRAINT CHECK 1: Ensure master course subjects exist in the system
    if (!subjects || subjects.length === 0) {
      showToast('Cannot generate timetable: No Master Course subjects configured in the system. Please add courses in Primary Data Entry first.', 'danger');
      return;
    }

    // Helper: Safely extract numeric/string grade value from string, number, or object
    const getCleanGradeStr = (gVal) => {
      if (!gVal) return '';
      if (typeof gVal === 'string' || typeof gVal === 'number') {
        return String(gVal).replace('Grade ', '').trim();
      }
      if (typeof gVal === 'object') {
        if (gVal.name) return String(gVal.name).replace('Grade ', '').trim();
        if (gVal.id) return String(gVal.id).replace('Grade ', '').trim();
        if (gVal.gradeName) return String(gVal.gradeName).replace('Grade ', '').trim();
      }
      return '';
    };

    // Helper: Check if subject applies to a grade
    const isSubjectForGrade = (s, targetG) => {
      const tNum = targetG.replace(/\D/g, '');
      const sGradStr = getCleanGradeStr(s.grade || s.gradeName || s.gradeId || '');
      const sNum = sGradStr.replace(/\D/g, '');

      if (!sGradStr || sGradStr.toLowerCase() === 'all' || sGradStr === '') return true;
      if (sNum && tNum && sNum === tNum) return true;
      if (sGradStr.toLowerCase() === targetG.toLowerCase()) return true;

      if (Array.isArray(s.grades)) {
        return s.grades.some(g => {
          const gStr = getCleanGradeStr(g);
          return gStr.replace(/\D/g, '') === tNum || gStr.toLowerCase() === 'all';
        });
      }
      return false;
    };

    // ⛔ CONSTRAINT CHECK 2: If targetGrade is specified, check if subjects exist for target grade
    if (targetGrade !== 'all') {
      const gradeSubjects = subjects.filter(s => isSubjectForGrade(s, targetGrade));

      if (gradeSubjects.length === 0) {
        showToast(`Cannot generate timetable for Grade ${targetGrade}: No Master Course subjects have been configured for Grade ${targetGrade} yet. Please add courses in Primary Data Entry first.`, 'danger');
        return;
      }
    }

    // ⛔ CONSTRAINT CHECK 3: If targetClassId is specified, check if class's grade has subjects
    if (targetClassId !== 'all') {
      const targetClass = classes.find(c => String(c.id) === String(targetClassId));
      if (targetClass) {
        const clsGradeRaw = targetClass.grade || targetClass.gradeName || targetClass.gradeId || targetClass.name || '';
        const clsGrade = getCleanGradeStr(clsGradeRaw);

        if (clsGrade) {
          const classGradeSubjects = subjects.filter(s => isSubjectForGrade(s, clsGrade));

          if (classGradeSubjects.length === 0) {
            showToast(`Cannot generate timetable for "${targetClass.name}": No Master Course subjects configured for Grade ${clsGrade}. Please add courses in Primary Data Entry first.`, 'danger');
            return;
          }
        }
      }
    }

    const existingWeekSlots = weeklyTimetables[activeWeekKey] || [];
    const result = generateAutoTimetable({
      faculties,
      venues,
      classes,
      subjects,
      ecaSchedule,
      bellConfig,
      targetClassId: targetClassId,
      targetGrade: targetGrade,
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
    const itemWithId = {
      ...newFaculty,
      id: newFaculty.id || `f_${Date.now()}`
    };
    setFaculties(prev => [...prev, itemWithId]);
    showToast(`Faculty member "${itemWithId.name}" added successfully.`);

    try {
      const res = await fetch('http://localhost:5000/api/faculties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemWithId)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setFaculties(prev => prev.map(f => f.id === itemWithId.id ? data.data : f));
      }
    } catch (err) {
      console.warn('Network call notice (retained in local cache):', err.message);
    }
  };

  const updateFaculty = async (updatedFaculty) => {
    setFaculties(prev => prev.map(f => f.id === updatedFaculty.id ? updatedFaculty : f));
    showToast(`Faculty profile updated for ${updatedFaculty.name}.`);

    try {
      await fetch(`http://localhost:5000/api/faculties/${updatedFaculty.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFaculty)
      });
    } catch (err) {
      console.warn('Network update notice:', err.message);
    }
  };

  const deleteFaculty = async (facultyId) => {
    const f = faculties.find(fac => fac.id === facultyId);
    setFaculties(prev => prev.filter(fac => fac.id !== facultyId));
    showToast(`Faculty ${f?.name || ''} removed.`, 'warning');

    try {
      await fetch(`http://localhost:5000/api/faculties/${facultyId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Network delete notice:', err.message);
    }
  };

  // Venue CRUD (MySQL API)
  const addVenue = async (newVenue) => {
    const itemWithId = {
      ...newVenue,
      id: newVenue.id || `v_${Date.now()}`
    };
    setVenues(prev => [...prev, itemWithId]);
    showToast(`Venue "${itemWithId.roomNo} - ${itemWithId.name}" added.`);

    try {
      const res = await fetch('http://localhost:5000/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemWithId)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setVenues(prev => prev.map(v => v.id === itemWithId.id ? data.data : v));
      }
    } catch (err) {
      console.warn('Network call notice:', err.message);
    }
  };

  const updateVenue = async (updatedVenue) => {
    setVenues(prev => prev.map(v => v.id === updatedVenue.id ? updatedVenue : v));
    showToast(`Venue details updated for ${updatedVenue.roomNo}.`);

    try {
      await fetch(`http://localhost:5000/api/venues/${updatedVenue.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedVenue)
      });
    } catch (err) {
      console.warn('Network update notice:', err.message);
    }
  };

  const deleteVenue = async (venueId) => {
    const v = venues.find(ven => ven.id === venueId);
    setVenues(prev => prev.filter(ven => ven.id !== venueId));
    showToast(`Venue ${v?.roomNo || ''} removed.`, 'warning');

    try {
      await fetch(`http://localhost:5000/api/venues/${venueId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Network delete notice:', err.message);
    }
  };

  // Class CRUD (MySQL API)
  const addClass = async (newClass) => {
    const itemWithId = {
      ...newClass,
      id: newClass.id || `c_${Date.now()}`
    };
    setClasses(prev => [...prev, itemWithId]);
    showToast(`Class "${itemWithId.name}" created.`);

    try {
      const res = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemWithId)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setClasses(prev => prev.map(c => c.id === itemWithId.id ? data.data : c));
      }
    } catch (err) {
      console.warn('Network call notice:', err.message);
    }
  };

  const updateClass = async (updatedClass) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
    showToast(`Class "${updatedClass.name}" updated.`);

    try {
      await fetch(`http://localhost:5000/api/classes/${updatedClass.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedClass)
      });
    } catch (err) {
      console.warn('Network update notice:', err.message);
    }
  };

  const deleteClass = async (classId) => {
    const c = classes.find(item => item.id === classId);
    setClasses(prev => prev.filter(item => item.id !== classId));
    showToast(`Class "${c?.name || ''}" removed.`, 'warning');

    try {
      await fetch(`http://localhost:5000/api/classes/${classId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Network delete notice:', err.message);
    }
  };

  // Subject CRUD (MySQL API)
  const addSubject = async (newSubj) => {
    const itemWithId = {
      ...newSubj,
      id: newSubj.id || `s_${Date.now()}`
    };
    setSubjects(prev => [...prev, itemWithId]);
    showToast(`Subject "${itemWithId.name}" (${itemWithId.code}) added.`);

    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemWithId)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSubjects(prev => prev.map(s => s.id === itemWithId.id ? data.data : s));
      }
    } catch (err) {
      console.warn('Network call notice:', err.message);
    }
  };

  const updateSubject = async (updatedSubj) => {
    setSubjects(prev => prev.map(s => s.id === updatedSubj.id ? updatedSubj : s));
    showToast(`Subject "${updatedSubj.name}" updated.`);

    try {
      await fetch(`http://localhost:5000/api/courses/${updatedSubj.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSubj)
      });
    } catch (err) {
      console.warn('Network update notice:', err.message);
    }
  };

  const deleteSubject = async (subjectId) => {
    const s = subjects.find(subj => subj.id === subjectId);
    setSubjects(prev => prev.filter(subj => subj.id !== subjectId));
    showToast(`Subject "${s?.name || ''}" removed.`, 'warning');

    try {
      await fetch(`http://localhost:5000/api/courses/${subjectId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Network delete notice:', err.message);
    }
  };

  // Grade Level CRUD Operations
  const addGrade = async (gradeData) => {
    const itemWithId = {
      ...gradeData,
      id: gradeData.id || `g_${Date.now()}`
    };
    setGrades(prev => [...prev.filter(g => String(g.id) !== String(itemWithId.id)), itemWithId]);
    showToast(`Grade level "${itemWithId.name}" saved.`);

    try {
      const res = await fetch('http://localhost:5000/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemWithId)
      });
      if (res.ok) {
        const newGrade = await res.json();
        setGrades(prev => [...prev.filter(g => String(g.id) !== String(newGrade.id)), newGrade]);
      }
    } catch (err) {
      console.warn('Network call notice:', err.message);
    }
    return itemWithId;
  };

  const updateGrade = async (id, gradeData) => {
    setGrades(prev => prev.map(g => (String(g.id) === String(id) ? { ...g, ...gradeData } : g)));
    showToast(`Grade level updated.`);

    try {
      await fetch(`http://localhost:5000/api/grades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData)
      });
    } catch (err) {
      console.warn('Network update notice:', err.message);
    }
  };

  const deleteGrade = async (id) => {
    const target = grades.find((g) => String(g.id) === String(id));
    setGrades((prev) => prev.filter((g) => String(g.id) !== String(id)));
    showToast(`Grade level "${target?.name || ''}" removed.`, 'warning');

    try {
      await fetch(`http://localhost:5000/api/grades/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Network delete notice:', err.message);
    }
  };

  // ── Time Slot CRUD (MySQL API) ──
  const addTimeSlot = async (newSlot) => {
    const itemWithId = {
      ...newSlot,
      id: newSlot.id || `ts_${Date.now()}`
    };
    setTimeSlots(prev => [...prev, itemWithId].sort((a, b) => (a.slotNo || 0) - (b.slotNo || 0)));
    showToast(`Time slot "${itemWithId.name}" added successfully.`);

    try {
      const res = await fetch('http://localhost:5000/api/time-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemWithId)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTimeSlots(prev => prev.map(s => s.id === itemWithId.id ? data.data : s).sort((a, b) => a.slotNo - b.slotNo));
      }
    } catch (err) {
      console.warn('Network call notice:', err.message);
    }
  };

  const updateTimeSlot = async (updatedSlot) => {
    setTimeSlots(prev => prev.map(s => String(s.id) === String(updatedSlot.id) ? { ...s, ...updatedSlot } : s).sort((a, b) => (a.slotNo || 0) - (b.slotNo || 0)));
    showToast(`Time slot "${updatedSlot.name}" updated.`);

    try {
      await fetch(`http://localhost:5000/api/time-slots/${updatedSlot.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSlot)
      });
    } catch (err) {
      console.warn('Network update notice:', err.message);
    }
  };

  const deleteTimeSlot = async (slotId) => {
    const target = timeSlots.find(s => String(s.id) === String(slotId));
    setTimeSlots(prev => prev.filter(s => String(s.id) !== String(slotId)));
    showToast(`Time slot "${target?.name || ''}" deleted.`, 'warning');

    try {
      await fetch(`http://localhost:5000/api/time-slots/${slotId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Network delete notice:', err.message);
    }
  };

  const saveBellConfig = async (newConfig) => {
    setBellConfig(newConfig);
    showToast('Bell Schedule parameters saved successfully.');

    try {
      const res = await fetch('http://localhost:5000/api/time-slots/bell-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      const data = await res.json();
      if (data.success && data.timeSlots && Array.isArray(data.timeSlots)) {
        setTimeSlots(data.timeSlots);
      }
    } catch (err) {
      console.warn('Network save notice:', err.message);
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

  const deleteTimetableSlot = async (slotId) => {
    setWeeklyTimetables(prev => {
      const weekSlots = prev[activeWeekKey] || [];
      const updatedSlots = weekSlots.filter(s => String(s.id) !== String(slotId));
      return { ...prev, [activeWeekKey]: updatedSlots };
    });

    try {
      await fetch(`http://localhost:5000/api/timetables/slot/${encodeURIComponent(slotId)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Failed to delete slot from MySQL DB:', err.message);
    }

    showToast('Timetable period slot removed.', 'warning');
  };

  const clearTimetable = async (options = {}) => {
    const { gradeFilter = 'ALL', classId = 'ALL' } = options;

    setWeeklyTimetables(prev => {
      const weekSlots = prev[activeWeekKey] || [];
      const filtered = weekSlots.filter(s => {
        if (classId !== 'ALL' && String(s.classId) === String(classId)) return false;
        if (gradeFilter !== 'ALL' && (String(s.grade || s.gradeName || '').includes(String(gradeFilter)) || String(s.className || '').includes(`Grade ${gradeFilter}`))) return false;
        if (gradeFilter === 'ALL' && classId === 'ALL') return false;
        return true;
      });
      return { ...prev, [activeWeekKey]: filtered };
    });

    try {
      const endpointTarget = classId !== 'ALL' ? classId : (gradeFilter !== 'ALL' ? `grade_${gradeFilter}` : 'all');
      await fetch(`http://localhost:5000/api/timetables/${encodeURIComponent(endpointTarget)}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Failed to clear timetable from MySQL DB:', err.message);
    }

    const msg = classId !== 'ALL' ? 'Class section timetable cleared.' : (gradeFilter !== 'ALL' ? `Grade ${gradeFilter} timetable cleared.` : 'Master timetable schedule cleared.');
    showToast(msg, 'warning');
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
        updateTimetableSlot,
        deleteTimetableSlot,
        clearTimetable
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  return useContext(SchoolContext);
}