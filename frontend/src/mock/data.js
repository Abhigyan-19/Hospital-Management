import { Activity, BedDouble, CalendarCheck2, UsersRound } from 'lucide-react';

export const mockPatients = [
  { id: 101, name: 'Maya Iyer', age: 64, gender: 'Female', phone: '+91 98765 42190' },
  { id: 102, name: 'Rohan Sharma', age: 42, gender: 'Male', phone: '+91 98111 20876' },
  { id: 103, name: 'Leela Nair', age: 71, gender: 'Female', phone: '+91 99440 81221' },
];

export const mockDoctors = [
  { id: 201, name: 'Dr. Anika Sharma', specialization: 'Cardiology', experience: 14 },
  { id: 202, name: 'Dr. Kabir Menon', specialization: 'Orthopaedics', experience: 9 },
  { id: 203, name: 'Dr. Priya Rao', specialization: 'Paediatrics', experience: 12 },
];

export const mockDashboard = {
  stats: [
    { label: 'Total patients', value: '1,284', change: '+8.4%', icon: UsersRound, tone: 'teal' },
    { label: 'Active doctors', value: '48', change: '+3 this month', icon: Activity, tone: 'navy' },
    { label: "Today's appointments", value: '36', change: '12 remaining', icon: CalendarCheck2, tone: 'amber' },
    { label: 'Available beds', value: '72', change: 'of 120 total', icon: BedDouble, tone: 'green' },
  ],
  weeklyAppointments: [
    { day: 'Mon', scheduled: 34, completed: 25 }, { day: 'Tue', scheduled: 42, completed: 31 }, { day: 'Wed', scheduled: 37, completed: 29 },
    { day: 'Thu', scheduled: 49, completed: 36 }, { day: 'Fri', scheduled: 44, completed: 33 }, { day: 'Sat', scheduled: 28, completed: 22 }, { day: 'Sun', scheduled: 18, completed: 15 },
  ],
  departmentPatients: [
    { department: 'General medicine', patients: 412 }, { department: 'Cardiology', patients: 286 }, { department: 'Orthopaedics', patients: 224 }, { department: 'Paediatrics', patients: 158 },
  ],
  appointments: [
    { time: '09:30', patient: 'Maya Iyer', doctor: 'Dr. Anika Sharma', type: 'Cardiology', status: 'Confirmed' },
    { time: '11:00', patient: 'Rohan Sharma', doctor: 'Dr. Kabir Menon', type: 'Orthopaedics', status: 'Waiting' },
    { time: '14:15', patient: 'Leela Nair', doctor: 'Dr. Priya Rao', type: 'Paediatrics', status: 'Confirmed' },
  ],
};

export const mockDepartments = [
  { id: 301, name: 'Cardiology', headDoctor: 'Dr. Anika Sharma', description: 'Heart and vascular care for adults.' },
  { id: 302, name: 'Orthopaedics', headDoctor: 'Dr. Kabir Menon', description: 'Mobility, bones and joint care.' },
  { id: 303, name: 'Paediatrics', headDoctor: 'Dr. Priya Rao', description: 'Thoughtful care for children and families.' },
];

export const mockAppointments = [
  { id: 401, date: '2026-09-19', time: '09:30', patient: 'Maya Iyer', doctor: 'Dr. Anika Sharma', department: 'Cardiology', status: 'Scheduled' },
  { id: 402, date: '2026-09-19', time: '11:00', patient: 'Rohan Sharma', doctor: 'Dr. Kabir Menon', department: 'Orthopaedics', status: 'Scheduled' },
  { id: 403, date: '2026-09-20', time: '14:15', patient: 'Leela Nair', doctor: 'Dr. Priya Rao', department: 'Paediatrics', status: 'Scheduled' },
];

export const mockPrescriptions = [
  { id: 501, patient: 'Maya Iyer', doctor: 'Dr. Anika Sharma', createdAt: '2026-09-18', medicines: [{ name: 'Amlodipine', dosage: '5 mg', frequency: 'Once daily', duration: '30 days' }], notes: 'Take after breakfast.' },
  { id: 502, patient: 'Rohan Sharma', doctor: 'Dr. Kabir Menon', createdAt: '2026-09-17', medicines: [{ name: 'Calcium citrate', dosage: '500 mg', frequency: 'Twice daily', duration: '14 days' }], notes: 'Review after two weeks.' },
];
