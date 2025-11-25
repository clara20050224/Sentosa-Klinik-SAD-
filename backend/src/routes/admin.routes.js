// backend/src/routes/admin.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient
} from '../controllers/admin.controller.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['admin']));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Manajemen User
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Manajemen Obat
router.get('/medicines', getAllMedicines);
router.post('/medicines', createMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

// Manajemen Pasien
router.get('/patients', getAllPatients);
router.get('/patients/:id', getPatientById);
router.put('/patients/:id', updatePatient);
router.delete('/patients/:id', deletePatient);

export default router;