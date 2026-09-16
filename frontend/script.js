const API_BASE_URL = 'http://localhost:8080';

const patientState = {
  list: [],
};

const doctorState = {
  list: [],
};

const elements = {
  appMessage: document.getElementById('app-message'),
  totalPatients: document.getElementById('total-patients'),
  totalDoctors: document.getElementById('total-doctors'),

  patientForm: document.getElementById('patient-form'),
  patientName: document.getElementById('patient-name'),
  patientAge: document.getElementById('patient-age'),
  patientGender: document.getElementById('patient-gender'),
  patientPhone: document.getElementById('patient-phone'),
  patientTableBody: document.getElementById('patient-table-body'),
  patientEmpty: document.getElementById('patient-empty-state'),
  patientSearch: document.getElementById('patient-search'),

  doctorForm: document.getElementById('doctor-form'),
  doctorName: document.getElementById('doctor-name'),
  doctorSpecialization: document.getElementById('doctor-specialization'),
  doctorExperience: document.getElementById('doctor-experience'),
  doctorTableBody: document.getElementById('doctor-table-body'),
  doctorEmpty: document.getElementById('doctor-empty-state'),
  doctorSearch: document.getElementById('doctor-search'),

  detailModal: document.getElementById('detail-modal'),
  modalTitle: document.getElementById('modal-title'),
  detailContent: document.getElementById('detail-content'),
  closeModal: document.getElementById('close-modal'),
};

function showMessage(message, type = 'success') {
  elements.appMessage.textContent = message;
  elements.appMessage.className = `status-message show ${type}`;
}

function clearMessage() {
  elements.appMessage.textContent = '';
  elements.appMessage.className = 'status-message';
}

function handleBackendUnavailable(error) {
  const message = 'Unable to connect to the backend. Please make sure the Spring Boot server is running on http://localhost:8080.';
  showMessage(message, 'error');
  console.error(error);
}

async function apiRequest(path, options = {}) {
  const requestOptions = {
    headers: {},
    ...options,
  };

  if (requestOptions.body !== undefined && requestOptions.body !== null) {
    requestOptions.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, requestOptions);

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    let payload = null;

    if (contentType.includes('application/json')) {
      payload = await response.json().catch(() => null);
    } else {
      const text = await response.text();
      payload = text ? text : null;
    }

    if (!response.ok) {
      const fallbackMessage = typeof payload === 'object' && payload !== null ? (payload.message || payload.error || 'Request failed.') : 'Request failed.';
      throw new Error(fallbackMessage);
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError) {
      handleBackendUnavailable(error);
      return null;
    }

    throw error;
  }
}

function validatePatientForm(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error('Patient name is required.');
  }

  if (!Number.isInteger(data.age) || data.age <= 0) {
    throw new Error('Patient age must be a valid positive number.');
  }

  if (!data.gender || !data.gender.trim()) {
    throw new Error('Patient gender is required.');
  }

  if (!data.phone || !data.phone.trim()) {
    throw new Error('Patient phone number is required.');
  }

  if (!/^[0-9+\-()\s]{7,15}$/.test(data.phone.trim())) {
    throw new Error('Enter a valid phone number.');
  }

  return true;
}

function validateDoctorForm(data) {
  if (!data.name || !data.name.trim()) {
    throw new Error('Doctor name is required.');
  }

  if (!data.specialization || !data.specialization.trim()) {
    throw new Error('Doctor specialization is required.');
  }

  if (!Number.isInteger(data.experience) || data.experience < 0) {
    throw new Error('Doctor experience must be a valid non-negative number.');
  }

  return true;
}

async function updateDashboardCounts() {
  const [patients, doctors] = await Promise.all([
    apiRequest('/patients'),
    apiRequest('/doctors'),
  ]);

  const patientCount = Array.isArray(patients) ? patients.length : 0;
  const doctorCount = Array.isArray(doctors) ? doctors.length : 0;

  elements.totalPatients.textContent = String(patientCount);
  elements.totalDoctors.textContent = String(doctorCount);
}

function buildPatientRow(patient) {
  const row = document.createElement('tr');

  const idCell = document.createElement('td');
  idCell.textContent = patient.id ?? '';

  const nameCell = document.createElement('td');
  nameCell.textContent = patient.name ?? '';

  const ageCell = document.createElement('td');
  ageCell.textContent = patient.age ?? '';

  const genderCell = document.createElement('td');
  genderCell.textContent = patient.gender ?? '';

  const phoneCell = document.createElement('td');
  phoneCell.textContent = patient.phone ?? '';

  const actionCell = document.createElement('td');
  const actionGroup = document.createElement('div');
  actionGroup.className = 'action-group';

  const viewButton = document.createElement('button');
  viewButton.type = 'button';
  viewButton.className = 'action-btn';
  viewButton.textContent = 'View';
  viewButton.dataset.action = 'view-patient';
  viewButton.dataset.id = patient.id ?? '';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'danger-btn';
  deleteButton.textContent = 'Delete';
  deleteButton.dataset.action = 'delete-patient';
  deleteButton.dataset.id = patient.id ?? '';

  actionGroup.appendChild(viewButton);
  actionGroup.appendChild(deleteButton);
  actionCell.appendChild(actionGroup);

  row.appendChild(idCell);
  row.appendChild(nameCell);
  row.appendChild(ageCell);
  row.appendChild(genderCell);
  row.appendChild(phoneCell);
  row.appendChild(actionCell);

  return row;
}

function buildDoctorRow(doctor) {
  const row = document.createElement('tr');

  const idCell = document.createElement('td');
  idCell.textContent = doctor.id ?? '';

  const nameCell = document.createElement('td');
  nameCell.textContent = doctor.name ?? '';

  const specializationCell = document.createElement('td');
  specializationCell.textContent = doctor.specialization ?? '';

  const experienceCell = document.createElement('td');
  experienceCell.textContent = doctor.experience ?? '';

  const actionCell = document.createElement('td');
  const actionGroup = document.createElement('div');
  actionGroup.className = 'action-group';

  const viewButton = document.createElement('button');
  viewButton.type = 'button';
  viewButton.className = 'action-btn';
  viewButton.textContent = 'View';
  viewButton.dataset.action = 'view-doctor';
  viewButton.dataset.id = doctor.id ?? '';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'danger-btn';
  deleteButton.textContent = 'Delete';
  deleteButton.dataset.action = 'delete-doctor';
  deleteButton.dataset.id = doctor.id ?? '';

  actionGroup.appendChild(viewButton);
  actionGroup.appendChild(deleteButton);
  actionCell.appendChild(actionGroup);

  row.appendChild(idCell);
  row.appendChild(nameCell);
  row.appendChild(specializationCell);
  row.appendChild(experienceCell);
  row.appendChild(actionCell);

  return row;
}

function renderPatients(items) {
  elements.patientTableBody.innerHTML = '';

  if (!items || items.length === 0) {
    elements.patientEmpty.classList.remove('hidden');
    return;
  }

  elements.patientEmpty.classList.add('hidden');
  items.forEach((patient) => {
    elements.patientTableBody.appendChild(buildPatientRow(patient));
  });
}

function renderDoctors(items) {
  elements.doctorTableBody.innerHTML = '';

  if (!items || items.length === 0) {
    elements.doctorEmpty.classList.remove('hidden');
    return;
  }

  elements.doctorEmpty.classList.add('hidden');
  items.forEach((doctor) => {
    elements.doctorTableBody.appendChild(buildDoctorRow(doctor));
  });
}

function filterList(items, searchText, fields) {
  const searchValue = searchText.trim().toLowerCase();

  if (!searchValue) {
    return items;
  }

  return items.filter((item) =>
    fields.some((field) => String(item[field] ?? '').toLowerCase().includes(searchValue))
  );
}

async function loadPatients() {
  const data = await apiRequest('/patients');

  if (data === null) {
    patientState.list = [];
    renderPatients([]);
    return;
  }

  patientState.list = Array.isArray(data) ? data : [];
  const filtered = filterList(patientState.list, elements.patientSearch.value, ['id', 'name', 'gender', 'phone']);
  renderPatients(filtered);
}

async function loadDoctors() {
  const data = await apiRequest('/doctors');

  if (data === null) {
    doctorState.list = [];
    renderDoctors([]);
    return;
  }

  doctorState.list = Array.isArray(data) ? data : [];
  const filtered = filterList(doctorState.list, elements.doctorSearch.value, ['id', 'name', 'specialization', 'experience']);
  renderDoctors(filtered);
}

async function createPatient(event) {
  event.preventDefault();
  clearMessage();

  const patientData = {
    name: elements.patientName.value.trim(),
    age: Number(elements.patientAge.value),
    gender: elements.patientGender.value.trim(),
    phone: elements.patientPhone.value.trim(),
  };

  try {
    validatePatientForm(patientData);
    await apiRequest('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });

    elements.patientForm.reset();
    showMessage('Patient added successfully.', 'success');
    await Promise.all([loadPatients(), updateDashboardCounts()]);
  } catch (error) {
    showMessage(error.message || 'Unable to add patient.', 'error');
  }
}

async function createDoctor(event) {
  event.preventDefault();
  clearMessage();

  const doctorData = {
    name: elements.doctorName.value.trim(),
    specialization: elements.doctorSpecialization.value.trim(),
    experience: Number(elements.doctorExperience.value),
  };

  try {
    validateDoctorForm(doctorData);
    await apiRequest('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });

    elements.doctorForm.reset();
    showMessage('Doctor added successfully.', 'success');
    await Promise.all([loadDoctors(), updateDashboardCounts()]);
  } catch (error) {
    showMessage(error.message || 'Unable to add doctor.', 'error');
  }
}

function buildDetailRow(label, value) {
  const row = document.createElement('div');
  row.className = 'detail-row';

  const labelElement = document.createElement('span');
  labelElement.textContent = label;

  const valueElement = document.createElement('strong');
  valueElement.textContent = value;

  row.appendChild(labelElement);
  row.appendChild(valueElement);
  return row;
}

async function viewPatient(patientId) {
  try {
    const patient = await apiRequest(`/patients/${patientId}`);

    if (!patient) {
      showMessage('Patient details could not be loaded.', 'error');
      return;
    }

    elements.modalTitle.textContent = 'Patient Details';
    elements.detailContent.innerHTML = '';
    elements.detailContent.appendChild(buildDetailRow('ID', patient.id ?? 'N/A'));
    elements.detailContent.appendChild(buildDetailRow('Name', patient.name ?? 'N/A'));
    elements.detailContent.appendChild(buildDetailRow('Age', patient.age ?? 'N/A'));
    elements.detailContent.appendChild(buildDetailRow('Gender', patient.gender ?? 'N/A'));
    elements.detailContent.appendChild(buildDetailRow('Phone', patient.phone ?? 'N/A'));
    elements.detailModal.classList.remove('hidden');
    elements.detailModal.setAttribute('aria-hidden', 'false');
  } catch (error) {
    showMessage(error.message || 'Unable to fetch patient details.', 'error');
  }
}

async function viewDoctor(doctorId) {
  try {
    const doctor = await apiRequest(`/doctors/${doctorId}`);

    if (!doctor) {
      showMessage('Doctor details could not be loaded.', 'error');
      return;
    }

    elements.modalTitle.textContent = 'Doctor Details';
    elements.detailContent.innerHTML = '';
    elements.detailContent.appendChild(buildDetailRow('ID', doctor.id ?? 'N/A'));
    elements.detailContent.appendChild(buildDetailRow('Name', doctor.name ?? 'N/A'));
    elements.detailContent.appendChild(buildDetailRow('Specialization', doctor.specialization ?? 'N/A'));
    elements.detailContent.appendChild(buildDetailRow('Experience', doctor.experience ?? 'N/A'));
    elements.detailModal.classList.remove('hidden');
    elements.detailModal.setAttribute('aria-hidden', 'false');
  } catch (error) {
    showMessage(error.message || 'Unable to fetch doctor details.', 'error');
  }
}

async function deletePatient(patientId) {
  const patient = patientState.list.find((item) => String(item.id) === String(patientId));
  const patientName = patient ? patient.name : 'this patient';

  const confirmed = window.confirm(`Are you sure you want to delete ${patientName}?`);
  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(`/patients/${patientId}`, { method: 'DELETE' });
    showMessage('Patient deleted successfully.', 'success');
    await Promise.all([loadPatients(), updateDashboardCounts()]);
  } catch (error) {
    showMessage(error.message || 'Unable to delete patient.', 'error');
  }
}

async function deleteDoctor(doctorId) {
  const doctor = doctorState.list.find((item) => String(item.id) === String(doctorId));
  const doctorName = doctor ? doctor.name : 'this doctor';

  const confirmed = window.confirm(`Are you sure you want to delete ${doctorName}?`);
  if (!confirmed) {
    return;
  }

  try {
    await apiRequest(`/doctors/${doctorId}`, { method: 'DELETE' });
    showMessage('Doctor deleted successfully.', 'success');
    await Promise.all([loadDoctors(), updateDashboardCounts()]);
  } catch (error) {
    showMessage(error.message || 'Unable to delete doctor.', 'error');
  }
}

function closeModal() {
  elements.detailModal.classList.add('hidden');
  elements.detailModal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('click', (event) => {
  const target = event.target;

  if (target instanceof HTMLElement) {
    const patientAction = target.dataset.action;

    if (patientAction === 'view-patient') {
      viewPatient(target.dataset.id);
    }

    if (patientAction === 'delete-patient') {
      deletePatient(target.dataset.id);
    }

    if (patientAction === 'view-doctor') {
      viewDoctor(target.dataset.id);
    }

    if (patientAction === 'delete-doctor') {
      deleteDoctor(target.dataset.id);
    }
  }

  if (target === elements.detailModal) {
    closeModal();
  }
});

elements.patientForm.addEventListener('submit', createPatient);
elements.doctorForm.addEventListener('submit', createDoctor);
elements.closeModal.addEventListener('click', closeModal);
elements.patientSearch.addEventListener('input', () => {
  const filteredPatients = filterList(patientState.list, elements.patientSearch.value, ['id', 'name', 'gender', 'phone']);
  renderPatients(filteredPatients);
});
elements.doctorSearch.addEventListener('input', () => {
  const filteredDoctors = filterList(doctorState.list, elements.doctorSearch.value, ['id', 'name', 'specialization', 'experience']);
  renderDoctors(filteredDoctors);
});

document.addEventListener('DOMContentLoaded', async () => {
  clearMessage();
  try {
    await Promise.all([loadPatients(), loadDoctors(), updateDashboardCounts()]);
  } catch (error) {
    handleBackendUnavailable(error);
  }
});
