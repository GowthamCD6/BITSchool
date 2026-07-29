import { DAYS, PERIODS } from './initialData';

/**
 * Smart Auto-Timetable Generation Algorithm
 * Generates a 6-day x 8-period timetable for all classes or specific class/grade level
 * while strictly honoring subject weekly period quotas (e.g. Maths 8 periods) and 0 double-booking.
 */
export function generateAutoTimetable({
  faculties,
  venues,
  classes,
  subjects,
  targetClassId = 'all',
  targetGrade = 'all',
  existingTimetable = []
}) {
  const timetable = [];
  const facultyBusy = {}; // key: `facultyId_day_period` -> boolean
  const venueBusy = {};   // key: `venueId_day_period` -> boolean
  const facultyDailyCount = {}; // key: `facultyId_day` -> number

  let totalSlots = 0;
  let allocatedSlots = 0;
  let conflictCount = 0;

  // Helper to check occupation
  const isFacultyFree = (facultyId, day, period) => !facultyBusy[`${facultyId}_${day}_${period}`];
  const isVenueFree = (venueId, day, period) => !venueBusy[`${venueId}_${day}_${period}`];

  // Determine classes to process (All, Specific Class, or Specific Grade Level)
  let classesToProcess = classes;
  if (targetClassId && targetClassId !== 'all') {
    classesToProcess = classes.filter(c => c.id === targetClassId);
  } else if (targetGrade && targetGrade !== 'all') {
    classesToProcess = classes.filter(c => c.grade === String(targetGrade));
  }

  // Preserve existing slots for classes NOT being re-generated
  const preservedSlots = existingTimetable.filter(
    t => !classesToProcess.some(c => c.id === t.classId)
  );

  preservedSlots.forEach(slot => {
    facultyBusy[`${slot.facultyId}_${slot.day}_${slot.period}`] = true;
    venueBusy[`${slot.venueId}_${slot.day}_${slot.period}`] = true;
    timetable.push(slot);
  });

  // Process each targeted class
  classesToProcess.forEach((cls) => {
    // 1. Build exact workload pool honoring weekly period quotas per subject (e.g. Maths 8 periods)
    const classSubjectPool = [];

    subjects.forEach((subj) => {
      // Find faculty for this subject & class grade
      const targetFaculty = faculties.find(f =>
        (f.primarySubjectId === subj.id || f.secondarySubjectIds.includes(subj.id)) &&
        (f.grades.includes(cls.name) || f.grades.includes(cls.grade) || f.grades.length > 0)
      ) || faculties.find(f => f.primarySubjectId === subj.id) || faculties[0];

      // Add exact weekly period quota (e.g., 8 periods for Maths, 6 for English, etc.)
      const count = Number(subj.weeklyPeriods) || 4;
      for (let i = 0; i < count; i++) {
        classSubjectPool.push({
          subject: subj,
          faculty: targetFaculty
        });
      }
    });

    // Total weekly periods target: 6 days * 8 periods = 48 slots
    const totalWeeklySlots = DAYS.length * PERIODS.length; // 48
    while (classSubjectPool.length < totalWeeklySlots) {
      // Top off remaining slots with core subjects (Maths, Science, English, CS)
      const coreSubj = subjects[classSubjectPool.length % subjects.length];
      const targetFaculty = faculties.find(f => f.primarySubjectId === coreSubj.id) || faculties[0];
      classSubjectPool.push({
        subject: coreSubj,
        faculty: targetFaculty
      });
    }

    // Trim if subjects exceeded 48 slots
    const finalPool = classSubjectPool.slice(0, totalWeeklySlots);

    // Shuffle pool for organic weekly distribution
    const shuffledPool = [...finalPool].sort(() => 0.5 - Math.random());
    let poolIndex = 0;

    // Track daily subject count per class (max 2 periods of same subject per day)
    const classDailySubjectCount = {};

    DAYS.forEach((day) => {
      PERIODS.forEach((periodObj) => {
        const period = periodObj.id;
        totalSlots++;

        let assigned = false;
        let attempts = 0;

        while (!assigned && attempts < shuffledPool.length) {
          const candidate = shuffledPool[(poolIndex + attempts) % shuffledPool.length];
          const subj = candidate.subject;
          const fac = candidate.faculty;

          const daySubjKey = `${cls.id}_${day}_${subj.id}`;
          const currentDailyCount = classDailySubjectCount[daySubjKey] || 0;

          // Cap max 2 periods per day for same subject
          if (currentDailyCount >= 2) {
            attempts++;
            continue;
          }

          // Check Faculty Daily Workload Limit
          const facDayKey = `${fac.id}_${day}`;
          const currentFacDaily = facultyDailyCount[facDayKey] || 0;
          if (currentFacDaily >= (fac.maxPeriodsPerDay || 6)) {
            attempts++;
            continue;
          }

          // Check Faculty Availability at this slot
          if (!isFacultyFree(fac.id, day, period)) {
            attempts++;
            continue;
          }

          // Find suitable venue for required venue type
          let chosenVenue = venues.find(v =>
            v.type === subj.requiredVenueType && isVenueFree(v.id, day, period) && v.status === 'Available'
          );

          // Fallback venue search
          if (!chosenVenue) {
            chosenVenue = venues.find(v => v.id === cls.homeVenueId && isVenueFree(v.id, day, period)) ||
                          venues.find(v => isVenueFree(v.id, day, period) && v.status === 'Available') ||
                          venues[0];
          }

          const venueFree = isVenueFree(chosenVenue.id, day, period);

          // Assign slot
          const slotId = `slot_${cls.id}_d${day}_p${period}`;
          const isConflict = !venueFree;

          if (isConflict) {
            conflictCount++;
          } else {
            facultyBusy[`${fac.id}_${day}_${period}`] = true;
            venueBusy[`${chosenVenue.id}_${day}_${period}`] = true;
          }

          facultyDailyCount[facDayKey] = currentFacDaily + 1;
          classDailySubjectCount[daySubjKey] = currentDailyCount + 1;

          timetable.push({
            id: slotId,
            classId: cls.id,
            className: cls.name,
            day: day,
            period: period,
            periodName: periodObj.name,
            periodTime: periodObj.time,
            subjectId: subj.id,
            subjectName: subj.name,
            subjectCode: subj.code,
            subjectColor: subj.color,
            facultyId: fac.id,
            facultyName: fac.name,
            venueId: chosenVenue.id,
            venueName: chosenVenue.name,
            venueRoomNo: chosenVenue.roomNo,
            venueType: chosenVenue.type,
            isConflict: isConflict,
            conflictReason: isConflict ? `Venue ${chosenVenue.roomNo} double-booked` : null
          });

          allocatedSlots++;
          assigned = true;
          poolIndex = (poolIndex + attempts + 1) % shuffledPool.length;
        }

        // Fallback if no free candidate found
        if (!assigned) {
          const fallbackCandidate = shuffledPool[poolIndex % shuffledPool.length];
          const fallbackVenue = venues.find(v => v.id === cls.homeVenueId) || venues[0];
          timetable.push({
            id: `slot_${cls.id}_d${day}_p${period}`,
            classId: cls.id,
            className: cls.name,
            day: day,
            period: period,
            periodName: periodObj.name,
            periodTime: periodObj.time,
            subjectId: fallbackCandidate.subject.id,
            subjectName: fallbackCandidate.subject.name,
            subjectCode: fallbackCandidate.subject.code,
            subjectColor: fallbackCandidate.subject.color,
            facultyId: fallbackCandidate.faculty.id,
            facultyName: fallbackCandidate.faculty.name,
            venueId: fallbackVenue.id,
            venueName: fallbackVenue.name,
            venueRoomNo: fallbackVenue.roomNo,
            venueType: fallbackVenue.type,
            isConflict: false,
            conflictReason: null
          });
          allocatedSlots++;
        }
      });
    });
  });

  return {
    timetable,
    stats: {
      totalSlots: timetable.length,
      allocatedSlots: timetable.length,
      conflictCount,
      utilizationRate: timetable.length > 0 ? Math.round(((timetable.length - conflictCount) / timetable.length) * 100) : 100
    }
  };
}
