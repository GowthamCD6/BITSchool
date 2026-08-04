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
 * Handles: '06:00' (HH:MM), '45 mins', '1 hour', '1 hour 30 mins', etc.
 */
function parseDur(text) {
  if (!text) return null;
  const raw = String(text).trim().toLowerCase();
  if (!raw || ['no', 'nan', 'none', ''].includes(raw)) return null;

  // HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  }

  let hours = 0;
  let mins = 0;
  if (raw.includes('hour') || raw.includes('hr')) {
    const hm = raw.match(/(\d+)\s*(?:hour|hr)/);
    if (hm) hours = parseInt(hm[1], 10);
    const rest = raw.split(/hour|hr/)[1] || '';
    const mm = rest.match(/(\d+)/);
    if (mm) mins = parseInt(mm[1], 10);
  } else {
    const d = raw.replace(/[^\d]/g, ' ').trim().split(/\s+/);
    if (d[0]) mins = parseInt(d[0], 10);
  }
  const total = hours * 60 + mins;
  return total > 0 ? total : null;
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
 * weeklyDuration is stored as 'HH:MM' (e.g. '06:00' = 360 mins).
 */
export function getSubjectPeriodDurationMins(subj) {
  const periods = Math.max(1, Number(subj.weeklyPeriods) || 6);
  let totalMins = 360; // default 6 hours / week
  if (subj.weeklyDuration) {
    const parsed = parseDur(subj.weeklyDuration);
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

/**
 * Fill a time session [sessionStart, sessionEnd] with academic subjects.
 *
 * Rules:
 *  • Pick subjects NOT already used today (usedIdsToday Set)
 *  • Prioritize subjects whose assigned faculty is AVAILABLE at that time interval
 *  • Use exact per-period duration from master course
 *
 * @param {number}  sessionStart     minutes from midnight
 * @param {number}  sessionEnd       minutes from midnight (must reach exactly)
 * @param {Array}   subjectPool      ordered subject objects
 * @param {Set}     usedIdsToday     Set of subject ids already placed today
 * @param {string}  grade            grade string e.g. '5'
 * @param {Array}   faculties        all faculties list
 * @param {string}  day              day string e.g. 'Monday'
 * @param {Object}  facultyBusyMap   busy intervals map
 * @returns {Array} placed block objects
 */
function fillSession(sessionStart, sessionEnd, subjectPool, usedIdsToday, grade = '', faculties = [], day = '', facultyBusyMap = {}) {
  const blocks = [];
  const totalDuration = sessionEnd - sessionStart;
  if (totalDuration <= 0 || !subjectPool || !subjectPool.length) return blocks;

  let cursor = sessionStart;
  let remaining = totalDuration;
  let attemptCount = 0;
  const maxAttempts = 20;

  while (remaining > 0 && attemptCount < maxAttempts) {
    attemptCount++;

    // Filter for subjects not yet used today; if all have been used today, fall back to entire pool
    let candidates = subjectPool.filter(s => !usedIdsToday.has(s.id));
    if (candidates.length === 0) {
      candidates = subjectPool;
    }

    // Smart candidate selection: prioritize subject whose faculty is FREE at [cursor, cursor + duration]
    let chosenSubj = candidates.find(s => {
      const fac = findBestFacultyForSubject(s.data, grade, faculties, day, cursor, cursor + s.duration, facultyBusyMap);
      return Boolean(fac && fac.id);
    });

    // Fallback: pick sequentially from candidates if no subject has a free faculty right now
    if (!chosenSubj) {
      chosenSubj = candidates[(attemptCount - 1) % candidates.length];
    }
    if (!chosenSubj) break;

    // Use subject's natural duration, or remaining time if remaining is smaller
    let blockDur = Math.min(chosenSubj.duration, remaining);

    // If remaining time after this block would be less than 10 mins, absorb it into this block to avoid tiny residual gaps
    if (remaining - blockDur < 10 && remaining - blockDur > 0) {
      blockDur = remaining;
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

    usedIdsToday.add(chosenSubj.id);
    cursor += blockDur;
    remaining -= blockDur;
  }

  // Safety: if any tiny gap remains, stretch the last placed block to reach sessionEnd exactly
  if (remaining > 0 && blocks.length > 0) {
    const last = blocks[blocks.length - 1];
    last.duration += remaining;
    last.endMins = sessionEnd;
    last.end = fmt(sessionEnd);
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
    targetClassId   = 'all',
    targetGrade     = 'all',
    existingTimetable = []
  } = params;

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

    // Build ordered subject pool: highest weeklyPeriods = highest priority
    const basePool = [...activeSubjects]
      .sort((a, b) => (Number(b.weeklyPeriods) || 6) - (Number(a.weeklyPeriods) || 6))
      .map(s => ({
        id:       s.id,
        name:     s.name,
        code:     s.code || '',
        color:    s.color || '#2563eb',
        duration: getSubjectPeriodDurationMins(s),
        data:     s
      }));

    // Per-class seed for deterministic shuffle
    const classSeed = (cls.id || '').split('').reduce((a, c) => a + c.charCodeAt(0), 42);

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
      // Clamp: must fit before morning break with at least 5 mins for academics
      pfDur = Math.max(5, Math.min(pfDur, mBsM - sStartM - 5));

      // ── Build today's subject pool (shuffled for variety) ──
      const daySeed = classSeed * 31 + dayIndex * 17 + day.charCodeAt(0);
      const dayPool = seededShuffle(basePool, daySeed);

      // Track which subjects have been placed today (no duplicates)
      const usedToday = new Set();

      // ── COLLECT timeline blocks for this day ──
      const dayBlocks = [];

      // ── 1. PHYSICAL FITNESS (always first block) ──
      const pfStart = sStartM;
      const pfEnd   = sStartM + pfDur;
      dayBlocks.push({
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

      // ── 2. SESSION A: physFitnessEnd → morningBreakStart ──
      const sA = fillSession(pfEnd, mBsM, dayPool, usedToday, grade, faculties, day, facultyBusyMap);
      dayBlocks.push(...sA);

      // ── 3. MORNING BREAK (fixed) ──
      dayBlocks.push({
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

      // ── 4. SESSION B: morningBreakEnd → lunchBreakStart ──
      const sB = fillSession(mBeM, lBsM, dayPool, usedToday, grade, faculties, day, facultyBusyMap);
      dayBlocks.push(...sB);

      // ── 5. LUNCH BREAK (fixed) ──
      dayBlocks.push({
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

      // ── 6. ECA BLOCKS (post-lunch, clamped to afternoonBreakStart) ──
      let ecaCursor = lBeM;

      // Sort ECA entries so that 'English Song' is placed first right next to Lunch Break
      const ecaEntries = Object.entries(ecaMap).sort(([nameA], [nameB]) => {
        const isA_Song = nameA.toLowerCase().includes('english song') || nameA.toLowerCase().includes('song');
        const isB_Song = nameB.toLowerCase().includes('english song') || nameB.toLowerCase().includes('song');
        if (isA_Song && !isB_Song) return -1;
        if (!isA_Song && isB_Song) return 1;
        return 0;
      });

      ecaEntries.forEach(([vertName, vertData]) => {
        // Skip Physical Fitness — already placed as block #1
        if (vertName.toLowerCase().includes('fitness') || vertName.toLowerCase().includes('physical fitness')) return;

        // Stop if no more room before Afternoon Break
        if (ecaCursor >= aBsM) return;

        // Check if this ECA is active
        const isActive = vertData && (
          vertData.active === true ||
          (vertData.label && vertData.label !== 'No' && !String(vertData.label).startsWith('No'))
        );
        if (!isActive) return;

        let ecaDur = parseDur(vertData.duration) || 30;
        ecaDur = Math.max(5, r5(ecaDur));

        // Clamp: don't push past Afternoon Break
        const remaining = aBsM - ecaCursor;
        if (remaining <= 0) return;
        ecaDur = Math.min(ecaDur, remaining);

        const target  = vertData.target || 'All';
        const isBoth  = target === 'Both' ||
          (vertData.label && (vertData.label.includes('Both') || vertData.label.includes('Boys & Girls')));

        if (isBoth) {
          const halfAvail = Math.floor((aBsM - ecaCursor) / 2);
          const boys = Math.min(ecaDur, halfAvail);
          if (boys >= 5) {
            dayBlocks.push({
              kind: 'ECA_ANCHOR', name: `${vertName} (Boys)`,
              subjectId: `eca_${vertName.toLowerCase().replace(/\s+/g,'_')}_boys`,
              subjectCode: 'ECA', subjectColor: vertData.color || '#d97706', venueType: 'eca',
              duration: boys, start: fmt(ecaCursor), end: fmt(ecaCursor + boys),
              startMins: ecaCursor, endMins: ecaCursor + boys, ecaTag: `${vertName} (Boys)`
            });
            ecaCursor += boys;
          }
          const girlsAvail = aBsM - ecaCursor;
          const girls = Math.min(ecaDur, girlsAvail);
          if (girls >= 5 && ecaCursor < aBsM) {
            dayBlocks.push({
              kind: 'ECA_ANCHOR', name: `${vertName} (Girls)`,
              subjectId: `eca_${vertName.toLowerCase().replace(/\s+/g,'_')}_girls`,
              subjectCode: 'ECA', subjectColor: vertData.color || '#d97706', venueType: 'eca',
              duration: girls, start: fmt(ecaCursor), end: fmt(ecaCursor + girls),
              startMins: ecaCursor, endMins: ecaCursor + girls, ecaTag: `${vertName} (Girls)`
            });
            ecaCursor += girls;
          }
        } else {
          const displayName = (target && target !== 'All') ? `${vertName} (${target})` : vertName;
          dayBlocks.push({
            kind: 'ECA_ANCHOR', name: displayName,
            subjectId: `eca_${vertName.toLowerCase().replace(/\s+/g,'_')}_${target.toLowerCase()}`,
            subjectCode: 'ECA', subjectColor: vertData.color || '#d97706', venueType: 'eca',
            duration: ecaDur, start: fmt(ecaCursor), end: fmt(ecaCursor + ecaDur),
            startMins: ecaCursor, endMins: ecaCursor + ecaDur, ecaTag: displayName
          });
          ecaCursor += ecaDur;
        }
      });

      // ── 7. SESSION C: remaining post-ECA gap → afternoonBreakStart ──
      if (ecaCursor < aBsM) {
        const sC = fillSession(ecaCursor, aBsM, dayPool, usedToday, grade, faculties, day, facultyBusyMap);
        dayBlocks.push(...sC);
      }

      // ── 8. AFTERNOON BREAK (fixed) ──
      dayBlocks.push({
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

      // ── 9. SESSION D: afternoonBreakEnd → schoolEnd ──
      const sD = fillSession(aBeM, sEndM, dayPool, usedToday, grade, faculties, day, facultyBusyMap);
      dayBlocks.push(...sD);

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
