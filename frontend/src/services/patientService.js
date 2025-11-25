import api from './api.js';

// ==================== AUTH ====================
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

// ==================== PATIENT ====================
export const patientService = {
  getProfile: () => api.get('/patients/me'),
  updateProfile: (data) => api.put('/patients/me', data),
  getVisits: () => api.get('/patients/me/visits'),
  getQueueStatus: () => api.get('/patients/me/queue'),
  registerExamination: (data) => api.post('/patients/register-examination', data)
};

// ==================== RECEPTIONIST ====================
export const receptionistService = {
  createQueue: (patientId) => api.post('/receptionist/queue', { patientId }),
  getTodaysQueues: () => api.get('/receptionist/queues/today'),
  updateQueueStatus: (id, status) => api.patch(`/receptionist/queue/${id}`, { status }),
  registerPatient: (data) => api.post('/receptionist/patients', data),
  listPatients: () => api.get('/receptionist/patients')
};

// ==================== DOCTOR ====================
export const doctorService = {
  getQueue: () => api.get('/doctor/queue'),
  getPatientRecords: (id) => api.get(`/doctor/patients/${id}/records`),
  createMedicalRecord: (data) => api.post('/doctor/records', data),
  completeExamination: (id) => api.patch(`/doctor/records/${id}/complete`, {}),
  getMyRecords: () => api.get('/doctor/records'),
  getMyPrescriptions: () => api.get('/doctor/prescriptions'),
  createPrescription: (data) => api.post('/doctor/prescriptions', data)
};

// ==================== PHARMACIST ====================
export const pharmacistService = {
  getPrescriptions: () => api.get('/pharmacist/prescriptions'),
  approvePrescription: (id) => api.patch(`/pharmacist/prescriptions/${id}/approve`, {}),
  rejectPrescription: (id, reason) => api.patch(`/pharmacist/prescriptions/${id}/reject`, { reason }),
  dispenseMedicine: (id) => api.post(`/pharmacist/prescriptions/${id}/dispense`, {}),
  getMedicines: () => api.get('/pharmacist/medicines'),
  createMedicine: (data) => api.post('/pharmacist/medicines', data),
  updateMedicine: (id, data) => api.put(`/pharmacist/medicines/${id}`, data),
  deleteMedicine: (id) => api.delete(`/pharmacist/medicines/${id}`)
};

// ==================== CASHIER ====================
export const cashierService = {
  getPendingPayments: () => api.get('/cashier/pending'),
  processTransaction: (data) => api.post('/cashier/transactions', data),
  getTransactionHistory: () => api.get('/cashier/transactions'),
  getStats: () => api.get('/cashier/stats')
};

// ==================== ADMIN ====================
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: () => api.get('/admin/users'),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getMedicines: () => api.get('/admin/medicines'),
  createMedicine: (data) => api.post('/admin/medicines', data),
  updateMedicine: (id, data) => api.put(`/admin/medicines/${id}`, data),
  deleteMedicine: (id) => api.delete(`/admin/medicines/${id}`),
  getAllPatients: () => api.get('/admin/patients'),
  getPatientById: (id) => api.get(`/admin/patients/${id}`),
  updatePatient: (id, data) => api.put(`/admin/patients/${id}`, data),
  deletePatient: (id) => api.delete(`/admin/patients/${id}`)
};

// ==================== REPORTS ====================
export const reportService = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getMedicineUsageReport: () => api.get('/reports/medicine-usage'),
  getVisitsReport: () => api.get('/reports/visits'),
  getTransactionsReport: () => api.get('/reports/transactions')
};
