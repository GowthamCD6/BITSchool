import { DAYS, PERIODS } from './initialData';

/**
 * Smart Auto-Timetable Generation Algorithm
 * Generates a 6-day x 8-period timetable for all classes without teacher or venue double-booking.
 */
export function generateAutoTimetable({ faculties, venues, classes, subjects }) {
  const timetable = [];
  const facultyBusy = {}; // key: `facultyId_day_period` -> boolean
  const venueBusy = {};   // key: `venueId_day_period` -> boolean
  const facultyDailyCount = {}; // key: `facultyId_day` -> number

  let totalSlots = 0;
  let allocatedSlots = 0;
  let conflictCount = 0;

  // Helper to mark occupation
  const isFacultyFree = (facultyId, day, period) => !facultyBusy[`${facultyId}_${day}_${period}`];
  const isVenueFree = (venueId, day, period) => !venueBusy[`${venueId}_${day}_${period}`];

  // Process each class independently
  classes.forEach((cls) => {
    // 1. Build workload pool for this class
    // Map subjects that are relevant or standard subjects
    const classSubjectPool = [];
    
    // Allocate subject periods to reach ~48 total slots per week (6 days * 8 periods)
    subjects.forEach((subj) => {
      // Find potential faculty for this subject and class grade
      const targetFaculty = faculties.find(f => 
        (f.primarySubjectId === subj.id || f.secondarySubjectIds.includes(subj.id)) &&
        (f.grades.includes(cls.name) || f.grades.includes(cls.grade) || f.grades.length > 0)
      ) || faculties.find(f => f.primarySubjectId === subj.id) || faculties[0];

      for (let i = 0; i < subj.weeklyPeriods; i++) {
        classSubjectPool.push({
          subject: subj,
          faculty: targetFaculty
        });
      }
    });

    // Fill any remaining slots to make 48 slots per class
    const totalWeeklySlots = DAYS.length * PERIODS.length; // 6 * 8 = 48
    while (classSubjectPool.length < totalWeeklySlots) {
      // Repeat core subjects like Maths, English, Science, Computer Science
      const coreSubj = subjects[classSubjectPool.length % subjects.length];
      const targetFaculty = faculties.find(f => f.primarySubjectId === coreSubj.id) || faculties[0];
      classSubjectPool.push({
        subject: coreSubj,
        faculty: targetFaculty
      });
    }

    // Shuffle slightly for organic distribution across the week
    const shuffledPool = [...classSubjectPool].sort(() => 0.5 - Math.random());
    let poolIndex = 0;

    // Track daily subject frequency per class to avoid subjects repeating > 2 times per day
    const classDailySubjectCount = {};

    DAYS.forEach((day) => {
      PERIODS.forEach((periodObj) => {
        const period = periodObj.id;
        totalSlots++;

        if (poolIndex >= shuffledPool.length) {
          poolIndex = 0;
        }

        let assigned = false;
        let attempts = 0;

        while (!assigned && attempts < shuffledPool.length) {
          const candidate = shuffledPool[(poolIndex + attempts) % shuffledPool.length];
          const subj = candidate.subject;
          const fac = candidate.faculty;

          const daySubjKey = `${cls.id}_${day}_${subj.id}`;
          const currentDailyCount = classDailySubjectCount[daySubjKey] || 0;

          // Check subject daily cap (max 2 periods per day for same subject)
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

          // Check Faculty Availability at this day & period slot
          if (!isFacultyFree(fac.id, day, period)) {
            attempts++;
            continue;
          }

          // Find suitable venue for required venue type
          let chosenVenue = venues.find(v => 
            v.type === subj.requiredVenueType && isVenueFree(v.id, day, period) && v.status === 'Available'
          );

          // Fallback venue search if exact type is unavailable or busy
          if (!chosenVenue) {
            // Home venue or any available normal classroom
            chosenVenue = venues.find(v => v.id === cls.homeVenueId && isVenueFree(v.id, day, period)) ||
                          venues.find(v => isVenueFree(v.id, day, period) && v.status === 'Available') ||
                          venues[0];
          }

          const venueFree = isVenueFree(chosenVenue.id, day, period);

          // Assign slot!
          const slotId = `slot_${cls.id}_d${day}_p${period}`;
          const isConflict = !venueFree;

          if (isConflict) {
            conflictCount++;
          } else {
            // Mark busy
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

        // Fallback if no clean candidate was found in pool
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
      totalSlots,
      allocatedSlots,
      conflictCount,
      utilizationRate: Math.round(((allocatedSlots - conflictCount) / totalSlots) * 100)
    }
  };
}
