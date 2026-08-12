export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const PERIODS = [
  { id: 1, name: 'Period 1' },
  { id: 2, name: 'Period 2' },
  { id: 3, name: 'Period 3' },
  { id: 4, name: 'Period 4' },
  { id: 5, name: 'Period 5' },
  { id: 6, name: 'Period 6' },
  { id: 7, name: 'Period 7' },
  { id: 8, name: 'Period 8' }
];

export const VENUE_TYPES = [
  { id: 'ALL', label: 'All Types' },
  { id: 'normal', label: 'Normal Class' },
  { id: 'projector', label: 'Normal Class + Projector' },
  { id: 'lab_computers', label: 'Computer Lab' },
  { id: 'lab_science', label: 'Science / Physics Lab' },
  { id: 'auditorium', label: 'Auditorium / Multi-purpose' }
];

export const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_API_URL) || 'http://localhost:5000/api';