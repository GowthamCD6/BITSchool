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
    return saved ? JSON.parse(saved) : INITIAL_ECA_VERTICALS;
  });

  const [ecaSchedule, setEcaSchedule] = useState(() => {
    const saved = localStorage.getItem('bitschool_eca_schedule');
    return saved ? JSON.parse(saved) : INITIAL_ECA_SCHEDULE;
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

  // Fetch Classes, Subjects, Venues, Faculties, and Grades from MySQL Backend API on mount
  useEffect(() => {
    const fetchDatabaseData = async () => {
      try {
        const [classesRes, subjectsRes, venuesRes, facultiesRes, gradesRes] = await Promise.all([
          fetch('http://localhost:5000/api/classes'),
          fetch('http://localhost:5000/api/courses'),
          fetch('http://localhost:5000/api/venues'),
          fetch('http://localhost:5000/api/faculties'),
          fetch('http://localhost:5000/api/grades')
        ]);

        if (classesRes.ok) {
          const data = await classesRes.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          setClasses(items);
        }

        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          setSubjects(items);
        }

        if (venuesRes.ok) {
          const data = await venuesRes.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          setVenues(items);
        }

        if (facultiesRes.ok) {
          const data = await facultiesRes.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          setFaculties(items);
        }

        if (gradesRes && gradesRes.ok) {
          const data = await gradesRes.json();
          const items = Array.isArray(data) ? data : (data.data || []);
          setGrades(items);
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

  // ── ECA Handlers ──
  const updateEcaCell = (day, vertical, newCellData) => {
    setEcaSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [vertical]: newCellData
      }
    }));
    showToast(`Updated ECA activity for ${vertical} on ${day}.`);
  };

  const addEcaVertical = (verticalName) => {
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
    showToast(`Added new ECA Vertical: "${verticalName}".`);
  };

  const deleteEcaVertical = (verticalName) => {
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
    showToast(`Removed ECA Vertical "${verticalName}".`, 'warning');
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Auto Generate Timetable — saves under the active week key
  const handleAutoGenerateTimetable = (options = {}) => {
    const existingWeekSlots = weeklyTimetables[activeWeekKey] || [];
    const result = generateAutoTimetable({
      faculties,
      venues,
      classes,
      subjects,
      targetClassId: options.targetClassId || 'all',
      targetGrade: options.targetGrade || 'all',
      existingTimetable: existingWeekSlots
    });
    setWeeklyTimetables(prev => ({
      ...prev,
      [activeWeekKey]: result.timetable
    }));
    setTimetableStats(result.stats);
    showToast(`Timetable Auto-Scheduled for week ${activeWeekKey}! ${result.stats.allocatedSlots} slots allocated (${result.stats.utilizationRate}% Efficiency).`, 'success');
  };

  // ── Delete a week's timetable ──
  const deleteWeekTimetable = (weekKey) => {
    setWeeklyTimetables(prev => {
      const copy = { ...prev };
      delete copy[weekKey];
      return copy;
    });
    showToast(`Timetable for week ${weekKey} deleted.`, 'warning');
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

  // Update a single Timetable cell slot (within active week)
  const updateTimetableSlot = (slotId, newDetails) => {
    setWeeklyTimetables(prev => {
      const weekSlots = prev[activeWeekKey] || [];
      const updatedSlots = weekSlots.map(slot => {
        if (slot.id === slotId) {
          const subj = subjects.find(s => s.id === newDetails.subjectId);
          const fac = faculties.find(f => f.id === newDetails.facultyId);
          const ven = venues.find(v => v.id === newDetails.venueId);

          return {
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
        }
        return slot;
      });
      return { ...prev, [activeWeekKey]: updatedSlots };
    });
    showToast('Timetable period slot updated manually.');
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
        ecaSchedule,
        updateEcaCell,
        addEcaVertical,
        deleteEcaVertical,
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