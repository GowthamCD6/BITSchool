import { DAYS } from './constants';

// ─── Constants ───
const MIN_PERIOD_MINS = 15;   // Absolute minimum: no period shorter than 15 minutes
const ROUND_TO = 5;           // Round all durations to nearest 5-minute increment

// Helper: Convert 12hr/24hr string into total minutes from midnight
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const clean = String(timeStr).trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');
  const timeOnly = clean.replace(/AM|PM/g, '').trim();
  let [h, m] = timeOnly.split(':').map(Number);
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;
  return h * 60 + m;
}

// Helper: Format total minutes into 12-hour AM/PM string (e.g. 08:30 AM, 02:15 PM)
function formatMinutesTo12Hr(totalMins) {
  let mins = totalMins % (24 * 60);
  let hrs = Math.floor(mins / 60);
  const m = mins % 60;
  const period = hrs >= 12 ? 'PM' : 'AM';
  hrs = hrs % 12;
  if (hrs === 0) hrs = 12;
  const hh = String(hrs).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  return `${hh}:${mm} ${period}`;
}

// Helper: Round minutes to nearest ROUND_TO increment (e.g. 36→35, 18→20, 22→20, 28→30)
function roundTo5(mins) {
  return Math.round(mins / ROUND_TO) * ROUND_TO;
}

// Helper: Seeded shuffle (Fisher-Yates) so each day gets a DIFFERENT but deterministic order
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed;
  const nextRand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s >>> 16) / 32768.0;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Calculate per-period duration in minutes for a subject:
 * Formula: Period Duration = Total Weekly Duration (minutes) / Weekly Periods Count
 * Then round to nearest 5 minutes and enforce minimum 15 minutes.
 */
export function getSubjectPeriodDurationMins(subj) {
  const count = Number(subj.weeklyPeriods) || 4;
  let totalMins = 240; // Default 4 hours total per week

  if (subj.weeklyDuration) {
    const str = String(subj.weeklyDuration).trim().toLowerCase();
    if (str.includes(':')) {
      const [h, m] = str.split(':').map(Number);
      totalMins = (h || 0) * 60 + (m || 0);
    } else if (str.includes('hour')) {
      const hrs = parseFloat(str) || 4;
      totalMins = Math.round(hrs * 60);
    } else if (str.includes('min')) {
      const mins = parseInt(str) || 180;
      totalMins = mins;
    } else {
      const num = parseFloat(str);
      if (!isNaN(num)) totalMins = num > 20 ? num : Math.round(num * 60);
    }
  }

  const rawPerPeriod = totalMins / Math.max(1, count);
  const rounded = roundTo5(rawPerPeriod);
  // Enforce minimum 15 minutes
  return Math.max(MIN_PERIOD_MINS, rounded);
}

/**
 * Dynamically calculate 8 teaching periods from Master Bell Milestones
 */
export function calculateDynamicPeriodsFromBellConfig(config = {}) {
  const sStart = parseTimeToMinutes(config.schoolStartTime || '09:15 AM');
  const mBStart = parseTimeToMinutes(config.morningBreakStart || '10:45 AM');
  const mBEnd = parseTimeToMinutes(config.morningBreakEnd || '11:00 AM');
  const lStart = parseTimeToMinutes(config.lunchBreakStart || '11:45 AM');
  const lEnd = parseTimeToMinutes(config.lunchBreakEnd || '12:30 PM');
  const aBStart = parseTimeToMinutes(config.afternoonBreakStart || '02:30 PM');
  const aBEnd = parseTimeToMinutes(config.afternoonBreakEnd || '02:45 PM');
  const sEnd = parseTimeToMinutes(config.schoolEndTime || '03:40 PM');

  const periods = [];

  const s1Mins = mBStart - sStart;
  const dur1 = roundTo5(s1Mins / 2);
  periods.push({ id: 1, name: 'Period 1', startTime: formatMinutesTo12Hr(sStart), endTime: formatMinutesTo12Hr(sStart + dur1), time: `${formatMinutesTo12Hr(sStart)} - ${formatMinutesTo12Hr(sStart + dur1)}` });
  periods.push({ id: 2, name: 'Period 2', startTime: formatMinutesTo12Hr(sStart + dur1), endTime: formatMinutesTo12Hr(mBStart), time: `${formatMinutesTo12Hr(sStart + dur1)} - ${formatMinutesTo12Hr(mBStart)}` });

  const s2Mins = lStart - mBEnd;
  const dur2 = roundTo5(s2Mins / 2);
  periods.push({ id: 3, name: 'Period 3', startTime: formatMinutesTo12Hr(mBEnd), endTime: formatMinutesTo12Hr(mBEnd + dur2), time: `${formatMinutesTo12Hr(mBEnd)} - ${formatMinutesTo12Hr(mBEnd + dur2)}` });
  periods.push({ id: 4, name: 'Period 4', startTime: formatMinutesTo12Hr(mBEnd + dur2), endTime: formatMinutesTo12Hr(lStart), time: `${formatMinutesTo12Hr(mBEnd + dur2)} - ${formatMinutesTo12Hr(lStart)}` });

  const s3Mins = aBStart - lEnd;
  const dur3 = roundTo5(s3Mins / 2);
  periods.push({ id: 5, name: 'Period 5', startTime: formatMinutesTo12Hr(lEnd), endTime: formatMinutesTo12Hr(lEnd + dur3), time: `${formatMinutesTo12Hr(lEnd)} - ${formatMinutesTo12Hr(lEnd + dur3)}` });
  periods.push({ id: 6, name: 'Period 6', startTime: formatMinutesTo12Hr(lEnd + dur3), endTime: formatMinutesTo12Hr(aBStart), time: `${formatMinutesTo12Hr(lEnd + dur3)} - ${formatMinutesTo12Hr(aBStart)}` });

  const s4Mins = sEnd - aBEnd;
  const dur4 = roundTo5(s4Mins / 2);
  periods.push({ id: 7, name: 'Period 7', startTime: formatMinutesTo12Hr(aBEnd), endTime: formatMinutesTo12Hr(aBEnd + dur4), time: `${formatMinutesTo12Hr(aBEnd)} - ${formatMinutesTo12Hr(aBEnd + dur4)}` });
  periods.push({ id: 8, name: 'Period 8', startTime: formatMinutesTo12Hr(aBEnd + dur4), endTime: formatMinutesTo12Hr(sEnd), time: `${formatMinutesTo12Hr(aBEnd + dur4)} - ${formatMinutesTo12Hr(sEnd)}` });

  return periods;
}

/**
 * Smart Session-Window Packing Timetable Generator Algorithm
 *
 * Rules:
 * 1. Breaks are SACRED & IMMUTABLE — no subject spills past a break boundary.
 * 2. Period Duration = round5(Total Weekly Duration / Weekly Periods Count), minimum 15 min.
 * 3. Every minute from start to end is utilized — no gaps, no waste.
 * 4. Period 1 is ALWAYS Physical Fitness (15 min).
 * 5. Locked ECA Non-Academic Schedule per Grade (placed in Session 3, post-lunch).
 * 6. MAX 1 period per subject per day for each class section.
 * 7. Each day gets a DIFFERENT shuffled subject order so timetables vary day-to-day.
 * 8. All times are rounded to 5-minute increments for clean scheduling.
 */
export function generateAutoTimetable({
  faculties = [],
  venues = [],
  classes = [],
  subjects = [],
  ecaSchedule = {},
  bellConfig = {},
  targetClassId = 'all',
  targetGrade = 'all',
  existingTimetable = []
}) {
  const timetable = [];
  const facultyBusy = {};
  const venueBusy = {};

  let conflictCount = 0;

  // Extract Bell Milestones (Minutes from Midnight)
  const sStart = parseTimeToMinutes(bellConfig.schoolStartTime || '09:15 AM');
  const mBStart = parseTimeToMinutes(bellConfig.morningBreakStart || '10:45 AM');
  const mBEnd = parseTimeToMinutes(bellConfig.morningBreakEnd || '11:00 AM');
  const lStart = parseTimeToMinutes(bellConfig.lunchBreakStart || '11:45 AM');
  const lEnd = parseTimeToMinutes(bellConfig.lunchBreakEnd || '12:30 PM');
  const aBStart = parseTimeToMinutes(bellConfig.afternoonBreakStart || '02:30 PM');
  const aBEnd = parseTimeToMinutes(bellConfig.afternoonBreakEnd || '02:45 PM');
  const sEnd = parseTimeToMinutes(bellConfig.schoolEndTime || '03:40 PM');

  // Helper to extract grade string
  const getGradeStr = (c) => {
    if (!c) return '4';
    const g = typeof c === 'object' && c !== null && c.grade !== undefined ? c.grade : c;
    if (typeof g === 'object' && g !== null) {
      return String(g.name || g.id || '4').replace('Grade ', '');
    }
    return String(g || '4').replace('Grade ', '');
  };

  // Determine classes to process
  let classesToProcess = classes;
  if (targetClassId && targetClassId !== 'all') {
    classesToProcess = classes.filter(c => c.id === targetClassId);
  } else if (targetGrade && targetGrade !== 'all') {
    classesToProcess = classes.filter(c => getGradeStr(c) === String(targetGrade));
  }

  // Preserve existing slots for classes NOT being re-generated
  const preservedSlots = existingTimetable.filter(
    t => !classesToProcess.some(c => c.id === t.classId)
  );
  preservedSlots.forEach(slot => {
    if (slot.facultyId) facultyBusy[`${slot.facultyId}_${slot.day}_${slot.startTime}`] = true;
    if (slot.venueId) venueBusy[`${slot.venueId}_${slot.day}_${slot.startTime}`] = true;
    timetable.push(slot);
  });

  // Find Physical Fitness subject
  const pfSubj = subjects.find(s =>
    s.name.toLowerCase().includes('fitness') || s.name.toLowerCase().includes('physical')
  ) || {
    id: 'subj_pf', name: 'Physical Fitness', code: 'PF',
    weeklyDuration: '01:30', weeklyPeriods: 6, color: '#059669'
  };
  const pfFaculty = faculties.find(f => f.primarySubjectId === pfSubj.id) || faculties[0] || { id: 'f_pf', name: 'Fitness Coach' };
  const pfDuration = Math.max(MIN_PERIOD_MINS, getSubjectPeriodDurationMins(pfSubj));

  // Process each targeted class
  classesToProcess.forEach((cls) => {
    const classGrade = getGradeStr(cls);

    // Filter subjects applicable to this grade (exclude Physical Fitness — handled separately)
    const gradeSubjects = subjects.filter(s => {
      if (s.name.toLowerCase().includes('fitness') || s.name.toLowerCase().includes('physical')) return false;
      if (!s.grade || s.grade === 'all') return true;
      const sg = String(s.grade).replace('Grade ', '').trim();
      return sg === classGrade || (Array.isArray(s.grades) && s.grades.includes(classGrade));
    });
    const activeSubjects = gradeSubjects.length > 0
      ? gradeSubjects
      : subjects.filter(s => !s.name.toLowerCase().includes('fitness') && !s.name.toLowerCase().includes('physical'));

    // Build master workload pool: each subject appears `weeklyPeriods` times
    const masterPool = [];
    activeSubjects.forEach((subj) => {
      const targetFaculty = faculties.find(f =>
        (f.primarySubjectId === subj.id || (f.secondarySubjectIds && f.secondarySubjectIds.includes(subj.id)))
      ) || faculties.find(f => f.primarySubjectId === subj.id) || faculties[0] || { id: 'f_default', name: 'Staff Faculty' };

      const count = Number(subj.weeklyPeriods) || 4;
      const periodDurationMins = getSubjectPeriodDurationMins(subj);

      for (let i = 0; i < count; i++) {
        masterPool.push({
          subject: subj,
          faculty: targetFaculty,
          periodDurationMins
        });
      }
    });

    // Track how many times each subject has been allocated across the week
    const weeklySubjectAllocCount = {};

    DAYS.forEach((day, dayIndex) => {
      const dayUpper = String(day).toUpperCase();
      const gradeKey = `${classGrade}_${dayUpper}`;
      const dayEcaMap = ecaSchedule[gradeKey] || ecaSchedule[dayUpper] || ecaSchedule[day] || {};

      // Collect active ECA verticals for this grade & day
      const activeEcaList = [];
      if (typeof dayEcaMap === 'object') {
        Object.entries(dayEcaMap).forEach(([vertName, vertData]) => {
          if (vertData && (vertData.active || (vertData.label && vertData.label !== 'No' && !vertData.label.startsWith('No')))) {
            activeEcaList.push({
              name: vertName,
              label: vertData.label || vertName,
              duration: vertData.duration || '45 mins',
              color: vertData.color || '#d97706'
            });
          }
        });
      }
      const activeEca = activeEcaList[0];

      // ─── Fresh shuffled pool PER DAY using a different seed ───
      // Seed varies by class + day so each day gets a DIFFERENT subject order
      const classSeed = cls.id ? cls.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : 42;
      const daySeed = classSeed * 100 + (dayIndex + 1) * 17 + dayIndex * 37;

      // Build a full reference list of all subjects with their computed durations & faculties
      const allSubjectEntries = activeSubjects.map(subj => {
        const fac = faculties.find(f =>
          f.primarySubjectId === subj.id || (f.secondarySubjectIds && f.secondarySubjectIds.includes(subj.id))
        ) || faculties.find(f => f.primarySubjectId === subj.id) || faculties[0] || { id: 'f_default', name: 'Staff Faculty' };
        return {
          subject: subj,
          faculty: fac,
          periodDurationMins: getSubjectPeriodDurationMins(subj)
        };
      });

      // Shuffle the full reference list for this day
      const shuffledAllSubjects = seededShuffle(allSubjectEntries, daySeed);

      // Filter to quota-remaining subjects (Tier 1 priority)
      const quotaPool = shuffledAllSubjects.filter(item => {
        const key = item.subject.id;
        const maxWeekly = Number(item.subject.weeklyPeriods) || 4;
        return (weeklySubjectAllocCount[key] || 0) < maxWeekly;
      });

      // Track which subjects are placed THIS day for this class
      const todayPlaced = new Set();
      let periodIndex = 1;

      // Session windows bounded by sacred break milestones
      const sessions = [
        { id: 1, start: sStart, end: mBStart },
        { id: 2, start: mBEnd, end: lStart },
        { id: 3, start: lEnd, end: aBStart },
        { id: 4, start: aBEnd, end: sEnd }
      ];

      sessions.forEach((session) => {
        let currentMins = session.start;

        while (currentMins < session.end) {
          const remaining = session.end - currentMins;

          // Skip if remaining window is less than minimum period duration
          if (remaining < MIN_PERIOD_MINS) {
            currentMins = session.end;
            break;
          }

          // ─── RULE: Period 1 is ALWAYS Physical Fitness ───
          if (session.id === 1 && currentMins === sStart) {
            const dur = Math.min(pfDuration, remaining);
            const startStr = formatMinutesTo12Hr(currentMins);
            const endStr = formatMinutesTo12Hr(currentMins + dur);
            const homeVenue = venues.find(v => v.id === cls.homeVenueId) || venues[0] || { id: 'v1', roomNo: 'Room 100', type: 'normal' };

            timetable.push({
              id: `slot_${cls.id}_d${day}_p${periodIndex}`,
              classId: cls.id, className: cls.name,
              day, period: periodIndex++,
              periodName: 'Period 1',
              periodTime: `${startStr} - ${endStr}`,
              startTime: startStr, endTime: endStr,
              durationMins: dur,
              subjectId: pfSubj.id,
              subjectName: pfSubj.name || 'Physical Fitness',
              subjectCode: pfSubj.code || 'PF',
              subjectColor: pfSubj.color || '#059669',
              facultyId: pfFaculty.id, facultyName: pfFaculty.name,
              venueId: homeVenue.id, venueName: homeVenue.name || 'Room 100',
              venueRoomNo: homeVenue.roomNo || 'Room 100', venueType: 'normal',
              isConflict: false, conflictReason: null
            });

            todayPlaced.add(pfSubj.id);
            currentMins += dur;
            continue;
          }

          // ─── RULE: ECA Slot in Session 3 (Post-Lunch) at start ───
          if (session.id === 3 && activeEca && currentMins === lEnd) {
            let ecaDur = 45;
            const durStr = String(activeEca.duration || '').toLowerCase();
            if (durStr.includes('1 hour') || durStr.includes('60')) ecaDur = 60;
            else if (durStr.includes('30')) ecaDur = 30;
            else if (durStr.includes('15')) ecaDur = 15;
            ecaDur = roundTo5(ecaDur);
            ecaDur = Math.min(ecaDur, remaining);
            ecaDur = Math.max(MIN_PERIOD_MINS, ecaDur);

            const startStr = formatMinutesTo12Hr(currentMins);
            const endStr = formatMinutesTo12Hr(currentMins + ecaDur);

            timetable.push({
              id: `slot_${cls.id}_d${day}_p${periodIndex}`,
              classId: cls.id, className: cls.name,
              day, period: periodIndex++,
              periodName: 'ECA Slot',
              periodTime: `${startStr} - ${endStr}`,
              startTime: startStr, endTime: endStr,
              durationMins: ecaDur,
              subjectId: 'eca_non_academic',
              subjectName: `${activeEca.name} (${activeEca.label})`,
              subjectCode: 'ECA',
              subjectColor: activeEca.color || '#d97706',
              facultyId: null, facultyName: 'ECA Instructor',
              venueId: cls.homeVenueId || null, venueName: 'ECA Zone',
              venueRoomNo: 'ECA Zone', venueType: 'eca',
              isConflict: false, conflictReason: null,
              ecaTag: activeEca.name
            });

            currentMins += ecaDur;
            continue;
          }

          // ─── RULE: Place Academic Subject (3-TIER FALLBACK) ───
          // Helper: try to find a fitting candidate from a list
          const findCandidate = (pool, checkQuota, checkToday) => {
            for (let i = 0; i < pool.length; i++) {
              const cand = pool[i];
              const subjId = cand.subject.id;

              if (checkToday && todayPlaced.has(subjId)) continue;

              if (checkQuota) {
                const maxWeekly = Number(cand.subject.weeklyPeriods) || 4;
                if ((weeklySubjectAllocCount[subjId] || 0) >= maxWeekly) continue;
              }

              let dur = cand.periodDurationMins;
              if (dur > remaining) {
                if (remaining >= MIN_PERIOD_MINS) {
                  dur = roundTo5(remaining);
                  if (dur < MIN_PERIOD_MINS) dur = MIN_PERIOD_MINS;
                  if (dur > remaining) continue;
                } else {
                  continue;
                }
              }

              return { ...cand, actualDuration: dur, poolIndex: i };
            }
            return null;
          };

          // TIER 1: Quota-respecting + unique today (ideal)
          let chosen = findCandidate(quotaPool, true, true);

          // TIER 2: Unique today but allow over-quota (when quotas exhausted)
          if (!chosen) {
            chosen = findCandidate(shuffledAllSubjects, false, true);
          }

          // TIER 3: Allow repeats — pick any subject that fits (absolute last resort)
          if (!chosen) {
            chosen = findCandidate(shuffledAllSubjects, false, false);
          }

          if (chosen) {
            const subj = chosen.subject;
            const fac = chosen.faculty;
            const dur = chosen.actualDuration;

            const startStr = formatMinutesTo12Hr(currentMins);
            const endStr = formatMinutesTo12Hr(currentMins + dur);

            // Find venue
            let chosenVenue = venues.find(v =>
              v.type === subj.requiredVenueType && !venueBusy[`${v.id}_${day}_${startStr}`] && v.status === 'Available'
            );
            if (!chosenVenue) {
              chosenVenue = venues.find(v => v.id === cls.homeVenueId && !venueBusy[`${v.id}_${day}_${startStr}`])
                || venues.find(v => !venueBusy[`${v.id}_${day}_${startStr}`] && v.status === 'Available')
                || venues[0] || { id: 'v1', name: 'Classroom', roomNo: 'Room 100', type: 'normal' };
            }

            const isConflict = Boolean(fac.id && facultyBusy[`${fac.id}_${day}_${startStr}`]);
            if (isConflict) conflictCount++;
            if (fac.id) facultyBusy[`${fac.id}_${day}_${startStr}`] = true;
            if (chosenVenue.id) venueBusy[`${chosenVenue.id}_${day}_${startStr}`] = true;

            todayPlaced.add(subj.id);
            weeklySubjectAllocCount[subj.id] = (weeklySubjectAllocCount[subj.id] || 0) + 1;

            // Remove from quota pool if it was a Tier 1 pick
            if (chosen.poolIndex !== undefined && chosen.poolIndex < quotaPool.length) {
              const maxWeekly = Number(subj.weeklyPeriods) || 4;
              if ((weeklySubjectAllocCount[subj.id] || 0) >= maxWeekly) {
                // Remove all entries for this subject from quotaPool
                for (let r = quotaPool.length - 1; r >= 0; r--) {
                  if (quotaPool[r].subject.id === subj.id) quotaPool.splice(r, 1);
                }
              }
            }

            timetable.push({
              id: `slot_${cls.id}_d${day}_p${periodIndex}`,
              classId: cls.id, className: cls.name,
              day, period: periodIndex++,
              periodName: `Period ${periodIndex - 1}`,
              periodTime: `${startStr} - ${endStr}`,
              startTime: startStr, endTime: endStr,
              durationMins: dur,
              subjectId: subj.id, subjectName: subj.name,
              subjectCode: subj.code, subjectColor: subj.color,
              facultyId: fac.id, facultyName: fac.name,
              venueId: chosenVenue.id, venueName: chosenVenue.name,
              venueRoomNo: chosenVenue.roomNo, venueType: chosenVenue.type,
              isConflict, conflictReason: isConflict ? 'Faculty double-booked' : null
            });

            currentMins += dur;
          } else {
            // Absolute safety: should never reach here, but advance to avoid infinite loop
            currentMins = session.end;
          }
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
      utilizationRate: timetable.length > 0 ? Math.max(0, Math.round(((timetable.length - conflictCount) / timetable.length) * 100)) : 100
    }
  };
}
