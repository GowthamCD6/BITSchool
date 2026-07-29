import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  DAYS,
  PERIODS,
  VENUE_TYPES,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_VENUES,
  INITIAL_FACULTIES
} from '../utils/initialData';
import { generateAutoTimetable } from '../utils/timetableGenerator';

const SchoolContext = createContext();

export function SchoolProvider({ children }) {
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

  const [timetable, setTimetable] = useState(() => {
    const saved = localStorage.getItem('bitschool_timetable');
    if (saved) return JSON.parse(saved);
    // Generate initial timetable
    const generated = generateAutoTimetable({
      faculties: INITIAL_FACULTIES,
      venues: INITIAL_VENUES,
      classes: INITIAL_CLASSES,
      subjects: INITIAL_SUBJECTS
    });
    return generated.timetable;
  });

  const [timetableStats, setTimetableStats] = useState({
    totalSlots: timetable.length,
    allocatedSlots: timetable.length,
    conflictCount: 0,
    utilizationRate: 100
  });

  const [toast, setToast] = useState(null);

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
    localStorage.setItem('bitschool_timetable', JSON.stringify(timetable));
  }, [timetable]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Auto Generate Timetable
  const handleAutoGenerateTimetable = (options = {}) => {
    const result = generateAutoTimetable({
      faculties,
      venues,
      classes,
      subjects,
      targetClassId: options.targetClassId || 'all',
      targetGrade: options.targetGrade || 'all',
      existingTimetable: timetable
    });
    setTimetable(result.timetable);
    setTimetableStats(result.stats);
    showToast(`Timetable Auto-Scheduled! ${result.stats.allocatedSlots} slots allocated (${result.stats.utilizationRate}% Efficiency).`, 'success');
  };

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

  // Update a single Timetable cell slot
  const updateTimetableSlot = (slotId, newDetails) => {
    setTimetable(prev => prev.map(slot => {
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
    }));
    showToast('Timetable period slot updated manually.');
  };

  return (
    <SchoolContext.Provider
      value={{
        activeTab,
        setActiveTab,
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
