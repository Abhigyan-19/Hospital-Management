const STORAGE_KEY = 'sebasethu-demo-accounts';
const RESET_KEY = 'sebasethu-demo-password-reset';
const AUDIT_KEY = 'sebasethu-demo-audit-log';
const HOSPITAL_SETTINGS_KEY = 'sebasethu-demo-hospital-settings';
const DEMO_PASSWORD = 'demo123';
const defaultHospitalSettings = {
  name: 'SEBASETHU Community Hospital',
  hours: 'Monday to Saturday, 8:00 AM to 8:00 PM',
  contactPhone: '+91 80000 12345',
  emergencyPhone: '112',
  address: 'Hospital location to be confirmed',
};

const starterAccounts = [
  { id: 1, name: 'Hospital Administrator', email: 'admin@sebasethu.health', password: DEMO_PASSWORD, role: 'ADMIN' },
  { id: 201, name: 'Dr. Anika Sharma', email: 'doctor@sebasethu.health', password: DEMO_PASSWORD, role: 'DOCTOR', doctorId: 201, specialization: 'Cardiology', approvalStatus: 'APPROVED' },
  { id: 101, name: 'Maya Iyer', email: 'patient@sebasethu.health', password: DEMO_PASSWORD, role: 'PATIENT', patientId: 101 },
  { id: 2, name: 'Reception Team', email: 'reception@sebasethu.health', password: DEMO_PASSWORD, role: 'RECEPTIONIST' },
];

function readAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(saved) && saved.length ? saved : starterAccounts;
  } catch {
    return starterAccounts;
  }
}

function writeAccounts(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export async function demoLogin({ email, password, role }) {
  const account = readAccounts().find((candidate) =>
    candidate.email.toLowerCase() === email.trim().toLowerCase() &&
    candidate.password === password &&
    candidate.role === role,
  );
  if (!account) throw new Error('Demo sign-in failed. Check the email, password, and selected account type.');
  if (account.active === false) throw new Error('This account is inactive. Contact a hospital administrator.');
  if (account.role === 'DOCTOR' && account.approvalStatus !== 'APPROVED') {
    throw new Error(account.approvalStatus === 'REJECTED'
      ? 'This doctor registration was not approved. Contact the hospital administrator.'
      : 'Your doctor account is pending verification by a hospital administrator.');
  }
  if (!localStorage.getItem(STORAGE_KEY)) writeAccounts(starterAccounts);
  const { password: ignoredPassword, ...user } = account;
  localStorage.setItem('sebasethu-demo-session', JSON.stringify(user));
  return { token: `demo-${user.role.toLowerCase()}-session`, user };
}

export async function demoRegister(details) {
  if (!['PATIENT', 'DOCTOR'].includes(details.role)) {
    throw new Error('Demo self-registration is available only for patients and doctors.');
  }
  const accounts = readAccounts();
  if (accounts.some((account) => account.email.toLowerCase() === details.email.trim().toLowerCase())) {
    throw new Error('An account with this email already exists.');
  }
  const created = {
    ...details,
    id: Date.now(),
    role: details.role,
    email: details.email.trim(),
    name: details.role === 'PATIENT' && details.patientRelationship === 'FAMILY'
      ? details.patientName
      : details.name,
    ...(details.role === 'PATIENT' ? { patientId: Date.now() } : { doctorId: Date.now() }),
    ...(details.role === 'DOCTOR' ? { approvalStatus: 'PENDING' } : {}),
    password: details.password,
  };
  writeAccounts([...accounts, created]);
  return {
    status: details.role === 'DOCTOR' ? 'PENDING' : 'REGISTERED',
    message: details.role === 'DOCTOR'
      ? 'Registration submitted. Your doctor account is pending verification; you can sign in after an administrator approves it.'
      : 'Demo account created. Sign in using the email and password you registered.',
  };
}

export function isDemoMode() {
  return import.meta.env.VITE_DEMO_MODE === 'true';
}

export function getDemoUser() {
  try {
    return JSON.parse(localStorage.getItem('sebasethu-demo-session') || 'null');
  } catch {
    return null;
  }
}

export async function demoPasswordReset(email) {
  const account = readAccounts().find((candidate) =>
    candidate.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!account) {
    return { message: 'If an account exists, demo reset instructions are available in this browser.' };
  }
  const token = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(RESET_KEY, JSON.stringify({
    email: account.email,
    token,
    expiresAt: Date.now() + 15 * 60 * 1000,
  }));
  return {
    message: 'Demo mode does not send email. Use this local reset link within 15 minutes.',
    resetUrl: `/reset-password?token=${encodeURIComponent(token)}`,
  };
}

export async function demoResetPassword(token, newPassword) {
  let reset;
  try {
    reset = JSON.parse(localStorage.getItem(RESET_KEY) || 'null');
  } catch {
    reset = null;
  }
  if (!reset || reset.token !== token || reset.expiresAt < Date.now()) {
    localStorage.removeItem(RESET_KEY);
    throw new Error('This demo reset link is invalid or has expired. Request a new one.');
  }
  const accounts = readAccounts();
  const account = accounts.find((candidate) => candidate.email === reset.email);
  if (!account) throw new Error('The account for this demo reset link was not found.');
  writeAccounts(accounts.map((candidate) => candidate.email === reset.email
    ? { ...candidate, password: newPassword }
    : candidate));
  localStorage.removeItem(RESET_KEY);
  return { message: 'Demo password updated. Sign in with your new password.' };
}

export async function demoChangePassword({ currentPassword, newPassword }) {
  const user = getDemoUser();
  if (!user) throw new Error('Sign in again before changing your password.');
  const accounts = readAccounts();
  const account = accounts.find((candidate) => candidate.id === user.id);
  if (!account || account.password !== currentPassword) {
    throw new Error('The current password is not correct.');
  }
  writeAccounts(accounts.map((candidate) => candidate.id === user.id
    ? { ...candidate, password: newPassword }
    : candidate));
  return { message: 'Demo password updated.' };
}

export async function demoListPendingDoctors() {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') {
    throw new Error('Only an administrator may view pending doctor registrations.');
  }
  const accounts = readAccounts()
    .filter((account) => account.role === 'DOCTOR' && account.approvalStatus === 'PENDING')
    .map(({ password, ...doctor }) => doctor);
  return accounts;
}

export async function demoReviewDoctor(id, approvalStatus) {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') {
    throw new Error('Only an administrator may review doctor registrations.');
  }
  if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
    throw new Error('Choose an approval or rejection decision.');
  }
  const accounts = readAccounts();
  const doctor = accounts.find((account) =>
    account.role === 'DOCTOR' && Number(account.id) === Number(id),
  );
  if (!doctor) throw new Error('The doctor registration was not found.');
  if (doctor.approvalStatus !== 'PENDING') {
    throw new Error('This doctor registration has already been reviewed.');
  }
  const updated = { ...doctor, approvalStatus };
  writeAccounts(accounts.map((account) => Number(account.id) === Number(id) ? updated : account));
  recordDemoAuditEvent({
    action: approvalStatus === 'APPROVED' ? 'Doctor approved' : 'Doctor registration rejected',
    entityType: 'Doctor account',
    entityId: id,
    summary: `${doctor.name} (${doctor.email}) was ${approvalStatus.toLowerCase()}.`,
  });
  const { password, ...safeDoctor } = updated;
  return safeDoctor;
}

function requireDemoAdmin() {
  const user = getDemoUser();
  if (user?.role !== 'ADMIN') throw new Error('Only a signed-in administrator may manage hospital settings and accounts.');
  return user;
}

function readDemoAuditLog() {
  try {
    const entries = JSON.parse(localStorage.getItem(AUDIT_KEY) || '[]');
    return Array.isArray(entries) ? entries : [];
  } catch {
    return [];
  }
}

export function recordDemoAuditEvent(event) {
  const actor = getDemoUser();
  const entry = {
    id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    actorName: actor?.name || 'Administrator',
    actorRole: actor?.role || 'ADMIN',
    action: event.action,
    entityType: event.entityType,
    entityId: String(event.entityId ?? ''),
    summary: event.summary,
    occurredAt: new Date().toISOString(),
  };
  localStorage.setItem(AUDIT_KEY, JSON.stringify([entry, ...readDemoAuditLog()].slice(0, 200)));
  return entry;
}

export async function demoListUsers() {
  requireDemoAdmin();
  return readAccounts().map(({ password, ...account }) => ({ ...account, active: account.active !== false }));
}

export async function demoSetUserActive(id, active) {
  const actor = requireDemoAdmin();
  if (typeof active !== 'boolean') throw new Error('Choose whether the account should be active.');
  const accounts = readAccounts();
  const target = accounts.find((account) => Number(account.id) === Number(id));
  if (!target) throw new Error('The selected account was not found.');
  if (!active && Number(target.id) === Number(actor.id)) throw new Error('You cannot deactivate your own administrator account.');
  const activeAdmins = accounts.filter((account) => account.role === 'ADMIN' && account.active !== false);
  if (!active && target.role === 'ADMIN' && activeAdmins.length <= 1) {
    throw new Error('The last active administrator account cannot be deactivated.');
  }
  const updated = { ...target, active };
  writeAccounts(accounts.map((account) => Number(account.id) === Number(id) ? updated : account));
  recordDemoAuditEvent({
    action: active ? 'Account activated' : 'Account deactivated',
    entityType: 'User account',
    entityId: id,
    summary: `${target.name} (${target.email}) was ${active ? 'activated' : 'deactivated'}.`,
  });
  const { password, ...safeAccount } = updated;
  return { ...safeAccount, active: safeAccount.active !== false };
}

export async function demoSetUserRole(id, role) {
  const actor = requireDemoAdmin();
  const allowedRoles = ['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'];
  if (!allowedRoles.includes(role)) throw new Error('Choose a valid hospital role.');
  if (Number(id) === Number(actor.id)) throw new Error('You cannot change your own administrator role.');
  const accounts = readAccounts();
  const target = accounts.find((account) => Number(account.id) === Number(id));
  if (!target) throw new Error('The selected account was not found.');
  if (role === 'DOCTOR' && (!target.doctorId || target.approvalStatus !== 'APPROVED')) {
    throw new Error('Only a verified doctor account can be assigned the doctor role.');
  }
  if (role === 'PATIENT' && !target.patientId) {
    throw new Error('This account does not have a linked patient profile.');
  }
  const activeAdmins = accounts.filter((account) => account.role === 'ADMIN' && account.active !== false);
  if (target.role === 'ADMIN' && target.active !== false && role !== 'ADMIN' && activeAdmins.length <= 1) {
    throw new Error('The last active administrator cannot be assigned a different role.');
  }
  const updated = { ...target, role };
  writeAccounts(accounts.map((account) => Number(account.id) === Number(id) ? updated : account));
  recordDemoAuditEvent({
    action: 'Account role changed',
    entityType: 'User account',
    entityId: id,
    summary: `${target.name} (${target.email}) role changed from ${target.role} to ${role}.`,
  });
  const { password, ...safeAccount } = updated;
  return { ...safeAccount, active: safeAccount.active !== false };
}

export async function demoListAuditLog() {
  requireDemoAdmin();
  return readDemoAuditLog();
}

export async function demoGetHospitalSettings() {
  requireDemoAdmin();
  try {
    const stored = JSON.parse(localStorage.getItem(HOSPITAL_SETTINGS_KEY) || 'null');
    return { ...defaultHospitalSettings, ...(stored || {}) };
  } catch {
    return { ...defaultHospitalSettings };
  }
}

export async function demoUpdateHospitalSettings(settings) {
  requireDemoAdmin();
  const next = Object.fromEntries(Object.keys(defaultHospitalSettings).map((key) => [key, String(settings[key] || '').trim()]));
  if (Object.values(next).some((value) => !value)) throw new Error('Complete all hospital contact and operating-hours fields.');
  localStorage.setItem(HOSPITAL_SETTINGS_KEY, JSON.stringify(next));
  recordDemoAuditEvent({
    action: 'Hospital settings updated',
    entityType: 'Hospital settings',
    entityId: 'hospital',
    summary: `Contact, emergency, operating hours, or identity settings were updated by ${getDemoUser()?.name || 'an administrator'}.`,
  });
  return next;
}
