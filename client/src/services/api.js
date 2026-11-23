const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  // Auth
  async login(username, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async getProfile(token) {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },

  // Stats
  async getStats(token) {
    const res = await fetch(`${API_URL}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch stats');
    return data;
  },

  // Diseases
  async getDiseases(token, { search = '', page = 1, limit = 5 } = {}) {
    const params = new URLSearchParams({ search, page, limit });
    const res = await fetch(`${API_URL}/diseases?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch diseases');
    return data;
  },

  async createDisease(token, diseaseData) {
    const res = await fetch(`${API_URL}/diseases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(diseaseData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create disease');
    return data;
  },

  async updateDisease(token, id, diseaseData) {
    const res = await fetch(`${API_URL}/diseases/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(diseaseData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update disease');
    return data;
  },

  async deleteDisease(token, id) {
    const res = await fetch(`${API_URL}/diseases/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete disease');
    return data;
  },

  // Medicines
  async getMedicines(token, { search = '', page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({ search, page, limit });
    const res = await fetch(`${API_URL}/medicines?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch medicines');
    return data;
  },

  // Patients
  async getPatients(token, { search = '', page = 1, limit = 5 } = {}) {
    const params = new URLSearchParams({ search, page, limit });
    const res = await fetch(`${API_URL}/patients?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch patients');
    return data;
  },

  async searchPatients(token, query) {
    const params = new URLSearchParams({ q: query });
    const res = await fetch(`${API_URL}/patients/search?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to search patients');
    return data;
  },

  async getPatientDetail(token, id) {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch patient details');
    return data;
  },

  async createPatient(token, patientData) {
    const res = await fetch(`${API_URL}/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(patientData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create patient');
    return data;
  },

  async updatePatient(token, id, patientData) {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(patientData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update patient');
    return data;
  },

  async deletePatient(token, id) {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete patient');
    return data;
  },

  // Prescriptions
  async getPrescriptions(token, { search = '', page = 1, limit = 10 } = {}) {
    const params = new URLSearchParams({ search, page, limit });
    const res = await fetch(`${API_URL}/prescriptions?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch prescriptions');
    return data;
  },

  async createPrescription(token, prescriptionData) {
    const res = await fetch(`${API_URL}/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(prescriptionData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create prescription');
    return data;
  },

  async deleteMedicine(token, id) {
    const res = await fetch(`${API_URL}/medicines/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete medicine');
    return data;
  },

  async deletePrescription(token, id) {
    const res = await fetch(`${API_URL}/prescriptions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete prescription');
    return data;
  },

  // Appointments
  async getAppointments(token) {
    const res = await fetch(`${API_URL}/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch appointments');
    return data;
  },

  async createAppointment(token, apptData) {
    const res = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(apptData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create appointment');
    return data;
  },

  async deleteAppointment(token, id) {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete appointment');
    return data;
  },

  // Doctors
  async getDoctors(token) {
    const res = await fetch(`${API_URL}/doctors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch doctors');
    return data;
  },

  async createDoctor(token, doctorData) {
    const res = await fetch(`${API_URL}/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(doctorData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create doctor');
    return data;
  },

  async deleteDoctor(token, id) {
    const res = await fetch(`${API_URL}/doctors/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete doctor');
    return data;
  },

  // Recycle Bin
  async getRecycleBin(token, { type = 'all', q = '', page = 1, limit = 5 } = {}) {
    const params = new URLSearchParams({ type, q, page, limit });
    const res = await fetch(`${API_URL}/recycle-bin?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch recycle bin items');
    return data;
  },

  async restoreItem(token, type, id, newName = null) {
    const res = await fetch(`${API_URL}/recycle-bin/${type}/${id}/restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ newName })
    });
    const data = await res.json();
    if (!res.ok) {
      const err = new Error(data.message || 'Failed to restore item');
      err.conflict = data.conflict;
      err.currentName = data.currentName;
      err.status = res.status;
      throw err;
    }
    return data;
  },

  async deletePermanently(token, type, id) {
    const res = await fetch(`${API_URL}/recycle-bin/${type}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete permanently');
    return data;
  },

  async emptyRecycleBin(token) {
    const res = await fetch(`${API_URL}/recycle-bin`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to empty recycle bin');
    return data;
  }
};
