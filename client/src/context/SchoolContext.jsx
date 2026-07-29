import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  DAYS,
  PERIODS,
  VENUE_TYPES,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_VENUES,
  INITIAL_FACULTIES,
  INITIAL_ECA_VERTICALS,
  INITIAL_ECA_SCHEDULE,
  INITIAL_ECA_TOTALS
} from '../utils/initialData';
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

// ── Helper: format date to YYYY-MM-DD key string ──
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
      name: 'Dr. Robert Vance',
      email: 'admin@gmail.com',
      role: 'Administrator',
      avatarColor: '#2563eb'
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [faculties, setFaculties] = useState(() => {
    const saved = localStorage.getItem('bitschool_faculties');
    return saved ? JSON.parse(saved) : INITIAL_FACULTIES;
  });

  const [venues, setVenues] = useState(() => {
    const saved = localStorage.getItem('bitschool_venues');
    return saved ? JSON.parse(saved) : INITIAL_VENUES;
  });

  const [classes, setClasses] = useState(() => {
    const saved = localStorage.getItem('bitschool_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('bitschool_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
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

  // Faculty CRUD
  const addFaculty = (newFaculty) => {
    const created = {
      ...newFaculty,
      id: `f_${Date.now()}`,
      empId: `FAC-0${faculties.length + 10}`,
      status: 'Active',
      avatarColor: ['#4f46e5', '#059669', '#0891b2', '#7c3aed', '#d97706', '#db2777'][Math.floor(Math.random() * 6)]
    };
    setFaculties([...faculties, created]);
    showToast(`Faculty member "${created.name}" added successfully.`);
  };

  const updateFaculty = (updatedFaculty) => {
    setFaculties(faculties.map(f => f.id === updatedFaculty.id ? updatedFaculty : f));
    showToast(`Faculty profile updated for ${updatedFaculty.name}.`);
  };

  const deleteFaculty = (facultyId) => {
    const f = faculties.find(fac => fac.id === facultyId);
    setFaculties(faculties.filter(fac => fac.id !== facultyId));
    showToast(`Faculty ${f?.name || ''} removed.`, 'warning');
  };

  // Venue CRUD
  const addVenue = (newVenue) => {
    const created = {
      ...newVenue,
      id: `v_${Date.now()}`,
      status: 'Available'
    };
    setVenues([...venues, created]);
    showToast(`Venue "${created.roomNo} - ${created.name}" added.`);
  };

  const updateVenue = (updatedVenue) => {
    setVenues(venues.map(v => v.id === updatedVenue.id ? updatedVenue : v));
    showToast(`Venue details updated for ${updatedVenue.roomNo}.`);
  };

  const deleteVenue = (venueId) => {
    const v = venues.find(ven => ven.id === venueId);
    setVenues(venues.filter(ven => ven.id !== venueId));
    showToast(`Venue ${v?.roomNo || ''} removed.`, 'warning');
  };

  // Class CRUD
  const addClass = (newClass) => {
    const created = {
      ...newClass,
      id: `c_${Date.now()}`
    };
    setClasses([...classes, created]);
    showToast(`Class "${created.name}" created.`);
  };

  const updateClass = (updatedClass) => {
    setClasses(classes.map(c => c.id === updatedClass.id ? updatedClass : c));
    showToast(`Class "${updatedClass.name}" updated.`);
  };

  const deleteClass = (classId) => {
    const c = classes.find(item => item.id === classId);
    setClasses(classes.filter(item => item.id !== classId));
    showToast(`Class "${c?.name || ''}" removed.`, 'warning');
  };

  // Subject CRUD
  const addSubject = (newSubj) => {
    const created = {
      ...newSubj,
      id: `s_${Date.now()}`
    };
    setSubjects([...subjects, created]);
    showToast(`Subject "${created.name}" (${created.code}) added.`);
  };

  const updateSubject = (updatedSubj) => {
    setSubjects(subjects.map(s => s.id === updatedSubj.id ? updatedSubj : s));
    showToast(`Subject "${updatedSubj.name}" updated.`);
  };

  const deleteSubject = (subjectId) => {
    const s = subjects.find(subj => subj.id === subjectId);
    setSubjects(subjects.filter(subj => subj.id !== subjectId));
    showToast(`Subject "${s?.name || ''}" removed.`, 'warning');
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
