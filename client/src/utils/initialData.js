export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const PERIODS = [
  { id: 1, name: 'Period 1', time: '08:30 - 09:15' },
  { id: 2, name: 'Period 2', time: '09:15 - 10:00' },
  { id: 3, name: 'Period 3', time: '10:00 - 10:45' },
  { id: 4, name: 'Period 4', time: '10:45 - 11:30' },
  // Lunch break is placed between Period 4 and Period 5
  { id: 5, name: 'Period 5', time: '12:15 - 01:00' },
  { id: 6, name: 'Period 6', time: '01:00 - 01:45' },
  { id: 7, name: 'Period 7', time: '01:45 - 02:30' },
  { id: 8, name: 'Period 8', time: '02:30 - 03:15' },
];

export const VENUE_TYPES = [
  { id: 'normal', name: 'Normal Class', badgeColor: '#3b82f6', icon: 'BookOpen' },
  { id: 'projector', name: 'Normal Class + Projector', badgeColor: '#8b5cf6', icon: 'Tv' },
  { id: 'computer_lab', name: 'Computer Lab', badgeColor: '#06b6d4', icon: 'Monitor' },
  { id: 'science_lab', name: 'Science Lab', badgeColor: '#10b981', icon: 'FlaskConical' },
  { id: 'auditorium', name: 'Auditorium', badgeColor: '#f59e0b', icon: 'Users' }
];

export const INITIAL_CLASSES = [
  { id: 'c1', name: 'Grade 8-A', grade: '8', section: 'A', studentCount: 36, homeVenueId: 'v1' },
  { id: 'c2', name: 'Grade 9-A', grade: '9', section: 'A', studentCount: 40, homeVenueId: 'v2' },
  { id: 'c3', name: 'Grade 9-B', grade: '9', section: 'B', studentCount: 38, homeVenueId: 'v3' },
  { id: 'c4', name: 'Grade 10-A', grade: '10', section: 'A', studentCount: 42, homeVenueId: 'v4' },
  { id: 'c5', name: 'Grade 10-B', grade: '10', section: 'B', studentCount: 41, homeVenueId: 'v5' },
  { id: 'c6', name: 'Grade 11-A', grade: '11', section: 'A', studentCount: 35, homeVenueId: 'v6' }
];

export const INITIAL_SUBJECTS = [
  { id: 's1', code: 'MATH101', name: 'Mathematics', weeklyPeriods: 6, requiredVenueType: 'projector', color: '#4f46e5' },
  { id: 's2', code: 'ENG101', name: 'English Literature', weeklyPeriods: 6, requiredVenueType: 'normal', color: '#2563eb' },
  { id: 's3', code: 'PHY101', name: 'Physics', weeklyPeriods: 5, requiredVenueType: 'projector', color: '#7c3aed' },
  { id: 's4', code: 'CHEM101', name: 'Chemistry', weeklyPeriods: 5, requiredVenueType: 'science_lab', color: '#059669' },
  { id: 's5', code: 'CS101', name: 'Computer Science', weeklyPeriods: 6, requiredVenueType: 'computer_lab', color: '#0891b2' },
  { id: 's6', code: 'BIO101', name: 'Biology', weeklyPeriods: 4, requiredVenueType: 'science_lab', color: '#16a34a' },
  { id: 's7', code: 'HIST101', name: 'History & Civics', weeklyPeriods: 4, requiredVenueType: 'normal', color: '#d97706' },
  { id: 's8', code: 'GEO101', name: 'Geography', weeklyPeriods: 4, requiredVenueType: 'projector', color: '#ca8a04' },
  { id: 's9', code: 'PE101', name: 'Physical Education', weeklyPeriods: 4, requiredVenueType: 'normal', color: '#dc2626' },
  { id: 's10', code: 'ART101', name: 'Art & Craft', weeklyPeriods: 4, requiredVenueType: 'normal', color: '#db2777' }
];

export const INITIAL_VENUES = [
  { id: 'v1', roomNo: 'Room 101', name: 'Grade 8-A Classroom', type: 'normal', capacity: 40, building: 'Main Block', floor: '1st Floor', status: 'Available' },
  { id: 'v2', roomNo: 'Room 102', name: 'Smart Classroom 102', type: 'projector', capacity: 45, building: 'Main Block', floor: '1st Floor', status: 'Available' },
  { id: 'v3', roomNo: 'Room 103', name: 'Grade 9-B Classroom', type: 'normal', capacity: 40, building: 'Main Block', floor: '1st Floor', status: 'Available' },
  { id: 'v4', roomNo: 'Room 201', name: 'Smart Classroom 201', type: 'projector', capacity: 45, building: 'Science Wing', floor: '2nd Floor', status: 'Available' },
  { id: 'v5', roomNo: 'Room 202', name: 'Grade 10-B Classroom', type: 'normal', capacity: 42, building: 'Science Wing', floor: '2nd Floor', status: 'Available' },
  { id: 'v6', roomNo: 'Room 301', name: 'Smart Classroom 301', type: 'projector', capacity: 40, building: 'Senior Block', floor: '3rd Floor', status: 'Available' },
  { id: 'v7', roomNo: 'Lab A', name: 'Advanced Computer Lab', type: 'computer_lab', capacity: 50, building: 'Tech Wing', floor: '2nd Floor', status: 'Available' },
  { id: 'v8', roomNo: 'Lab B', name: 'Central Science Lab', type: 'science_lab', capacity: 45, building: 'Science Wing', floor: '1st Floor', status: 'Available' },
  { id: 'v9', roomNo: 'Audi-1', name: 'Main Auditorium', type: 'auditorium', capacity: 250, building: 'Activity Center', floor: 'Ground Floor', status: 'Available' }
];

export const INITIAL_FACULTIES = [
  {
    id: 'f1',
    empId: 'FAC-001',
    name: 'Dr. Rajesh Sharma',
    email: 'rajesh.sharma@bitschool.edu',
    phone: '+91 98765 43210',
    primarySubjectId: 's1',
    secondarySubjectIds: ['s3'],
    grades: ['Grade 8-A', 'Grade 9-A', 'Grade 10-A'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 25,
    status: 'Active',
    avatarColor: '#4f46e5'
  },
  {
    id: 'f2',
    empId: 'FAC-002',
    name: 'Prof. Ananya Sen',
    email: 'ananya.sen@bitschool.edu',
    phone: '+91 98765 43211',
    primarySubjectId: 's2',
    secondarySubjectIds: ['s7'],
    grades: ['Grade 8-A', 'Grade 9-B', 'Grade 10-B'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 25,
    status: 'Active',
    avatarColor: '#2563eb'
  },
  {
    id: 'f3',
    empId: 'FAC-003',
    name: 'Mr. Vikramaditya Rao',
    email: 'vikram.rao@bitschool.edu',
    phone: '+91 98765 43212',
    primarySubjectId: 's3',
    secondarySubjectIds: ['s1'],
    grades: ['Grade 9-A', 'Grade 10-A', 'Grade 11-A'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 24,
    status: 'Active',
    avatarColor: '#7c3aed'
  },
  {
    id: 'f4',
    empId: 'FAC-004',
    name: 'Dr. Meera Nair',
    email: 'meera.nair@bitschool.edu',
    phone: '+91 98765 43213',
    primarySubjectId: 's4',
    secondarySubjectIds: ['s6'],
    grades: ['Grade 9-B', 'Grade 10-B', 'Grade 11-A'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 24,
    status: 'Active',
    avatarColor: '#059669'
  },
  {
    id: 'f5',
    empId: 'FAC-005',
    name: 'Er. Suresh Mehta',
    email: 'suresh.mehta@bitschool.edu',
    phone: '+91 98765 43214',
    primarySubjectId: 's5',
    secondarySubjectIds: [],
    grades: ['Grade 8-A', 'Grade 9-A', 'Grade 10-A', 'Grade 11-A'],
    maxPeriodsPerDay: 6,
    maxPeriodsPerWeek: 26,
    status: 'Active',
    avatarColor: '#0891b2'
  },
  {
    id: 'f6',
    empId: 'FAC-006',
    name: 'Mrs. Kavita Patel',
    email: 'kavita.patel@bitschool.edu',
    phone: '+91 98765 43215',
    primarySubjectId: 's6',
    secondarySubjectIds: ['s4'],
    grades: ['Grade 8-A', 'Grade 9-A', 'Grade 10-B'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 22,
    status: 'Active',
    avatarColor: '#16a34a'
  },
  {
    id: 'f7',
    empId: 'FAC-007',
    name: 'Mr. David Fernandez',
    email: 'david.f@bitschool.edu',
    phone: '+91 98765 43216',
    primarySubjectId: 's7',
    secondarySubjectIds: ['s8'],
    grades: ['Grade 8-A', 'Grade 9-A', 'Grade 10-A'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 22,
    status: 'Active',
    avatarColor: '#d97706'
  },
  {
    id: 'f8',
    empId: 'FAC-008',
    name: 'Ms. Sunita Verma',
    email: 'sunita.v@bitschool.edu',
    phone: '+91 98765 43217',
    primarySubjectId: 's8',
    secondarySubjectIds: ['s7'],
    grades: ['Grade 8-A', 'Grade 9-B', 'Grade 10-B'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 22,
    status: 'Active',
    avatarColor: '#ca8a04'
  },
  {
    id: 'f9',
    empId: 'FAC-009',
    name: 'Coach Rakesh Singh',
    email: 'rakesh.singh@bitschool.edu',
    phone: '+91 98765 43218',
    primarySubjectId: 's9',
    secondarySubjectIds: [],
    grades: ['Grade 8-A', 'Grade 9-A', 'Grade 9-B', 'Grade 10-A', 'Grade 10-B', 'Grade 11-A'],
    maxPeriodsPerDay: 6,
    maxPeriodsPerWeek: 28,
    status: 'Active',
    avatarColor: '#dc2626'
  },
  {
    id: 'f10',
    empId: 'FAC-010',
    name: 'Mrs. Priya Deshmukh',
    email: 'priya.d@bitschool.edu',
    phone: '+91 98765 43219',
    primarySubjectId: 's10',
    secondarySubjectIds: [],
    grades: ['Grade 8-A', 'Grade 9-A', 'Grade 9-B', 'Grade 10-A', 'Grade 10-B'],
    maxPeriodsPerDay: 5,
    maxPeriodsPerWeek: 22,
    status: 'Active',
    avatarColor: '#db2777'
  }
];
