// backend/src/routes/pharmacist.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  getPrescriptions,
  approvePrescription,
  rejectPrescription,
  dispenseMedicine,
  getAllMedicines,
  createMedicine,
  updateMedicine,
  deleteMedicine
} from '../controllers/pharmacist.controller.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['apoteker', 'admin']));

router.get('/prescriptions', getPrescriptions);
router.patch('/prescriptions/:id/approve', approvePrescription);
router.patch('/prescriptions/:id/reject', rejectPrescription);
router.post('/prescriptions/:id/dispense', dispenseMedicine);

// Manajemen obat
router.get('/medicines', getAllMedicines);
router.post('/medicines', createMedicine);
router.put('/medicines/:id', updateMedicine);
router.delete('/medicines/:id', deleteMedicine);

export default router;