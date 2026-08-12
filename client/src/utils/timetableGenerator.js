/**
 * ═══════════════════════════════════════════════════════════
 *  BITSCHOOL TIMETABLE GENERATOR — CLEAN FROM SCRATCH
 * ═══════════════════════════════════════════════════════════
 *
 *  THREE INPUTS:
 *    1. Bell Schedule   → defines fixed day anchors (start, breaks, end)
 *    2. ECA Schedule    → grade+day specific ECA activities (FIXED, immovable)
 *    3. Master Courses  → academic subjects with weekly duration & period count
 *
 *  ALGORITHM (per class, per day):
 *    Step 1 → Physical Fitness at schoolStartTime (ALWAYS FIRST)
 *    Step 2 → Session A: physFitnessEnd → morningBreakStart  (academics)
 *    Step 3 → Morning Break  (FIXED)
 *    Step 4 → Session B: morningBreakEnd → lunchBreakStart   (academics)
 *    Step 5 → Lunch Break    (FIXED)
 *    Step 6 → ECA blocks: lunchBreakEnd → afternoonBreakStart (FIXED ECA, clamped)
 *    Step 7 → Session C: remaining post-ECA → afternoonBreakStart (academics if gap)
 *    Step 8 → Afternoon Break (FIXED)
 *    Step 9 → Session D: afternoonBreakEnd → schoolEndTime   (academics)
 *
 *  RULES:
 *    • No duplicate subject within a single day
 *    • Use EXACT per-period duration = weeklyDuration / weeklyPeriods
 *    • Last period in each session is stretched to meet the next anchor exactly
 *    • ECA blocks are never pushed past afternoonBreakStart
 * ═══════════════════════════════════════════════════════════
 */

import { DAYS } from './constants.js';

// ─── UTILITIES ───────────────────────────────────────────────────────────────

/** Convert '08:30 AM' / '14:30' style string → total minutes from midnight */
function parseTime(t) {
  if (!t) return 0;
  let s = String(t).trim().toUpperCase();
  let pm = s.includes('PM');
  let am = s.includes('AM');
  const clean = s.replace(/AM|PM/g, '').trim();
  const parts = clean.split(':').map(Number);
  let h = isNaN(parts[0]) ? 0 : parts[0];
  const m = isNaN(parts[1]) ? 0 : parts[1];

  // In a school timetable (07:00 AM - 07:00 PM), 12:xx AM is a mistyped 12:xx PM (noon/lunch time)
  if (h === 12 && am) {
    am = false;
    pm = true;
  }

  if (pm && h < 12) h += 12;
  if (am && h === 12) h = 0;
  return h * 60 + m;
}

function parseTimeRangeFromText(text) {
  if (!text) return { startTime: '', endTime: '', periodTime: '' };
  const str = String(text);
  const match = str.match(/(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)\s*[-–—]\s*(\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)?)/i);
  if (match) {
    const startTime = match[1].trim();
    const endTime = match[2].trim();
    return { startTime, endTime, periodTime: `${startTime} - ${endTime}` };
  }
  return { startTime: '', endTime: '', periodTime: '' };
}

/** Convert total minutes → '08:30 AM' format */
function fmt(total) {
  const t = ((total % 1440) + 1440) % 1440;
  let h = Math.floor(t / 60);
  const m = t % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

/** Round to nearest 5 minutes */
function r5(n) { return Math.round(n / 5) * 5; }

/**
 * Parse duration string → minutes.
 * Handles: '05:30', '5:30', '5.5 hours', '45 mins', '1 hour 30 mins', '330', etc.
 */
export function parseWeeklyDurationToMins(text) {
  if (!text) return null;
  const raw = String(text).trim().toLowerCase();
  if (!raw || ['no', 'nan', 'none', ''].includes(raw)) return null;

  // Format: HH:MM (e.g. '05:30', '5:30', '06:00')
  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  // Format: Decimal hours (e.g. '5.5', '5.5 hours', '5.5 hrs')
  const decimalMatch = raw.match(/^(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr)?$/);
  if (decimalMatch && (raw.includes('.') || raw.includes('hour') || raw.includes('hr'))) {
    const hours = parseFloat(decimalMatch[1]);
    if (!isNaN(hours) && hours > 0) {
      return Math.round(hours * 60);
    }
  }

  // Format: '5 hours 30 mins' or '5 hr 30 m'
  let hours = 0;
  let mins = 0;
  if (raw.includes('hour') || raw.includes('hr')) {
    const hm = raw.match(/(\d+(?:\.\d+)?)\s*(?:hour|hrs|hr)/);
    if (hm) hours = parseFloat(hm[1]);
    const rest = raw.split(/hour|hrs|hr/)[1] || '';
    const mm = rest.match(/(\d+)/);
    if (mm) mins = parseInt(mm[1], 10);
  } else if (raw.includes('min') || raw.includes('m')) {
    const mm = raw.match(/(\d+)/);
    if (mm) mins = parseInt(mm[1], 10);
  } else {
    // Pure number string e.g. '330' or '6'
    const num = parseFloat(raw);
    if (!isNaN(num) && num > 0) {
      return num <= 12 ? Math.round(num * 60) : Math.round(num);
    }
  }

  const total = Math.round(hours * 60) + mins;
  return total > 0 ? total : null;
}

function parseDur(text) {
  return parseWeeklyDurationToMins(text);
}

/** Seeded Fisher-Yates shuffle for deterministic day-to-day variety */
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = seed >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── GRADE EXTRACTOR ─────────────────────────────────────────────────────────

function getGrade(cls) {
  if (!cls) return '';
  if (cls.gradeName != null) return String(cls.gradeName).replace(/grade\s*/i, '').trim();
  if (cls.gradeId   != null) return String(cls.gradeId).replace(/grade\s*/i, '').trim();
  if (cls.grade     != null) {
    if (typeof cls.grade === 'object') {
      return String(cls.grade.name || cls.grade.id || '').replace(/grade\s*/i, '').trim();
    }
    return String(cls.grade).replace(/grade\s*/i, '').trim();
  }
  if (cls.name) {
    const m = String(cls.name).match(/(\d+)/);
    if (m) return m[1];
  }
  return '';
}

// ─── ECA MAP LOOKUP ───────────────────────────────────────────────────────────

/** Fetch ECA map for a specific grade and day (grade-specific, no cross-grade contamination) */
function getEcaMap(ecaSchedule, grade, day) {
  if (!ecaSchedule || typeof ecaSchedule !== 'object') return {};
  const du  = String(day).toUpperCase();
  const g   = String(grade || '').replace(/\D/g, '');
  const rawG = String(grade || '');

  // Try most-specific keys first
  const keys = [
    `${g}_${du}`, `Grade ${g}_${du}`, `Grade_${g}_${du}`,
    `${rawG}_${du}`, `${g}_${day}`, `Grade ${g}_${day}`, `${rawG}_${day}`
  ];
  for (const k of keys) {
    if (ecaSchedule[k] && Object.keys(ecaSchedule[k]).length) return ecaSchedule[k];
  }

  // Case-insensitive fallback (must match both grade and day)
  const found = Object.keys(ecaSchedule).find(k => {
    const ku = k.toUpperCase();
    return ku.includes(du) && (ku.includes(g) || ku.includes(rawG.toUpperCase()));
  });
  return found ? (ecaSchedule[found] || {}) : {};
}

// ─── SUBJECT DURATION CALCULATOR ─────────────────────────────────────────────

/**
 * Per-period duration = weeklyDuration / weeklyPeriods, rounded to 5 mins.
 * weeklyDuration is stored as 'HH:MM' (e.g. '06:00' = 360 mins, '05:30' = 330 mins).
 */
export function getSubjectPeriodDurationMins(subj) {
  const periods = Math.max(1, Number(subj.weeklyPeriods) || 6);
  let totalMins = 360; // default 6 hours / week
  if (subj.weeklyDuration) {
    const parsed = parseWeeklyDurationToMins(subj.weeklyDuration);
    if (parsed && parsed > 0) totalMins = parsed;
  }
  return Math.max(5, r5(totalMins / periods));
}

// ─── DYNAMIC PERIODS (used by Bell Schedule display) ─────────────────────────

export function calculateDynamicPeriodsFromBellConfig(cfg = {}) {
  const sS  = parseTime(cfg.schoolStartTime    || '08:30 AM');
  const mb1 = parseTime(cfg.morningBreakStart  || '10:00 AM');
  const mb2 = parseTime(cfg.morningBreakEnd    || '10:15 AM');
  const lb1 = parseTime(cfg.lunchBreakStart    || '11:45 AM');
  const lb2 = parseTime(cfg.lunchBreakEnd      || '12:30 PM');
  const ab1 = parseTime(cfg.afternoonBreakStart|| '02:00 PM');
  const ab2 = parseTime(cfg.afternoonBreakEnd  || '02:15 PM');
  const sE  = parseTime(cfg.schoolEndTime      || '03:45 PM');

  const periods = [];
  let id = 1;

  function addSession(start, end, isFirst) {
    if (end <= start) return;
    let cur = start;
    if (isFirst) {
      const pf = Math.min(15, end - start - 5);
      if (pf > 0) {
        periods.push({ id: id++, name: 'Physical Fitness', startTime: fmt(cur), endTime: fmt(cur + pf), time: `${fmt(cur)} - ${fmt(cur + pf)}` });
        cur += pf;
      }
    }
    const rem = end - cur;
    if (rem <= 0) return;
    const n = rem >= 60 ? 2 : 1;
    const d = r5(rem / n);
    for (let i = 0; i < n; i++) {
      const e = (i === n - 1) ? end : cur + d;
      periods.push({ id: id++, name: `Period ${id - 1}`, startTime: fmt(cur), endTime: fmt(e), time: `${fmt(cur)} - ${fmt(e)}` });
      cur = e;
    }
  }

  addSession(sS, mb1, true);
  addSession(mb2, lb1, false);
  addSession(lb2, ab1, false);
  addSession(ab2, sE, false);
  return periods;
}

// ─── INTERVAL CONFLICT CHECKER ───────────────────────────────────────────────

/**
 * Check if two time intervals [startA, endA] and [startB, endB] overlap.
 */
function isTimeOverlap(startA, endA, startB, endB) {
  return Math.max(startA, startB) < Math.min(endA, endB);
}

/**
 * Check if a faculty is busy during [startMins, endMins] on a specific day.
 */
function isFacultyBusyInInterval(facId, day, startMins, endMins, facultyBusyMap) {
  if (!facId) return false;
  const key = `${facId}_${day}`;
  const intervals = facultyBusyMap[key];
  if (!Array.isArray(intervals) || !intervals.length) return false;
  return intervals.some(inv => isTimeOverlap(startMins, endMins, inv.start, inv.end));
}

/**
 * Register a busy time interval for a faculty on a specific day.
 */
function recordFacultyBusyInterval(facId, day, startMins, endMins, facultyBusyMap) {
  if (!facId) return;
  const key = `${facId}_${day}`;
  if (!facultyBusyMap[key]) facultyBusyMap[key] = [];
  facultyBusyMap[key].push({ start: startMins, end: endMins });
}

/**
 * Check if a venue is busy during [startMins, endMins] on a specific day.
 */
function isVenueBusyInInterval(venueId, day, startMins, endMins, venueBusyMap) {
  if (!venueId) return false;
  const key = `${venueId}_${day}`;
  const intervals = venueBusyMap[key];
  if (!Array.isArray(intervals) || !intervals.length) return false;
  return intervals.some(inv => isTimeOverlap(startMins, endMins, inv.start, inv.end));
}

/**
 * Register a busy time interval for a venue on a specific day.
 */
function recordVenueBusyInterval(venueId, day, startMins, endMins, venueBusyMap) {
  if (!venueId) return;
  const key = `${venueId}_${day}`;
  if (!venueBusyMap[key]) venueBusyMap[key] = [];
  venueBusyMap[key].push({ start: startMins, end: endMins });
}

// ─── FACULTY MATCHER ─────────────────────────────────────────────────────────

export function findBestFacultyForSubject(subj, grade, faculties = [], day = '', startMins = 0, endMins = 0, facultyBusyMap = {}) {
  if (!subj) return { id: null, name: '' };
  const gNum = String(grade || '').replace(/\D/g, '');

  const teachesSubject = (f) => {
    if (!f) return false;
    if (f.primarySubjectId && String(f.primarySubjectId) === String(subj.id)) return true;
    if (Array.isArray(f.secondarySubjectIds) && f.secondarySubjectIds.map(String).includes(String(subj.id))) return true;
    const sn = String(subj.name || '').toLowerCase().trim();
    const sc = String(subj.code || '').toLowerCase().trim();
    const fs = String(f.primarySubjectName || f.specialization || f.subject || f.subjectName || '').toLowerCase().trim();
    if (fs && (fs === sn || fs === sc || fs.includes(sn) || sn.includes(fs))) return true;
    return false;
  };

  const teachesGrade = (f) => {
    if (!f) return false;
    if (Array.isArray(f.grades) && f.grades.length > 0) {
      return f.grades.some(g => {
        const gn = String(typeof g === 'object' ? (g.id || g.name) : g).replace(/\D/g, '');
        return gn === gNum || String(g).toLowerCase() === 'all' || String(g).toLowerCase() === `grade ${gNum}`;
      });
    }
    return false;
  };

  const available = (f) => {
    if (!f || !f.id) return true;
    return !isFacultyBusyInInterval(f.id, day, startMins, endMins, facultyBusyMap);
  };

  // ONLY return a faculty if they teach subject AND teach grade AND ARE AVAILABLE (not busy in any class)
  const match = faculties.find(f => teachesSubject(f) && teachesGrade(f) && available(f));
  if (match) return match;

  // STRICT CONSTRAINT: Never return a busy faculty to prevent faculty clashes!
  return { id: null, name: '' };
}

// ─── SESSION FILLER ───────────────────────────────────────────────────────────

function selectBestCandidateForSlot(trackerMap, grade, faculties, day, startMins, endMins, facultyBusyMap, lastPlacedRef) {
  const candidates = Array.from(trackerMap.values());
  if (!candidates.length) return null;

  const dayUpper = String(day).toUpperCase();
  const lastPlacedId = lastPlacedRef ? lastPlacedRef.subjectId : null;

  const evaluated = candidates.map(item => {
    // Has subject reached its target weekly duration?
    // Strict minute check: Quota is satisfied ONLY when allocatedMins >= targetMins - 2.
    // (Does NOT truncate prematurely based on period count!)
    const isQuotaSatisfied = item.allocatedMins >= Math.max(5, item.targetMins - 2);

    // Is subject explicitly restricted to a specific day?
    const targetDay = String(item.data.day || item.data.assignedDay || item.data.preferredDay || '').toUpperCase();
    const isDayMismatch = Boolean(targetDay && targetDay !== 'ALL' && targetDay !== dayUpper);

    // Has subject been placed today?
    const usedTodayCount = item.dailyCount[dayUpper] || 0;
    const usedToday = usedTodayCount > 0;

    // Would placing this subject create a back-to-back duplicate in adjacent slots?
    const isAdjacentDuplicate = lastPlacedId != null && String(item.id) === String(lastPlacedId);

    // Is faculty available for this slot?
    const fac = findBestFacultyForSubject(item.data, grade, faculties, day, startMins, endMins, facultyBusyMap);
    const hasAvailableFaculty = Boolean(fac && fac.id);

    // Calculate Tier (1 is highest priority, 8 is lowest)
    let tier = 8;
    if (!isQuotaSatisfied && !isDayMismatch && !usedToday && !isAdjacentDuplicate && hasAvailableFaculty) {
      tier = 1;
    } else if (!isQuotaSatisfied && !isDayMismatch && !usedToday && !isAdjacentDuplicate) {
      tier = 2;
    } else if (!isQuotaSatisfied && !isDayMismatch && !isAdjacentDuplicate && hasAvailableFaculty) {
      tier = 3;
    } else if (!isQuotaSatisfied && !isDayMismatch && !isAdjacentDuplicate) {
      tier = 4;
    } else if (isQuotaSatisfied && !isDayMismatch && !usedToday && !isAdjacentDuplicate && hasAvailableFaculty) {
      tier = 5;
    } else if (isQuotaSatisfied && !isDayMismatch && !isAdjacentDuplicate && hasAvailableFaculty) {
      tier = 6;
    } else if (!isAdjacentDuplicate) {
      tier = 7;
    } else {
      tier = 8;
    }

    const remainingMins = item.targetMins - item.allocatedMins;
    const remainingRatio = item.targetMins > 0 ? remainingMins / item.targetMins : 0;

    return {
      item,
      tier,
      usedTodayCount,
      remainingRatio,
      remainingMins,
      allocatedMins: item.allocatedMins,
      fac
    };
  });

  evaluated.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    if (Math.abs(b.remainingRatio - a.remainingRatio) > 0.01) return b.remainingRatio - a.remainingRatio;
    if (a.usedTodayCount !== b.usedTodayCount) return a.usedTodayCount - b.usedTodayCount;
    return a.allocatedMins - b.allocatedMins;
  });

  return evaluated[0] ? evaluated[0].item : null;
}

function fillSession(sessionStart, sessionEnd, trackerMap, grade = '', faculties = [], day = '', facultyBusyMap = {}, configuredSlots = [], lastPlacedRef = { subjectId: null }) {
  const blocks = [];
  const totalDuration = sessionEnd - sessionStart;
  if (totalDuration <= 0 || !trackerMap || trackerMap.size === 0) return blocks;

  let cursor = sessionStart;
  const dayUpper = String(day).toUpperCase();

  // Filter configured timeSlots that fall strictly within [sessionStart, sessionEnd]
  const periodSlots = (configuredSlots || []).filter(s =>
    (s.type === 'period' || !s.type) &&
    s.startMins >= sessionStart &&
    s.endMins <= sessionEnd &&
    s.endMins > s.startMins
  ).sort((a, b) => a.startMins - b.startMins);

  if (periodSlots.length > 0) {
    for (const slot of periodSlots) {
      if (slot.startMins < cursor) continue;

      // Fill any gap before this configured slot
      while (slot.startMins > cursor) {
        const gapDur = slot.startMins - cursor;
        if (gapDur < 5) {
          cursor = slot.startMins;
          break;
        }
        const chosenGap = selectBestCandidateForSlot(trackerMap, grade, faculties, day, cursor, slot.startMins, facultyBusyMap, lastPlacedRef);
        if (!chosenGap) {
          cursor = slot.startMins;
          break;
        }
        const gapNeeded = chosenGap.targetMins - chosenGap.allocatedMins;
        let assignGapDur = gapDur;
        if (gapNeeded > 0 && gapNeeded < gapDur) {
          assignGapDur = gapNeeded;
        }
        const gapEnd = cursor + assignGapDur;
        blocks.push({
          kind: 'ACADEMIC',
          subjectId: chosenGap.id,
          name: chosenGap.name,
          subjectCode: chosenGap.code,
          subjectColor: chosenGap.color,
          duration: assignGapDur,
          startMins: cursor,
          endMins: gapEnd,
          start: fmt(cursor),
          end: fmt(gapEnd),
          subject: chosenGap.data
        });
        chosenGap.allocatedMins += assignGapDur;
        chosenGap.allocatedPeriods += 1;
        chosenGap.dailyCount[dayUpper] = (chosenGap.dailyCount[dayUpper] || 0) + 1;
        if (lastPlacedRef) lastPlacedRef.subjectId = chosenGap.id;
        cursor = gapEnd;
      }

      // Fill configured slot [cursor, slot.endMins]
      while (slot.endMins > cursor) {
        const slotAvail = slot.endMins - cursor;
        if (slotAvail < 5) {
          cursor = slot.endMins;
          break;
        }
        const chosenSubj = selectBestCandidateForSlot(trackerMap, grade, faculties, day, cursor, slot.endMins, facultyBusyMap, lastPlacedRef);
        if (!chosenSubj) {
          cursor = slot.endMins;
          break;
        }
        const needed = chosenSubj.targetMins - chosenSubj.allocatedMins;
        let dur = slotAvail;
        if (needed > 0 && needed < slotAvail) {
          dur = needed;
        }

        const bEnd = cursor + dur;
        blocks.push({
          kind: 'ACADEMIC',
          subjectId: chosenSubj.id,
          name: chosenSubj.name,
          subjectCode: chosenSubj.code,
          subjectColor: chosenSubj.color,
          duration: dur,
          startMins: cursor,
          endMins: bEnd,
          start: fmt(cursor),
          end: fmt(bEnd),
          subject: chosenSubj.data
        });
        chosenSubj.allocatedMins += dur;
        chosenSubj.allocatedPeriods += 1;
        chosenSubj.dailyCount[dayUpper] = (chosenSubj.dailyCount[dayUpper] || 0) + 1;
        if (lastPlacedRef) lastPlacedRef.subjectId = chosenSubj.id;
        cursor = bEnd;
      }
    }

    // Trailing session gap after configured slots up to sessionEnd
    while (sessionEnd > cursor && sessionEnd - cursor >= 5) {
      const remDur = sessionEnd - cursor;
      const chosenRem = selectBestCandidateForSlot(trackerMap, grade, faculties, day, cursor, sessionEnd, facultyBusyMap, lastPlacedRef);
      if (!chosenRem) break;

      const needed = chosenRem.targetMins - chosenRem.allocatedMins;
      let durToAssign = remDur;
      if (needed > 0 && needed < remDur) {
        durToAssign = needed;
      }

      const rEnd = cursor + durToAssign;
      blocks.push({
        kind: 'ACADEMIC',
        subjectId: chosenRem.id,
        name: chosenRem.name,
        subjectCode: chosenRem.code,
        subjectColor: chosenRem.color,
        duration: durToAssign,
        startMins: cursor,
        endMins: rEnd,
        start: fmt(cursor),
        end: fmt(rEnd),
        subject: chosenRem.data
      });
      chosenRem.allocatedMins += durToAssign;
      chosenRem.allocatedPeriods += 1;
      chosenRem.dailyCount[dayUpper] = (chosenRem.dailyCount[dayUpper] || 0) + 1;
      if (lastPlacedRef) lastPlacedRef.subjectId = chosenRem.id;
      cursor = rEnd;
    }
    return blocks;
  }

  // Fallback: standard dynamic fill if no configured timeSlots exist in this interval
  let remaining = totalDuration;
  let attemptCount = 0;
  const maxAttempts = 30;

  while (remaining > 0 && attemptCount < maxAttempts) {
    attemptCount++;
    const chosenSubj = selectBestCandidateForSlot(trackerMap, grade, faculties, day, cursor, cursor + 45, facultyBusyMap, lastPlacedRef);
    if (!chosenSubj) break;

    const needed = chosenSubj.targetMins - chosenSubj.allocatedMins;
    let blockDur = Math.min(chosenSubj.duration || 45, remaining);

    // Strict clamping: never let blockDur exceed remaining needed target minutes
    if (needed > 0 && needed < blockDur) {
      blockDur = needed;
    }

    if (blockDur <= 0) break;

    blocks.push({
      kind: 'ACADEMIC',
      subjectId: chosenSubj.id,
      name: chosenSubj.name,
      subjectCode: chosenSubj.code,
      subjectColor: chosenSubj.color,
      duration: blockDur,
      startMins: cursor,
      endMins: cursor + blockDur,
      start: fmt(cursor),
      end: fmt(cursor + blockDur),
      subject: chosenSubj.data
    });

    chosenSubj.allocatedMins += blockDur;
    chosenSubj.allocatedPeriods += 1;
    chosenSubj.dailyCount[dayUpper] = (chosenSubj.dailyCount[dayUpper] || 0) + 1;
    if (lastPlacedRef) lastPlacedRef.subjectId = chosenSubj.id;
    cursor += blockDur;
    remaining -= blockDur;
  }

  return blocks;
}

// ─── MAIN GENERATOR ───────────────────────────────────────────────────────────

/**
 * Generate the full master timetable.
 *
 * @param {Object} params
 * @param {Array}  params.faculties
 * @param {Array}  params.venues
 * @param {Array}  params.classes
 * @param {Array}  params.subjects
 * @param {Object} params.ecaSchedule
 * @param {Object} params.bellConfig
 * @param {string} params.targetClassId  ('all' or specific class id)
 * @param {string} params.targetGrade    ('all' or grade number string)
 * @param {Array}  params.existingTimetable
 */
export function generateAutoTimetable(params) {
  const {
    faculties       = [],
    venues          = [],
    classes         = [],
    subjects        = [],
    ecaSchedule     = {},
    bellConfig      = {},
    timeSlots       = [],
    targetClassId   = 'all',
    targetGrade     = 'all',
    existingTimetable = []
  } = params;

  // Parse timeSlots into configuredTimeSlots array
  const configuredTimeSlots = (timeSlots || []).map(s => {
    const startMins = parseTime(s.startTime);
    const endMins = parseTime(s.endTime);
    return {
      slotNo: s.slotNo,
      name: s.name,
      type: s.type || 'period',
      startMins,
      endMins: endMins > startMins ? endMins : startMins + 45
    };
  }).filter(s => s.startMins > 0 && s.endMins > s.startMins);

  // ── Parse bell times (all in minutes from midnight) ──
  const sStartM = parseTime(bellConfig.schoolStartTime    || '08:30 AM');
  const mBsM    = parseTime(bellConfig.morningBreakStart  || '10:00 AM');
  const mBeM    = parseTime(bellConfig.morningBreakEnd    || '10:15 AM');
  const lBsM    = parseTime(bellConfig.lunchBreakStart    || '11:45 AM');
  const lBeM    = parseTime(bellConfig.lunchBreakEnd      || '12:30 PM');
  const aBsM    = parseTime(bellConfig.afternoonBreakStart|| '02:00 PM');
  const aBeM    = parseTime(bellConfig.afternoonBreakEnd  || '02:15 PM');
  const sEndM   = parseTime(bellConfig.schoolEndTime      || '03:45 PM');

  const timetable      = [];
  const facultyBusyMap = {};
  const venueBusyMap   = {};
  let   conflicts      = 0;

  // ── Determine which classes to process ──
  let toProcess = classes;
  if (targetClassId && String(targetClassId).toLowerCase() !== 'all') {
    toProcess = classes.filter(c => String(c.id) === String(targetClassId));
  } else if (targetGrade && String(targetGrade).toLowerCase() !== 'all') {
    const tg = String(targetGrade).replace(/grade\s*/i, '').trim();
    toProcess = classes.filter(c => getGrade(c) === tg);
  }

  // Preserve slots from classes NOT being regenerated & record their busy intervals
  const preserved = existingTimetable.filter(t => !toProcess.some(c => String(c.id) === String(t.classId)));
  preserved.forEach(s => {
    const sStart = s.startMins != null ? s.startMins : parseTime(s.startTime);
    const sEnd   = s.endMins   != null ? s.endMins   : (sStart + (s.durationMins || 45));
    if (s.facultyId) recordFacultyBusyInterval(s.facultyId, s.day, sStart, sEnd, facultyBusyMap);
    if (s.venueId)   recordVenueBusyInterval(s.venueId, s.day, sStart, sEnd, venueBusyMap);
    timetable.push(s);
  });

  // ── Process each class ──
  toProcess.forEach(cls => {
    const grade = getGrade(cls);

    // Resolve home classroom venue
    const homeVenue =
      venues.find(v => String(v.id) === String(cls.homeVenueId)) ||
      venues.find(v => cls.homeVenueRoomNo && String(v.roomNo).trim() === String(cls.homeVenueRoomNo).trim()) ||
      venues.find(v => v.type === 'normal' || !v.type) ||
      venues[0] ||
      { id: null, name: `${cls.name} Room`, roomNo: '101', type: 'normal' };

    // Subjects for this grade
    const gradeSubjects = subjects.filter(s => {
      if (!s.grade || String(s.grade).toLowerCase() === 'all') return true;
      return String(s.grade).replace(/grade\s*/i, '').trim() === grade;
    });
    const activeSubjects = gradeSubjects.length > 0 ? gradeSubjects : subjects;

    // Build weekly trackerMap per class across ALL days (Mon - Sat)
    const trackerMap = new Map();
    activeSubjects.forEach(s => {
      let targetMins = parseWeeklyDurationToMins(s.weeklyDuration);
      if (!targetMins || targetMins <= 0) {
        const pCount = Math.max(1, Number(s.weeklyPeriods) || 6);
        targetMins = pCount * 45;
      }
      const targetPeriods = Math.max(1, Number(s.weeklyPeriods) || Math.round(targetMins / 45) || 6);

      trackerMap.set(String(s.id), {
        id: s.id,
        name: s.name,
        code: s.code || '',
        color: s.color || '#2563eb',
        duration: getSubjectPeriodDurationMins(s),
        data: s,
        targetMins,
        targetPeriods,
        allocatedMins: 0,
        allocatedPeriods: 0,
        dailyCount: {}
      });
    });

    // Helper: convert a placed block → timetable slot object
    let periodCounter = 0;
    const toSlot = (block, cls, day, fac, venue) => ({
      id:           `slot_${cls.id}_${day}_${++periodCounter}`,
      classId:      cls.id,
      className:    cls.name,
      day,
      period:       periodCounter,
      periodName:   block.kind === 'BREAK' || block.kind === 'LUNCH'
                    ? block.name
                    : `Period ${periodCounter}`,
      periodTime:   `${block.start} - ${block.end}`,
      startTime:    block.start,
      endTime:      block.end,
      startMins:    block.startMins,
      endMins:      block.endMins,
      durationMins: block.duration,
      subjectId:    block.subjectId   || null,
      subjectName:  block.name,
      subjectCode:  block.subjectCode || '',
      subjectColor: block.subjectColor|| '#2563eb',
      facultyId:    fac ? fac.id   : null,
      facultyName:  fac ? fac.name : '',
      venueId:      venue ? venue.id      : null,
      venueName:    venue ? venue.name    : '',
      venueRoomNo:  venue ? venue.roomNo  : '',
      venueType:    block.venueType || (venue ? venue.type : 'normal'),
      isConflict:   false,
      conflictReason: null,
      ecaTag:       block.ecaTag || null,
      blockKind:    block.kind
    });

    // ── Process each day ──
    DAYS.forEach((day, dayIndex) => {
      periodCounter = 0; // reset per day
      const lastPlacedRef = { subjectId: null };
      const ecaMap = getEcaMap(ecaSchedule, grade, day);

      // ── Determine Physical Fitness duration ──
      let pfDur = 15; // default 15 mins
      const pfKey = Object.keys(ecaMap).find(k =>
        k.toLowerCase().includes('physical fitness') || k.toLowerCase().includes('fitness')
      );
      if (pfKey && ecaMap[pfKey]) {
        const parsed = parseDur(ecaMap[pfKey].duration);
        if (parsed && parsed > 0) pfDur = parsed;
      }
      pfDur = Math.max(5, Math.min(pfDur, (mBsM > sStartM ? mBsM - sStartM - 5 : 30)));

      // ── 1. COLLECT ALL FIXED ANCHOR BLOCKS FIRST (Physical Fitness + Breaks + DB ECA Activities) ──
      const rawAnchors = [];

      // A. Physical Fitness (always start of school day)
      const pfStart = sStartM;
      const pfEnd   = sStartM + pfDur;
      rawAnchors.push({
        kind: 'ANCHOR',
        name: 'Physical Fitness',
        subjectId: 'sub_physical_fitness',
        subjectCode: 'FITNESS',
        subjectColor: '#059669',
        venueType: 'sports',
        duration: pfDur,
        start: fmt(pfStart),
        end:   fmt(pfEnd),
        startMins: pfStart,
        endMins:   pfEnd,
        ecaTag: null
      });

      // B. Morning Break (fixed)
      if (mBeM > mBsM) {
        rawAnchors.push({
          kind: 'BREAK',
          name: 'Morning Break',
          subjectId: 'break_morning',
          subjectCode: 'BREAK',
          subjectColor: '#f59e0b',
          venueType: 'break',
          duration: mBeM - mBsM,
          start: fmt(mBsM), end: fmt(mBeM),
          startMins: mBsM, endMins: mBeM, ecaTag: 'Morning Break'
        });
      }

      // C. Lunch Break (fixed)
      if (lBeM > lBsM) {
        rawAnchors.push({
          kind: 'LUNCH',
          name: 'Lunch Break',
          subjectId: 'break_lunch',
          subjectCode: 'LUNCH',
          subjectColor: '#ef4444',
          venueType: 'lunch',
          duration: lBeM - lBsM,
          start: fmt(lBsM), end: fmt(lBeM),
          startMins: lBsM, endMins: lBeM, ecaTag: 'Lunch Break'
        });
      }

      // D. Afternoon Break (fixed)
      if (aBeM > aBsM) {
        rawAnchors.push({
          kind: 'BREAK',
          name: 'Afternoon Break',
          subjectId: 'break_afternoon',
          subjectCode: 'BREAK',
          subjectColor: '#f59e0b',
          venueType: 'break',
          duration: aBeM - aBsM,
          start: fmt(aBsM), end: fmt(aBeM),
          startMins: aBsM, endMins: aBeM, ecaTag: 'Afternoon Break'
        });
      }

      // E. All Active ECA Activities from Database (placed at exact DB startTime & endTime)
      let defaultEcaCursor = lBeM; // Default post-lunch fallback if no explicit timing
      const ecaEntries = Object.entries(ecaMap);

      ecaEntries.forEach(([vertName, vertData]) => {
        // Skip Physical Fitness — handled as block #1
        if (vertName.toLowerCase().includes('fitness') || vertName.toLowerCase().includes('physical fitness')) return;

        const isActive = vertData && (
          vertData.active === true ||
          (vertData.label && vertData.label !== 'No' && !String(vertData.label).startsWith('No'))
        );
        if (!isActive) return;

        let bStart = defaultEcaCursor;
        let bEnd = defaultEcaCursor + 30;

        // Priority 1: Use explicit startTime & endTime fields from DB
        if (vertData.startTime && vertData.endTime) {
          const parsedS = parseTime(vertData.startTime);
          const parsedE = parseTime(vertData.endTime);
          if (parsedS > 0 && parsedE > parsedS) {
            bStart = parsedS;
            bEnd = parsedE;
          }
        // Priority 2: Parse from periodTime field
        } else if (vertData.periodTime) {
          const parsedRange = parseTimeRangeFromText(vertData.periodTime);
          if (parsedRange.startTime && parsedRange.endTime) {
            const parsedS = parseTime(parsedRange.startTime);
            const parsedE = parseTime(parsedRange.endTime);
            if (parsedS > 0 && parsedE > parsedS) {
              bStart = parsedS;
              bEnd = parsedE;
            }
          }
        // Priority 3: Parse time range from the label field (e.g. "Yes (9:45AM - 10:45AM)")
        } else if (vertData.label) {
          const parsedRange = parseTimeRangeFromText(vertData.label);
          if (parsedRange.startTime && parsedRange.endTime) {
            const parsedS = parseTime(parsedRange.startTime);
            const parsedE = parseTime(parsedRange.endTime);
            if (parsedS > 0 && parsedE > parsedS) {
              bStart = parsedS;
              bEnd = parsedE;
            }
          }
        }

        // Sanity check: if parsed time range implies an unreasonable duration (> 3 hours for ECA),
        // but we have a known duration field, use startTime + duration instead.
        // This catches AM/PM typos like "9:45AM - 10:45PM" when duration says "1 hour".
        if (bStart !== defaultEcaCursor && (bEnd - bStart) > 180 && vertData.duration) {
          const knownDur = parseDur(vertData.duration);
          if (knownDur && knownDur > 0 && knownDur <= 180) {
            bEnd = bStart + knownDur;
          }
        }

        // Final fallback: use duration to calculate end time from cursor
        if (bStart === defaultEcaCursor && bEnd === defaultEcaCursor + 30) {
          let dur = parseDur(vertData.duration) || 30;
          dur = Math.max(5, r5(dur));
          bEnd = bStart + dur;
          defaultEcaCursor = bEnd;
        }

        const durMins = bEnd - bStart;
        const target = vertData.target || 'All';
        const displayName = (target && target !== 'All') ? `${vertName} (${target})` : vertName;

        rawAnchors.push({
          kind: 'ECA_ANCHOR',
          name: displayName,
          subjectId: `eca_${vertName.toLowerCase().replace(/\s+/g, '_')}`,
          subjectCode: 'ECA',
          subjectColor: vertData.color || '#d97706',
          venueType: 'eca',
          duration: durMins,
          start: fmt(bStart),
          end: fmt(bEnd),
          startMins: bStart,
          endMins: bEnd,
          ecaTag: displayName
        });
      });

      // ── STRICT OVERLAP RESOLUTION ──
      // Sort raw anchors chronologically
      rawAnchors.sort((a, b) => a.startMins - b.startMins || a.endMins - b.endMins);

      // Step 1: Merge ECA blocks that occupy the same time range (parallel activities)
      const mergedAnchors = [];
      rawAnchors.forEach(anchor => {
        if (anchor.kind === 'ECA_ANCHOR' && mergedAnchors.length > 0) {
          const prev = mergedAnchors[mergedAnchors.length - 1];
          if (prev.kind === 'ECA_ANCHOR' && prev.startMins === anchor.startMins && prev.endMins === anchor.endMins) {
            // Same time slot — merge names (e.g. "Classical Dance (Girls) / Table Tennis (Boys)")
            prev.name = `${prev.name} / ${anchor.name}`;
            prev.ecaTag = prev.name;
            return;
          }
        }
        mergedAnchors.push(anchor);
      });

      // Step 2: Resolve remaining overlaps
      const resolvedAnchors = [];
      let lastEnd = sStartM;

      mergedAnchors.forEach((anchor) => {
        let aStart = anchor.startMins;
        let aEnd = anchor.endMins;

        // If this anchor overlaps with the previous resolved anchor
        if (aStart < lastEnd) {
          if (anchor.kind === 'BREAK' || anchor.kind === 'LUNCH') {
            // Check if a fixed ECA spans across this break — if so, skip the break
            const prev = resolvedAnchors.length > 0 ? resolvedAnchors[resolvedAnchors.length - 1] : null;
            if (prev && prev.kind === 'ECA_ANCHOR' && prev.endMins > aEnd) {
              // ECA completely covers the break — skip this break entirely
              return;
            }
            // Otherwise, truncate the preceding ECA to end at break start
            if (prev && prev.kind === 'ECA_ANCHOR' && prev.endMins > aStart) {
              prev.endMins = aStart;
              prev.duration = prev.endMins - prev.startMins;
              prev.end = fmt(prev.endMins);
              if (prev.duration <= 0) resolvedAnchors.pop();
            }
          } else if (anchor.kind === 'ECA_ANCHOR') {
            // Two different ECA activities overlap — place sequentially
            const dur = aEnd - aStart;
            aStart = lastEnd;
            aEnd = aStart + dur;
          } else {
            // Other anchor overlap — shift start
            aStart = lastEnd;
            if (aEnd <= aStart) return;
          }
        }

        // Keep anchor if it fits before school ends and has positive duration
        if (aStart < sEndM && aEnd > aStart) {
          anchor.startMins = aStart;
          anchor.endMins = Math.min(aEnd, sEndM);
          anchor.duration = anchor.endMins - anchor.startMins;
          anchor.start = fmt(anchor.startMins);
          anchor.end = fmt(anchor.endMins);
          resolvedAnchors.push(anchor);
          lastEnd = anchor.endMins;
        }
      });

      // ── 2. FILL ALL REMAINING GAPS ON THE TIMELINE WITH ACADEMIC SUBJECTS ──
      const dayBlocks = [];
      let timelineCursor = sStartM;

      resolvedAnchors.forEach(anchor => {
        if (anchor.startMins > timelineCursor) {
          const academicBlocks = fillSession(timelineCursor, anchor.startMins, trackerMap, grade, faculties, day, facultyBusyMap, configuredTimeSlots, lastPlacedRef);
          dayBlocks.push(...academicBlocks);
        }
        dayBlocks.push(anchor);
        timelineCursor = anchor.endMins;
      });

      if (sEndM > timelineCursor) {
        const finalAcademics = fillSession(timelineCursor, sEndM, trackerMap, grade, faculties, day, facultyBusyMap, configuredTimeSlots, lastPlacedRef);
        dayBlocks.push(...finalAcademics);
      }

      // Sort final dayBlocks strictly by startMins for clean period sequence
      dayBlocks.sort((a, b) => a.startMins - b.startMins);

      // ── Convert blocks → timetable slot records ──
      dayBlocks.forEach(block => {
        let fac   = { id: null, name: '' };
        let venue = homeVenue;

        if (block.kind === 'ACADEMIC' && block.subject) {
          fac = findBestFacultyForSubject(block.subject, grade, faculties, day, block.startMins, block.endMins, facultyBusyMap);

          // Special venue if subject requires it
          if (block.subject.requiredVenueType && block.subject.requiredVenueType !== 'normal') {
            const sv = venues.find(v =>
              v.type === block.subject.requiredVenueType &&
              !isVenueBusyInInterval(v.id, day, block.startMins, block.endMins, venueBusyMap)
            );
            if (sv) venue = sv;
          }

          // Check if faculty is double-booked across ANY class or grade
          const isC = Boolean(fac.id && isFacultyBusyInInterval(fac.id, day, block.startMins, block.endMins, facultyBusyMap));
          if (isC) conflicts++;

          if (fac.id) recordFacultyBusyInterval(fac.id, day, block.startMins, block.endMins, facultyBusyMap);
          if (venue.id) recordVenueBusyInterval(venue.id, day, block.startMins, block.endMins, venueBusyMap);

          const slot = toSlot(block, cls, day, fac, venue);
          slot.isConflict = isC;
          slot.conflictReason = isC ? `Faculty (${fac.name}) double-booked in another class` : null;
          timetable.push(slot);

        } else if (block.kind === 'ANCHOR') {
          // Physical Fitness
          fac   = { id: 'f_pe', name: 'Physical Education Staff' };
          venue = venues.find(v => v.type === 'sports') ||
                  { id: 'v_ground', name: 'Sports Ground', roomNo: 'Outdoor', type: 'sports' };
          timetable.push(toSlot(block, cls, day, fac, venue));

        } else if (block.kind === 'ECA_ANCHOR') {
          fac   = { id: null, name: 'ECA Instructor' };
          venue = { id: null, name: `${block.name} Zone`, roomNo: `${block.name} Area`, type: 'eca' };
          timetable.push(toSlot(block, cls, day, fac, venue));

        } else {
          // BREAK or LUNCH
          timetable.push(toSlot(block, cls, day, null, { id: null, name: '', roomNo: '', type: block.venueType }));
        }
      });
    });
  });

  return {
    timetable,
    stats: {
      totalSlots:    timetable.length,
      allocatedSlots: timetable.length,
      conflictCount: conflicts,
      utilizationRate: timetable.length > 0
        ? Math.max(0, Math.round(((timetable.length - conflicts) / timetable.length) * 100))
        : 100
    },
    validationErrors: []
  };
}