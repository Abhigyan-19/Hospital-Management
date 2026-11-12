import { getDemoUser, recordDemoAuditEvent } from '../api/demoAuth';
import { mockAppointments, mockDepartments, mockDoctors, mockPatients } from './data';

const STORAGE_KEY = 'sebasethu-demo-data';

function dateOffset(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function initialState() {
  const patientByName = new Map(mockPatients.map((patient) => [patient.name, patient]));
  const doctorByName = new Map(mockDoctors.map((doctor) => [doctor.name, doctor]));
  return {
    patients: mockPatients.map((patient, index) => ({ ...patient, registeredAt: dateOffset(-90 + index * 14) })),
    doctors: [...mockDoctors],
    departments: [...mockDepartments],
    services: [
      { id: 901, name: 'Outpatient consultation', departmentId: 301, departmentName: 'Cardiology', price: 800, currency: 'INR' },
      { id: 902, name: 'Diagnostic imaging', departmentId: 302, departmentName: 'Orthopaedics', price: 1200, currency: 'INR' },
      { id: 903, name: 'Preventive health check', departmentId: 303, departmentName: 'Paediatrics', price: 2500, currency: 'INR' },
    ],
    wards: [
      { id: 701, name: 'North Wing', department: 'General medicine', floor: 1 },
      { id: 702, name: 'Heart Care', department: 'Cardiology', floor: 2 },
    ],
    beds: [
      { id: 801, bedNumber: 'N-101', wardId: 701, wardName: 'North Wing', status: 'AVAILABLE', patientId: null, patientName: null },
      { id: 802, bedNumber: 'N-102', wardId: 701, wardName: 'North Wing', status: 'OCCUPIED', patientId: 101, patientName: 'Maya Iyer' },
      { id: 803, bedNumber: 'H-201', wardId: 702, wardName: 'Heart Care', status: 'MAINTENANCE', patientId: null, patientName: null },
    ],
    appointments: mockAppointments.map((item, index) => ({
      ...item,
      date: index === 0 ? dateOffset(7) : index === 1 ? dateOffset(9) : dateOffset(-35),
      patient: patientByName.get(item.patient),
      doctor: doctorByName.get(item.doctor),
      status: index === 2 ? 'Completed' : item.status,
      emailNotificationStatus: 'NOT_SENT_DEMO',
    })),
    prescriptions: [
      {
        id: 501,
        patient: { ...mockPatients[0] },
        doctor: { ...mockDoctors[0] },
        createdAt: dateOffset(-35),
        medicines: [{
          name: 'Amlodipine',
          dosage: '5 mg',
          frequency: 'Once daily',
          duration: '30 days',
          patientInstructions: 'Take one tablet by mouth after breakfast each day, at about the same time.',
        }],
        notes: 'Take after breakfast.',
        auditHistory: [],
      },
    ],
    urgentRequests: [],
    linkedPatients: {},
    patientProfiles: {
      101: {
        id: 101, name: 'Maya Iyer', age: 64, gender: 'Female', phone: '+91 98765 42190',
        bloodGroup: 'O+', allergies: ['Penicillin'], emergencyContact: 'Arun Iyer · +91 98765 40000',
        insuranceProvider: 'Demo Health Plan', insurancePolicy: 'DEMO-101',
      },
    },
    medicalHistory: {
      101: [
        { id: 901, date: dateOffset(-35), type: 'Visit', title: 'Cardiology follow-up', detail: 'Routine review after completed consultation.' },
        { id: 902, date: dateOffset(-120), type: 'Condition', title: 'Hypertension', detail: 'Recorded in the demo health summary.' },
      ],
    },
    labReports: {
      101: [{ id: 1001, name: 'Complete blood count', date: dateOffset(-35), status: 'Ready', result: 'Demo result: within reference range.' }],
    },
    invoices: {
      101: [
        { id: 1101, patientId: 101, invoiceNumber: 'DEMO-INV-1101', date: dateOffset(7), description: 'Cardiology consultation', amount: 800, status: 'Pending' },
        { id: 1102, patientId: 101, invoiceNumber: 'DEMO-INV-1102', date: dateOffset(-35), description: 'Follow-up consultation', amount: 500, status: 'Paid' },
      ],
    },
    doctorAvailability: {
      201: { workingDays: ['Monday', 'Wednesday', 'Friday'], startTime: '09:30', endTime: '13:00', slotMinutes: 30, leaveDates: [] },
      202: { workingDays: ['Tuesday', 'Thursday', 'Saturday'], startTime: '10:00', endTime: '14:00', slotMinutes: 30, leaveDates: [] },
      203: { workingDays: ['Monday', 'Tuesday', 'Thursday'], startTime: '11:00', endTime: '15:00', slotMinutes: 30, leaveDates: [] },
    },
    consultations: {},
  };
}

function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!stored) return initialState();
    const defaults = initialState();
    return {
      ...defaults,
      ...stored,
      patients: (stored.patients || defaults.patients).map((patient) => {
        const seeded = defaults.patients.find((item) => Number(item.id) === Number(patient.id));
        return { ...seeded, ...patient, registeredAt: patient.registeredAt || seeded?.registeredAt };
      }),
      patientProfiles: { ...defaults.patientProfiles, ...stored.patientProfiles },
      medicalHistory: { ...defaults.medicalHistory, ...stored.medicalHistory },
      labReports: { ...defaults.labReports, ...stored.labReports },
      invoices: { ...defaults.invoices, ...stored.invoices },
      doctorAvailability: { ...defaults.doctorAvailability, ...stored.doctorAvailability },
      consultations: { ...defaults.consultations, ...stored.consultations },
    };
  } catch {
    return initialState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateState(updater) {
  const state = readState();
  const result = updater(state);
  saveState(state);
  return result;
}

export function demoListPatients() {
  return updateState((state) => {
    const user = getDemoUser();
    if (user?.role === 'PATIENT' && user.patientId && !state.patients.some((patient) => patient.id === user.patientId)) {
      state.patients.push({
        id: user.patientId,
        name: user.name,
        age: Number(user.age) || 30,
        gender: user.gender || 'Prefer not to say',
        phone: user.phone || '',
      });
    }
    return [...state.patients];
  });
}

export function demoGetLinkedPatients() {
  const user = getDemoUser();
  if (!user || user.role !== 'PATIENT') throw new Error('Sign in with a patient demo account to view linked profiles.');
  return updateState((state) => {
    let linked = state.linkedPatients[user.id] || [];
    if (!linked.length) {
      const self = state.patients.find((patient) => patient.id === user.patientId);
      linked = [self || {
        id: user.patientId,
        name: user.name,
        age: Number(user.age) || 30,
        gender: user.gender || 'Prefer not to say',
        phone: user.phone || '',
        relationshipToAccount: 'SELF',
        isSelf: true,
      }];
      if (!state.patients.some((patient) => patient.id === user.patientId)) state.patients.push(linked[0]);
      state.linkedPatients[user.id] = linked;
    }
    return [...linked];
  });
}

export function demoAddLinkedPatient(profile) {
  const user = getDemoUser();
  if (!user || user.role !== 'PATIENT') throw new Error('Only a patient account may add linked demo profiles.');
  return updateState((state) => {
    const created = {
      ...profile,
      id: Date.now(),
      relationshipToAccount: profile.relationship,
      isSelf: false,
    };
    state.patients.push(created);
    const linked = state.linkedPatients[user.id] || [];
    if (!linked.length) linked.push({
      id: user.patientId,
      name: user.name,
      age: Number(user.age) || 30,
      gender: user.gender || 'Prefer not to say',
      phone: user.phone || '',
      relationshipToAccount: 'SELF',
      isSelf: true,
    });
    state.linkedPatients[user.id] = [...linked, created];
    return created;
  });
}

function getPatientProfileIds(user, state) {
  if (!user || user.role !== 'PATIENT') {
    throw new Error('Sign in with a patient account to view patient records.');
  }
  const linked = state.linkedPatients[user.id] || [{ id: user.patientId }];
  const ids = new Set(linked.map((profile) => Number(profile.id)));
  if (user.patientId) ids.add(Number(user.patientId));
  return ids;
}

function assertPatientProfileAccess(user, state, patientId) {
  const allowedIds = getPatientProfileIds(user, state);
  if (!allowedIds.has(Number(patientId))) {
    throw new Error('This patient profile is not linked to your account.');
  }
}

export function demoGetPatientProfile(patientId) {
  const user = getDemoUser();
  return updateState((state) => {
    assertPatientProfileAccess(user, state, patientId);
    const profile = state.patientProfiles[patientId]
      || state.patients.find((patient) => Number(patient.id) === Number(patientId));
    if (!profile) throw new Error('Patient profile not found.');
    return { ...profile };
  });
}

export function demoUpdatePatientProfile(patientId, changes) {
  const user = getDemoUser();
  return updateState((state) => {
    assertPatientProfileAccess(user, state, patientId);
    const existing = state.patientProfiles[patientId]
      || state.patients.find((patient) => Number(patient.id) === Number(patientId));
    if (!existing) throw new Error('Patient profile not found.');
    const updated = { ...existing, ...changes, id: Number(patientId) };
    state.patientProfiles[patientId] = updated;
    state.patients = state.patients.map((patient) =>
      Number(patient.id) === Number(patientId) ? { ...patient, ...updated } : patient,
    );
    if (Number(user.patientId) === Number(patientId)) {
      const accounts = JSON.parse(localStorage.getItem('sebasethu-demo-accounts') || '[]');
      localStorage.setItem('sebasethu-demo-accounts', JSON.stringify(accounts.map((account) =>
        account.id === user.id ? { ...account, ...updated } : account,
      )));
      const session = { ...user, ...updated };
      localStorage.setItem('sebasethu-demo-session', JSON.stringify(session));
    }
    return updated;
  });
}

export function demoListMedicalHistory(patientId) {
  const user = getDemoUser();
  return updateState((state) => {
    assertPatientProfileAccess(user, state, patientId);
    return [...(state.medicalHistory[patientId] || [])];
  });
}

export function demoListLabReports(patientId) {
  const user = getDemoUser();
  return updateState((state) => {
    assertPatientProfileAccess(user, state, patientId);
    return [...(state.labReports[patientId] || [])];
  });
}

export function demoListInvoices(patientId) {
  const user = getDemoUser();
  return updateState((state) => {
    assertPatientProfileAccess(user, state, patientId);
    return [...(state.invoices[patientId] || [])];
  });
}

export function demoListDoctors() {
  const state = readState();
  const accounts = JSON.parse(localStorage.getItem('sebasethu-demo-accounts') || '[]');
  const registered = accounts.filter((account) => account.role === 'DOCTOR' && account.approvalStatus === 'APPROVED').map((account) => ({
    id: account.doctorId || account.id,
    name: account.name,
    specialization: account.specialization || 'General medicine',
    experience: Number(account.experience) || 0,
  }));
  return [...state.doctors, ...registered.filter((doctor) => !state.doctors.some((current) => current.id === doctor.id))]
    .map((doctor) => {
      const availability = state.doctorAvailability[doctor.id];
      return availability ? {
        ...doctor,
        ...availability,
        availability: availability.workingDays,
        timings: `${availability.startTime}–${availability.endTime}`,
      } : doctor;
    });
}

export function demoListDepartments() {
  return readState().departments;
}

export function demoCreateDoctor(doctor) {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') throw new Error('Only an administrator may add a doctor record.');
  const name = String(doctor.name || '').trim();
  const specialization = String(doctor.specialization || '').trim();
  const experience = Number(doctor.experience);
  if (!name || !specialization || !Number.isFinite(experience) || experience < 0) {
    throw new Error('Enter a doctor name, specialty, and valid experience.');
  }
  return updateState((state) => {
    const created = { ...doctor, id: Date.now(), name, specialization, experience };
    state.doctors.push(created);
    recordDemoAuditEvent({
      action: 'Doctor record added',
      entityType: 'Doctor record',
      entityId: created.id,
      summary: `${created.name} was added to the staff directory.`,
    });
    return created;
  });
}

export function demoDeleteDoctor(id) {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') throw new Error('Only an administrator may delete a doctor record.');
  const accounts = JSON.parse(localStorage.getItem('sebasethu-demo-accounts') || '[]');
  if (accounts.some((account) => Number(account.doctorId || account.id) === Number(id) && account.role === 'DOCTOR')) {
    throw new Error('Doctor accounts must be deactivated in Users & roles; they cannot be deleted from the care directory.');
  }
  return updateState((state) => {
    const doctor = state.doctors.find((item) => Number(item.id) === Number(id));
    if (!doctor) throw new Error('The doctor record was not found.');
    if (state.appointments.some((appointment) => Number(appointment.doctor?.id) === Number(id))) {
      throw new Error('This doctor has appointment history and cannot be deleted. Deactivate the account or update the provider record instead.');
    }
    state.doctors = state.doctors.filter((item) => Number(item.id) !== Number(id));
    recordDemoAuditEvent({
      action: 'Doctor record deleted',
      entityType: 'Doctor record',
      entityId: id,
      summary: `${doctor.name} was removed from the demo staff directory.`,
    });
    return undefined;
  });
}

export function demoListNotifications() {
  const user = getDemoUser();
  if (!user || !['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'].includes(user.role)) {
    throw new Error('Sign in with a hospital account to view notifications.');
  }
  const state = readState();
  const today = dateOffset(0);
  const notifications = [];
  const add = (id, title, message, href) => notifications.push({
    id: `demo-${id}`,
    title,
    message,
    href,
    createdAt: new Date().toISOString(),
    read: false,
  });

  if (user.role === 'PATIENT') {
    const patientIds = new Set([
      Number(user.patientId),
      ...(state.linkedPatients[user.id] || []).map((patient) => Number(patient.id)),
    ].filter(Number.isFinite));
    const appointments = demoListAppointments()
      .filter((appointment) => appointment.date >= today && !['Cancelled', 'Completed'].includes(appointment.status))
      .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`));
    const next = appointments[0];
    if (next) add(`appointment-${next.id}`, 'Upcoming appointment', `Your appointment with ${next.doctor?.name || 'your doctor'} is scheduled for ${next.date} at ${next.time}.`, '/my-appointments');
    const pendingBills = Object.entries(state.invoices)
      .filter(([patientId]) => patientIds.has(Number(patientId)))
      .flatMap(([, invoices]) => invoices)
      .filter((invoice) => !['PAID', 'Paid'].includes(invoice.status)).length;
    if (pendingBills) add('patient-bills', 'Bills need your attention', `${pendingBills} invoice${pendingBills === 1 ? '' : 's'} await payment.`, '/patient/billing');
  } else if (user.role === 'DOCTOR') {
    const appointments = demoListAppointments()
      .filter((appointment) => appointment.date >= today && !['Cancelled', 'Completed'].includes(appointment.status))
      .sort((left, right) => `${left.date} ${left.time}`.localeCompare(`${right.date} ${right.time}`));
    if (appointments.length) {
      const next = appointments[0];
      add(`doctor-appointment-${next.id}`, 'Upcoming patient visit', `Your next appointment is ${next.date} at ${next.time}.`, '/doctor/schedule');
    }
  } else if (user.role === 'RECEPTIONIST') {
    const waiting = demoListAppointments().filter((appointment) =>
      appointment.date === today && ['Scheduled', 'Confirmed'].includes(appointment.status),
    ).length;
    if (waiting) add('reception-queue', 'Patients waiting for check-in', `${waiting} appointment${waiting === 1 ? '' : 's'} scheduled for today need attention.`, '/reception/appointments');
    const pendingInvoices = Object.values(state.invoices).flat().filter((invoice) => !['PAID', 'Paid'].includes(invoice.status)).length;
    if (pendingInvoices) add('reception-billing', 'Pending invoices', `${pendingInvoices} invoice${pendingInvoices === 1 ? '' : 's'} await payment recording.`, '/reception/billing');
  } else {
    let accounts = [];
    try {
      accounts = JSON.parse(localStorage.getItem('sebasethu-demo-accounts') || '[]');
    } catch {
      accounts = [];
    }
    const pendingDoctors = accounts.filter((account) => account.role === 'DOCTOR' && account.approvalStatus === 'PENDING').length;
    if (pendingDoctors) add('doctor-approvals', 'Doctor registrations need review', `${pendingDoctors} doctor account${pendingDoctors === 1 ? '' : 's'} await verification.`, '/admin/doctor-approvals');
    const pendingInvoices = Object.values(state.invoices).flat().filter((invoice) => !['PAID', 'Paid'].includes(invoice.status)).length;
    if (pendingInvoices) add('admin-billing', 'Pending invoices', `${pendingInvoices} invoice${pendingInvoices === 1 ? '' : 's'} await payment recording.`, '/billing');
  }
  return notifications;
}

export function demoCreateDepartment(department) {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') throw new Error('Only an administrator may add a department.');
  const name = String(department.name || '').trim();
  if (!name || !String(department.description || '').trim()) {
    throw new Error('Enter a department name and description.');
  }
  return updateState((state) => {
    if (state.departments.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('A department with this name already exists.');
    }
    const created = { ...department, id: Date.now(), name };
    state.departments.push(created);
    recordDemoAuditEvent({
      action: 'Department added',
      entityType: 'Department',
      entityId: created.id,
      summary: `${created.name} was added to the hospital directory.`,
    });
    return created;
  });
}

export function demoListAppointments() {
  const state = readState();
  const user = getDemoUser();
  let appointments = [...state.appointments];
  if (user?.role === 'DOCTOR') {
    appointments = appointments.filter((item) => Number(item.doctor?.id) === Number(user.doctorId || user.id));
  } else if (user?.role === 'PATIENT') {
    const ids = new Set((state.linkedPatients[user.id] || [{ id: user.patientId }]).map((patient) => Number(patient.id)));
    appointments = appointments.filter((item) => ids.has(Number(item.patient?.id)));
  } else if (!user || !['ADMIN', 'RECEPTIONIST'].includes(user.role)) {
    return [];
  }
  return appointments.map((appointment) => {
    const availability = state.doctorAvailability[appointment.doctor?.id];
    return availability ? {
      ...appointment,
      doctor: { ...appointment.doctor, ...availability, availability: availability.workingDays },
    } : appointment;
  });
}

function validateDoctorSlot(state, doctorId, date, time) {
  const availability = state.doctorAvailability[doctorId];
  if (!availability) return;
  const weekday = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' });
  if (!availability.workingDays.includes(weekday) || availability.leaveDates.includes(date)) {
    throw new Error('The doctor is not available on the selected date.');
  }
  const [startHour, startMinute] = availability.startTime.split(':').map(Number);
  const [timeHour, timeMinute] = time.split(':').map(Number);
  const start = startHour * 60 + startMinute;
  const selected = timeHour * 60 + timeMinute;
  const end = availability.endTime.split(':').map(Number).reduce((hours, minutes) => hours * 60 + minutes, 0);
  if (selected < start || selected + Number(availability.slotMinutes) > end || (selected - start) % Number(availability.slotMinutes) !== 0) {
    throw new Error("The selected time is outside the doctor's available appointment slots.");
  }
}

export function demoCreateAppointment(request) {
  const user = getDemoUser();
  if (user?.role !== 'PATIENT') throw new Error('Only a patient account can request an appointment in this workflow.');
  return updateState((state) => {
    assertPatientProfileAccess(user, state, request.patientId);
    const patient = state.patients.find((item) => Number(item.id) === Number(request.patientId));
    const doctor = demoListDoctors().find((item) => Number(item.id) === Number(request.doctorId));
    if (!patient || !doctor) throw new Error('Choose a valid demo patient and doctor.');
    if (new Date(`${request.date}T${request.time}`) <= new Date()) throw new Error('Choose a future date and time.');
    validateDoctorSlot(state, doctor.id, request.date, request.time);
    const duplicate = state.appointments.some((item) =>
      Number(item.doctor?.id) === Number(doctor.id) &&
      item.date === request.date &&
      item.time === request.time &&
      item.status !== 'Cancelled',
    );
    if (duplicate) throw new Error('That doctor is already booked for this demo time slot.');
    const created = {
      ...request,
      id: Date.now(),
      patient: { ...patient },
      doctor: { ...doctor },
      status: 'Scheduled',
      emailNotificationStatus: 'NOT_SENT_DEMO',
    };
    state.appointments.push(created);
    return created;
  });
}

export function demoCreateStaffAppointment(request) {
  const user = getDemoUser();
  if (!['ADMIN', 'RECEPTIONIST'].includes(user?.role)) {
    throw new Error("Only reception or administrator accounts can book appointments on a patient's behalf.");
  }
  return updateState((state) => {
    const patient = state.patients.find((item) => Number(item.id) === Number(request.patientId));
    const doctor = demoListDoctors().find((item) => Number(item.id) === Number(request.doctorId));
    if (!patient || !doctor) throw new Error('Choose a valid patient and doctor.');
    if (request.date < dateOffset(0)) throw new Error('Choose today or a future appointment date.');
    validateDoctorSlot(state, doctor.id, request.date, request.time);
    if (state.appointments.some((item) =>
      Number(item.doctor?.id) === Number(doctor.id) &&
      item.date === request.date &&
      item.time === request.time &&
      item.status !== 'Cancelled',
    )) {
      throw new Error('That doctor is already booked for this time slot.');
    }
    const created = {
      ...request,
      id: Date.now(),
      patient: { ...patient },
      doctor: { ...doctor },
      status: 'Scheduled',
      emailNotificationStatus: 'NOT_SENT_DEMO',
    };
    state.appointments.push(created);
    return created;
  });
}

export function demoCheckInAppointment(id) {
  const user = getDemoUser();
  if (user?.role !== 'RECEPTIONIST') throw new Error('Only reception accounts can check in patients.');
  return updateState((state) => {
    const appointment = state.appointments.find((item) => Number(item.id) === Number(id));
    if (!appointment) throw new Error('Appointment not found.');
    if (appointment.date !== dateOffset(0)) throw new Error("Only today's appointments can be checked in.");
    if (!['Scheduled', 'Confirmed'].includes(appointment.status)) throw new Error('This appointment cannot be checked in.');
    appointment.status = 'Checked In';
    appointment.checkedInAt = new Date().toISOString();
    return appointment;
  });
}

export function demoRescheduleStaffAppointment(id, changes) {
  const user = getDemoUser();
  if (user?.role !== 'RECEPTIONIST') throw new Error('Only reception accounts can reschedule appointments for patients.');
  return updateState((state) => {
    const appointment = state.appointments.find((item) => Number(item.id) === Number(id));
    if (!appointment) throw new Error('Appointment not found.');
    if (['Completed', 'Cancelled'].includes(appointment.status)) throw new Error('Completed or cancelled appointments cannot be rescheduled.');
    if (changes.date < dateOffset(0)) throw new Error('Choose today or a future appointment date.');
    validateDoctorSlot(state, appointment.doctor?.id, changes.date, changes.time);
    if (state.appointments.some((item) =>
      Number(item.id) !== Number(id) &&
      Number(item.doctor?.id) === Number(appointment.doctor?.id) &&
      item.date === changes.date &&
      item.time === changes.time &&
      item.status !== 'Cancelled',
    )) {
      throw new Error('That doctor is already booked for this time slot.');
    }
    appointment.date = changes.date;
    appointment.time = changes.time;
    appointment.status = 'Scheduled';
    return appointment;
  });
}

export function demoUpdateAppointment(id, status) {
  const user = getDemoUser();
  if (!user) throw new Error('Sign in to update a demo appointment.');
  return updateState((state) => {
    const appointment = state.appointments.find((item) => Number(item.id) === Number(id));
    if (!appointment) throw new Error('Demo appointment not found.');
    if (user.role === 'PATIENT') {
      assertPatientProfileAccess(user, state, appointment.patient?.id);
      if (status === 'Cancelled' && (
        ['Completed', 'Cancelled'].includes(appointment.status) ||
        new Date(`${appointment.date}T${appointment.time}`) <= new Date()
      )) {
        throw new Error('Only upcoming, active appointments can be cancelled.');
      }
    }
    else if (user.role === 'DOCTOR' && Number(appointment.doctor?.id) !== Number(user.doctorId || user.id)) {
      throw new Error('This appointment is not assigned to your doctor account.');
    } else if (!['ADMIN', 'RECEPTIONIST', 'DOCTOR'].includes(user.role)) {
      throw new Error('Your account cannot update this appointment.');
    }
    if (!['Scheduled', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      throw new Error('Choose a valid appointment status.');
    }
    appointment.status = status;
    return appointment;
  });
}

export function demoRescheduleAppointment(id, changes) {
  const user = getDemoUser();
  if (user?.role !== 'PATIENT') throw new Error('Only a patient account may reschedule appointments.');
  return updateState((state) => {
    const appointment = state.appointments.find((item) => Number(item.id) === Number(id));
    if (!appointment) throw new Error('Demo appointment not found.');
    assertPatientProfileAccess(user, state, appointment.patient?.id);
    if (new Date(`${appointment.date}T${appointment.time}`) <= new Date() || appointment.status === 'Cancelled' || appointment.status === 'Completed') {
      throw new Error('Only upcoming, active appointments can be rescheduled.');
    }
    if (new Date(`${changes.date}T${changes.time}`) <= new Date()) {
      throw new Error('Choose a future date and time for your appointment.');
    }
    validateDoctorSlot(state, appointment.doctor?.id, changes.date, changes.time);
    if (state.appointments.some((item) =>
      Number(item.id) !== Number(id) &&
      Number(item.doctor?.id) === Number(appointment.doctor?.id) &&
      item.date === changes.date &&
      item.time === changes.time &&
      item.status !== 'Cancelled',
    )) {
      throw new Error('That doctor is already booked for this demo time slot.');
    }
    appointment.date = changes.date;
    appointment.time = changes.time;
    appointment.status = 'Scheduled';
    return appointment;
  });
}

function getDoctorId(user) {
  if (user?.role !== 'DOCTOR') throw new Error('Sign in with a doctor account to access clinical records.');
  return Number(user.doctorId || user.id);
}

export function demoListDoctorSchedule() {
  const user = getDemoUser();
  const doctorId = getDoctorId(user);
  return demoListAppointments()
    .filter((appointment) => Number(appointment.doctor?.id) === doctorId)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

export function demoGetDoctorAvailability() {
  const user = getDemoUser();
  const doctorId = getDoctorId(user);
  const state = readState();
  const saved = state.doctorAvailability[doctorId];
  if (saved) return { ...saved, leaveDates: [...(saved.leaveDates || [])] };
  const doctor = demoListDoctors().find((item) => Number(item.id) === doctorId);
  return {
    workingDays: doctor?.availability || [],
    startTime: '09:00',
    endTime: '17:00',
    slotMinutes: 30,
    leaveDates: [],
  };
}

export function demoUpdateDoctorAvailability(changes) {
  const user = getDemoUser();
  const doctorId = getDoctorId(user);
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  if (!Array.isArray(changes.workingDays) || changes.workingDays.some((day) => !weekdays.includes(day))) {
    throw new Error('Choose valid working days.');
  }
  if (!/^\d{2}:\d{2}$/.test(changes.startTime) || !/^\d{2}:\d{2}$/.test(changes.endTime) || changes.startTime >= changes.endTime) {
    throw new Error('Choose a valid start and end time.');
  }
  if (![15, 20, 30, 45, 60].includes(Number(changes.slotMinutes))) {
    throw new Error('Choose an appointment slot length from the available options.');
  }
  if (!Array.isArray(changes.leaveDates) || changes.leaveDates.some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
    throw new Error('Enter leave dates using the calendar.');
  }
  return updateState((state) => {
    const updated = {
      workingDays: [...new Set(changes.workingDays)],
      startTime: changes.startTime,
      endTime: changes.endTime,
      slotMinutes: Number(changes.slotMinutes),
      leaveDates: [...new Set(changes.leaveDates)],
    };
    state.doctorAvailability[doctorId] = updated;
    return updated;
  });
}

export function demoListDoctorPatients(search = '') {
  const doctorId = getDoctorId(getDemoUser());
  const state = readState();
  const patientIds = new Set(state.appointments
    .filter((appointment) => Number(appointment.doctor?.id) === doctorId)
    .map((appointment) => Number(appointment.patient?.id)));
  const normalizedSearch = String(search).trim().toLowerCase();
  return [...patientIds]
    .map((patientId) => state.patients.find((patient) => Number(patient.id) === patientId))
    .filter(Boolean)
    .filter((patient) => !normalizedSearch || `${patient.name} ${patient.phone}`.toLowerCase().includes(normalizedSearch))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function demoGetDoctorPatientChart(patientId) {
  const user = getDemoUser();
  const doctorId = getDoctorId(user);
  const state = readState();
  const hasAccess = state.appointments.some((appointment) =>
    Number(appointment.doctor?.id) === doctorId && Number(appointment.patient?.id) === Number(patientId),
  );
  if (!hasAccess) throw new Error('This patient has no appointment assigned to your doctor account.');
  const patient = state.patients.find((item) => Number(item.id) === Number(patientId));
  if (!patient) throw new Error('Patient chart not found.');
  return {
    patient: { ...patient, ...(state.patientProfiles[patientId] || {}) },
    appointments: state.appointments
      .filter((appointment) => Number(appointment.doctor?.id) === doctorId && Number(appointment.patient?.id) === Number(patientId))
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    medicalHistory: [...(state.medicalHistory[patientId] || [])],
    prescriptions: state.prescriptions.filter((prescription) =>
      Number(prescription.patient?.id) === Number(patientId) && Number(prescription.doctor?.id) === doctorId,
    ),
    labReports: [...(state.labReports[patientId] || [])],
  };
}

export function demoSaveDoctorConsultation(appointmentId, consultation) {
  const user = getDemoUser();
  const doctorId = getDoctorId(user);
  if (!consultation.notes?.trim() || !consultation.diagnosis?.trim()) {
    throw new Error('Add consultation notes and a diagnosis before completing the visit.');
  }
  return updateState((state) => {
    const appointment = state.appointments.find((item) => Number(item.id) === Number(appointmentId));
    if (!appointment || Number(appointment.doctor?.id) !== doctorId) {
      throw new Error('This appointment is not assigned to your doctor account.');
    }
    if (['Cancelled', 'Completed'].includes(appointment.status)) {
      throw new Error('This appointment cannot be completed again.');
    }
    const patientId = Number(appointment.patient?.id);
    const patient = state.patients.find((item) => Number(item.id) === patientId);
    if (!patient) throw new Error('Patient chart not found.');
    const createdAt = dateOffset(0);
    const saved = {
      id: Date.now(),
      appointmentId: appointment.id,
      patientId,
      doctorId,
      date: createdAt,
      notes: consultation.notes.trim(),
      diagnosis: consultation.diagnosis.trim(),
      labTests: (consultation.labTests || []).map((name) => String(name).trim()).filter(Boolean),
    };
    state.consultations[appointment.id] = saved;
    const history = state.medicalHistory[patientId] || [];
    history.unshift({
      id: saved.id,
      date: createdAt,
      type: 'Visit',
      title: saved.diagnosis,
      detail: saved.notes,
    });
    state.medicalHistory[patientId] = history;
    const reports = state.labReports[patientId] || [];
    saved.labTests.forEach((name, index) => reports.unshift({
      id: saved.id + index + 1,
      name,
      date: createdAt,
      status: 'Ordered',
    }));
    state.labReports[patientId] = reports;
    if (consultation.createPrescription && consultation.medicines?.length) {
      state.prescriptions.unshift({
        id: saved.id,
        patient: { ...patient },
        doctor: { ...appointment.doctor },
        createdAt,
        diagnosis: saved.diagnosis,
        notes: consultation.prescriptionNotes || '',
        medicines: consultation.medicines.map((medicine) => ({ ...medicine })),
        auditHistory: [],
      });
    }
    appointment.status = 'Completed';
    return { consultation: saved, appointment };
  });
}

export function demoScheduleDoctorFollowUp(appointmentId, slot) {
  const user = getDemoUser();
  const doctorId = getDoctorId(user);
  return updateState((state) => {
    const sourceAppointment = state.appointments.find((item) => Number(item.id) === Number(appointmentId));
    if (!sourceAppointment || Number(sourceAppointment.doctor?.id) !== doctorId || sourceAppointment.status !== 'Completed') {
      throw new Error('Follow-up scheduling is available only for your completed appointments.');
    }
    if (new Date(`${slot.date}T${slot.time}`) <= new Date()) throw new Error('Choose a future date and time.');
    validateDoctorSlot(state, doctorId, slot.date, slot.time);
    if (state.appointments.some((item) =>
      Number(item.doctor?.id) === doctorId &&
      item.date === slot.date &&
      item.time === slot.time &&
      item.status !== 'Cancelled',
    )) {
      throw new Error("The doctor already has an appointment at this time.");
    }
    const created = {
      id: Date.now(),
      date: slot.date,
      time: slot.time,
      patient: { ...sourceAppointment.patient },
      doctor: { ...sourceAppointment.doctor },
      department: sourceAppointment.department,
      status: 'Scheduled',
      emailNotificationStatus: 'NOT_SENT_DEMO',
      followUpFor: sourceAppointment.id,
    };
    state.appointments.push(created);
    return created;
  });
}

export function demoGetDoctorProfile() {
  const user = getDemoUser();
  const doctorId = getDoctorId(user);
  const doctor = demoListDoctors().find((item) => Number(item.id) === doctorId);
  return { ...doctor, email: user.email, phone: user.phone || '', professionalBiography: user.professionalBiography || '' };
}

export function demoUpdateDoctorProfile(changes) {
  const user = getDemoUser();
  const doctorId = getDoctorId(user);
  const updates = {
    phone: String(changes.phone || '').trim(),
    professionalBiography: String(changes.professionalBiography || '').trim(),
  };
  return updateState((state) => {
    const accounts = JSON.parse(localStorage.getItem('sebasethu-demo-accounts') || '[]');
    const updatedAccounts = accounts.map((account) => Number(account.id) === Number(user.id)
      ? { ...account, ...updates }
      : account);
    localStorage.setItem('sebasethu-demo-accounts', JSON.stringify(updatedAccounts));
    localStorage.setItem('sebasethu-demo-session', JSON.stringify({ ...user, ...updates }));
    state.doctors = state.doctors.map((doctor) => Number(doctor.id) === doctorId ? { ...doctor, ...updates } : doctor);
    return { ...demoListDoctors().find((doctor) => Number(doctor.id) === doctorId), ...updates, email: user.email };
  });
}

export function demoListPrescriptions() {
  const user = getDemoUser();
  const state = readState();
  if (user?.role === 'ADMIN' || user?.role === 'RECEPTIONIST') return state.prescriptions;
  if (user?.role === 'DOCTOR') return state.prescriptions.filter((item) => Number(item.doctor?.id) === Number(user.doctorId || user.id));
  if (user?.role === 'PATIENT') {
    const patientIds = new Set((state.linkedPatients[user.id] || [{ id: user.patientId }]).map((patient) => Number(patient.id)));
    return state.prescriptions.filter((item) => patientIds.has(Number(item.patient?.id)));
  }
  return [];
}

export function demoCreatePrescription(request) {
  const user = getDemoUser();
  if (user?.role !== 'DOCTOR') throw new Error('Only doctor demo accounts can author prescriptions.');
  return updateState((state) => {
    const patient = state.patients.find((item) => Number(item.id) === Number(request.patientId));
    if (!patient) throw new Error('Choose a valid demo patient.');
    const doctorId = Number(user.doctorId || user.id);
    const hasCompletedVisit = state.appointments.some((appointment) =>
      Number(appointment.patient?.id) === Number(request.patientId) &&
      Number(appointment.doctor?.id) === doctorId &&
      appointment.status === 'Completed',
    );
    if (!hasCompletedVisit) throw new Error('A prescription can only be created for a patient with your completed appointment.');
    const doctor = demoListDoctors().find((item) => Number(item.id) === doctorId);
    const created = {
      id: Date.now(),
      patient: { ...patient },
      doctor: { ...doctor, name: doctor?.name || user.name },
      createdAt: new Date().toISOString().slice(0, 10),
      notes: request.notes || '',
      medicines: request.medicines || [],
      auditHistory: [],
    };
    state.prescriptions.unshift(created);
    return created;
  });
}

export function demoUpdatePrescription(id, changes) {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') throw new Error('Only an admin demo account can edit prescription records.');
  return updateState((state) => {
    const prescription = state.prescriptions.find((item) => Number(item.id) === Number(id));
    if (!prescription) throw new Error('Demo prescription not found.');
    const before = JSON.stringify({ medicines: prescription.medicines, notes: prescription.notes });
    prescription.notes = changes.notes || '';
    prescription.medicines = changes.medicines || [];
    prescription.auditHistory = [
      ...(prescription.auditHistory || []),
      {
        id: Date.now(),
        editorName: user.name,
        editedAt: new Date().toISOString(),
        summary: before === JSON.stringify({ medicines: prescription.medicines, notes: prescription.notes })
          ? 'Reviewed; no field changes.'
          : 'Prescription fields updated in demo mode.',
      },
    ];
    recordDemoAuditEvent({
      action: 'Prescription edited',
      entityType: 'Prescription',
      entityId: id,
      summary: `Prescription ${id} for ${prescription.patient?.name || 'a patient'} was edited.`,
    });
    return prescription;
  });
}

export function demoCreateUrgentRequest(request) {
  const user = getDemoUser();
  if (user?.role !== 'PATIENT') throw new Error('Sign in with a patient account to submit an urgent-help demo request.');
  return updateState((state) => {
    const created = {
      ...request,
      id: Date.now(),
      status: 'DEMO_ONLY_NOT_SENT',
      acknowledgement: 'Saved only in this browser demo; hospital staff were not notified.',
      createdAt: new Date().toISOString(),
    };
    state.urgentRequests.unshift(created);
    return created;
  });
}

export function demoListUrgentRequests() {
  const user = getDemoUser();
  if (user?.role !== 'PATIENT') return [];
  return readState().urgentRequests;
}

export function demoCreatePatient(patient) {
  const user = getDemoUser();
  if (!['ADMIN', 'RECEPTIONIST'].includes(user?.role)) {
    throw new Error('Only hospital staff can register a patient from this workspace.');
  }
  return updateState((state) => {
    const created = { ...patient, id: Date.now(), registeredAt: dateOffset(0) };
    state.patients.push(created);
    return created;
  });
}

export function demoGetAdminOverview() {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') throw new Error('Only an administrator may view hospital analytics.');
  const state = readState();
  const today = dateOffset(0);
  const todayAppointments = state.appointments
    .filter((appointment) => appointment.date === today && appointment.status !== 'Cancelled')
    .sort((left, right) => String(left.time).localeCompare(String(right.time)));
  const weeklyAppointments = Array.from({ length: 7 }, (_, index) => {
    const date = dateOffset(index - 6);
    const visits = state.appointments.filter((appointment) => appointment.date === date);
    return {
      day: new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      scheduled: visits.filter((appointment) => appointment.status !== 'Cancelled').length,
      completed: visits.filter((appointment) => appointment.status === 'Completed').length,
    };
  });
  const patientIdsByDepartment = new Map();
  state.appointments.forEach((appointment) => {
    const department = appointment.department || appointment.doctor?.specialization || 'Other';
    const patientId = appointment.patient?.id;
    if (!patientIdsByDepartment.has(department)) patientIdsByDepartment.set(department, new Set());
    if (patientId != null) patientIdsByDepartment.get(department).add(patientId);
  });
  const availableBeds = state.beds.filter((bed) => bed.status === 'AVAILABLE').length;
  return {
    stats: [
      { label: 'Total patients', value: String(state.patients.length), change: 'Demo records', tone: 'teal' },
      { label: 'Active doctors', value: String(state.doctors.length), change: 'Directory records', tone: 'navy' },
      { label: "Today's appointments", value: String(todayAppointments.length), change: `${todayAppointments.filter((item) => item.status !== 'Completed').length} still scheduled`, tone: 'amber' },
      { label: 'Available beds', value: String(availableBeds), change: `of ${state.beds.length} registered beds`, tone: 'green' },
    ],
    weeklyAppointments,
    departmentPatients: [...patientIdsByDepartment].map(([department, patients]) => ({ department, patients: patients.size })),
    appointments: todayAppointments.map((appointment) => ({
      time: appointment.time,
      patient: appointment.patient?.name || 'Patient',
      doctor: appointment.doctor?.name || 'Doctor',
      type: appointment.department || appointment.doctor?.specialization || 'Consultation',
      status: appointment.status,
    })),
  };
}

export function demoGetAdminReport(fromDate, toDate) {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') throw new Error('Only an administrator may view hospital reports.');
  if (!fromDate || !toDate || fromDate > toDate) throw new Error('Choose a valid date range.');
  const state = readState();
  const inRange = (date) => Boolean(date && date >= fromDate && date <= toDate);
  const appointments = state.appointments.filter((appointment) => inRange(appointment.date));
  const paidInvoices = Object.values(state.invoices).flat().filter((invoice) => invoice.status === 'Paid' && inRange(invoice.date));
  const registrations = state.patients.filter((patient) => inRange(patient.registeredAt));
  const statusNames = ['Completed', 'Scheduled', 'Confirmed', 'Checked In', 'Cancelled'];
  const appointmentStatuses = statusNames
    .map((status) => ({ status, total: appointments.filter((appointment) => appointment.status === status).length }))
    .filter((item) => item.total > 0);
  const byMonth = new Map();
  registrations.forEach((patient) => {
    const monthKey = patient.registeredAt.slice(0, 7);
    byMonth.set(monthKey, (byMonth.get(monthKey) || 0) + 1);
  });
  const departmentRevenue = new Map();
  paidInvoices.forEach((invoice) => {
    const appointment = state.appointments.find((item) => Number(item.id) === Number(invoice.appointmentId));
    const department = appointment?.department || appointment?.doctor?.specialization || 'Unassigned';
    departmentRevenue.set(department, (departmentRevenue.get(department) || 0) + Number(invoice.amount || 0));
  });
  return {
    fromDate,
    toDate,
    registeredPatients: registrations.length,
    completedAppointments: appointments.filter((appointment) => appointment.status === 'Completed').length,
    recordedRevenue: paidInvoices.reduce((total, invoice) => total + Number(invoice.amount || 0), 0),
    registrations: [...byMonth].sort(([left], [right]) => left.localeCompare(right)).map(([month, patients]) => ({
      month: new Date(`${month}-01T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      patients,
    })),
    appointmentStatuses,
    revenueByDepartment: [...departmentRevenue].map(([department, revenue]) => ({ department, revenue })),
  };
}

export function demoListHospitalServices() {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') throw new Error('Only an administrator may manage hospital services.');
  return readState().services;
}

export function demoSaveHospitalService(service, id) {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') throw new Error('Only an administrator may manage hospital services.');
  const name = String(service.name || '').trim();
  const price = Number(service.price);
  if (!name || !Number.isFinite(price) || price <= 0) throw new Error('Enter a service name and a price greater than zero.');
  return updateState((state) => {
    const department = state.departments.find((item) => Number(item.id) === Number(service.departmentId));
    if (!department) throw new Error('Choose a valid department for this service.');
    const duplicate = state.services.some((item) => item.name.toLowerCase() === name.toLowerCase()
      && Number(item.id) !== Number(id));
    if (duplicate) throw new Error('A service with this name already exists.');
    if (id == null) {
      const created = {
        id: Date.now(),
        name,
        departmentId: department.id,
        departmentName: department.name,
        price,
        currency: 'INR',
      };
      state.services.push(created);
      recordDemoAuditEvent({
        action: 'Hospital service added',
        entityType: 'Hospital service',
        entityId: created.id,
        summary: `${created.name} was added to ${department.name} at ₹${price}.`,
      });
      return created;
    }
    const existing = state.services.find((item) => Number(item.id) === Number(id));
    if (!existing) throw new Error('The selected service was not found.');
    Object.assign(existing, { name, departmentId: department.id, departmentName: department.name, price });
    recordDemoAuditEvent({
      action: 'Hospital service updated',
      entityType: 'Hospital service',
      entityId: id,
      summary: `${existing.name} in ${department.name} was updated to ₹${price}.`,
    });
    return existing;
  });
}

export function demoDeletePatient(id) {
  updateState((state) => {
    state.patients = state.patients.filter((patient) => Number(patient.id) !== Number(id));
    return undefined;
  });
}

export function demoListWards() {
  return readState().wards;
}

export function demoListBeds() {
  return readState().beds;
}

export function demoListStaffInvoices() {
  const user = getDemoUser();
  if (!['ADMIN', 'RECEPTIONIST'].includes(user?.role)) throw new Error('Only hospital staff can view the billing register.');
  const state = readState();
  return Object.values(state.invoices).flat().sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

export function demoCreateInvoice(request) {
  const user = getDemoUser();
  if (!['ADMIN', 'RECEPTIONIST'].includes(user?.role)) throw new Error('Only hospital staff can create invoices.');
  return updateState((state) => {
    const patient = state.patients.find((item) => Number(item.id) === Number(request.patientId));
    if (!patient) throw new Error('Choose a valid patient for this invoice.');
    const amount = Number(request.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an invoice amount greater than zero.');
    if (request.appointmentId) {
      const appointment = state.appointments.find((item) => Number(item.id) === Number(request.appointmentId));
      if (!appointment || Number(appointment.patient?.id) !== Number(patient.id)) {
        throw new Error('The selected appointment does not belong to this patient.');
      }
    }
    const id = Date.now();
    const created = {
      id,
      patientId: patient.id,
      appointmentId: request.appointmentId ? Number(request.appointmentId) : null,
      invoiceNumber: `DEMO-INV-${id}`,
      date: dateOffset(0),
      description: String(request.description || '').trim(),
      amount,
      status: 'Pending',
    };
    state.invoices[patient.id] = [...(state.invoices[patient.id] || []), created];
    return created;
  });
}

export function demoMarkInvoicePaid(id, paymentMethod) {
  const user = getDemoUser();
  if (!['ADMIN', 'RECEPTIONIST'].includes(user?.role)) throw new Error('Only hospital staff can record invoice payments.');
  return updateState((state) => {
    const invoice = Object.values(state.invoices).flat().find((item) => Number(item.id) === Number(id));
    if (!invoice) throw new Error('Invoice not found.');
    if (invoice.status === 'Paid') throw new Error('This invoice is already marked paid.');
    invoice.status = 'Paid';
    invoice.paymentMethod = String(paymentMethod || '').trim() || 'Not recorded';
    invoice.paidAt = new Date().toISOString();
    return invoice;
  });
}

export function demoCreateWard(ward) {
  return updateState((state) => {
    const created = { ...ward, id: Date.now() };
    state.wards.push(created);
    return created;
  });
}

export function demoCreateBed(bed) {
  return updateState((state) => {
    const ward = state.wards.find((item) => Number(item.id) === Number(bed.wardId));
    if (!ward) throw new Error('Choose a valid demo ward.');
    if (state.beds.some((item) => item.bedNumber.toLowerCase() === bed.bedNumber.toLowerCase())) {
      throw new Error('That bed number already exists.');
    }
    const created = {
      ...bed,
      id: Date.now(),
      wardId: ward.id,
      wardName: ward.name,
      status: 'AVAILABLE',
      patientId: null,
      patientName: null,
    };
    state.beds.push(created);
    return created;
  });
}

export function demoAssignPatient(bedId, patientId) {
  return updateState((state) => {
    const bed = state.beds.find((item) => Number(item.id) === Number(bedId));
    const patient = state.patients.find((item) => Number(item.id) === Number(patientId));
    if (!bed || bed.status !== 'AVAILABLE') throw new Error('This demo bed is not available.');
    if (!patient) throw new Error('Choose a valid demo patient.');
    bed.status = 'OCCUPIED';
    bed.patientId = patient.id;
    bed.patientName = patient.name;
    return bed;
  });
}

export function demoReleaseBed(bedId) {
  return updateState((state) => {
    const bed = state.beds.find((item) => Number(item.id) === Number(bedId));
    if (!bed || bed.status !== 'OCCUPIED') throw new Error('This demo bed is not occupied.');
    bed.status = 'AVAILABLE';
    bed.patientId = null;
    bed.patientName = null;
    return bed;
  });
}

export function demoUpdateBedStatus(bedId, status) {
  return updateState((state) => {
    const bed = state.beds.find((item) => Number(item.id) === Number(bedId));
    if (!bed) throw new Error('Demo bed not found.');
    if (!['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].includes(status)) throw new Error('Invalid demo bed status.');
    bed.status = status;
    if (status !== 'OCCUPIED') {
      bed.patientId = null;
      bed.patientName = null;
    }
    return bed;
  });
}

export function demoRemoveBed(bedId) {
  return updateState((state) => {
    state.beds = state.beds.filter((item) => Number(item.id) !== Number(bedId));
  });
}

export function demoRemoveWard(wardId) {
  return updateState((state) => {
    if (state.beds.some((bed) => Number(bed.wardId) === Number(wardId))) throw new Error('Remove the ward beds before removing this ward.');
    state.wards = state.wards.filter((ward) => Number(ward.id) !== Number(wardId));
  });
}
