export const INITIAL_CLASSES = [
  { id: 'c1', name: 'Grade 8-A', grade: '8', section: 'A', studentCount: 36, homeVenueId: 'v1' },
  { id: 'c2', name: 'Grade 9-A', grade: '9', section: 'A', studentCount: 40, homeVenueId: 'v2' },
  { id: 'c3', name: 'Grade 9-B', grade: '9', section: 'B', studentCount: 38, homeVenueId: 'v3' },
  { id: 'c4', name: 'Grade 10-A', grade: '10', section: 'A', studentCount: 42, homeVenueId: 'v4' },
  { id: 'c5', name: 'Grade 10-B', grade: '10', section: 'B', studentCount: 41, homeVenueId: 'v5' },
  { id: 'c6', name: 'Grade 11-A', grade: '11', section: 'A', studentCount: 35, homeVenueId: 'v6' }
];

export const INITIAL_SUBJECTS = [
  { id: 's1', code: 'MATH101', name: 'Mathematics', weeklyPeriods: 8, requiredVenueType: 'projector', color: '#4f46e5' },
  { id: 's2', code: 'ENG101', name: 'English Literature', weeklyPeriods: 6, requiredVenueType: 'normal', color: '#2563eb' },
  { id: 's3', code: 'PHY101', name: 'Physics', weeklyPeriods: 5, requiredVenueType: 'projector', color: '#7c3aed' },
  { id: 's4', code: 'CHEM101', name: 'Chemistry', weeklyPeriods: 5, requiredVenueType: 'science_lab', color: '#059669' },
  { id: 's5', code: 'CS101', name: 'Computer Science', weeklyPeriods: 6, requiredVenueType: 'computer_lab', color: '#0891b2' },
  { id: 's6', code: 'BIO101', name: 'Biology', weeklyPeriods: 4, requiredVenueType: 'science_lab', color: '#16a34a' },
  { id: 's7', code: 'HIST101', name: 'History & Civics', weeklyPeriods: 4, requiredVenueType: 'normal', color: '#d97706' },
  { id: 's8', code: 'GEO101', name: 'Geography', weeklyPeriods: 4, requiredVenueType: 'projector', color: '#ca8a04' },
  { id: 's9', code: 'PE101', name: 'Physical Education', weeklyPeriods: 3, requiredVenueType: 'normal', color: '#dc2626' },
  { id: 's10', code: 'ART101', name: 'Art & Craft', weeklyPeriods: 3, requiredVenueType: 'normal', color: '#db2777' }
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
  }
];

export const INITIAL_ECA_VERTICALS = [
  'Keyboard',
  'Classical Dance / Table tennis',
  'Violin / Movie session / Handwriting practice',
  'Table tennis',
  'Western Dance',
  'Chess',
  'Physical Fitness',
  'English song',
  'Ted ex video'
];

export const INITIAL_ECA_SCHEDULE = {
  MONDAY: {
    'Keyboard': { active: false, label: 'No' },
    'Classical Dance / Table tennis': { active: false, label: 'No' },
    'Violin / Movie session / Handwriting practice': { active: true, label: 'Yes (45 mins)', duration: '45 mins', color: '#db2777' },
    'Table tennis': { active: false, label: 'No' },
    'Western Dance': { active: false, label: 'No' },
    'Chess': { active: false, label: 'No' },
    'Physical Fitness': { active: true, label: 'Yes (15 mins)', duration: '15 mins', color: '#059669' },
    'English song': { active: true, label: 'Yes (5 mins)', duration: '5 mins', color: '#2563eb' },
    'Ted ex video': { active: false, label: 'No' }
  },
  TUESDAY: {
    'Keyboard': { active: false, label: 'No' },
    'Classical Dance / Table tennis': { active: true, label: 'Yes - Girls (1 hour)', duration: '1 hour', target: 'Girls', color: '#7c3aed' },
    'Violin / Movie session / Handwriting practice': { active: false, label: 'No' },
    'Table tennis': { active: true, label: 'Yes - Boys (1 hour)', duration: '1 hour', target: 'Boys', color: '#0891b2' },
    'Western Dance': { active: false, label: 'No' },
    'Chess': { active: false, label: 'No' },
    'Physical Fitness': { active: true, label: 'Yes (15 mins)', duration: '15 mins', color: '#059669' },
    'English song': { active: true, label: 'Yes (5 mins)', duration: '5 mins', color: '#2563eb' },
    'Ted ex video': { active: false, label: 'No' }
  }
};
