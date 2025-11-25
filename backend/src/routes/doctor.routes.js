// backend/src/routes/doctor.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  getDoctorQueue,
  getPatientRecords,
  createMedicalRecord,
  completeExamination,
  getMyRecords,
  getRecordById,
  getMyPrescriptions,
  createPrescription,
  updateRecordStatus
} from '../controllers/doctor.controller.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['dokter', 'admin']));

router.get('/queue', getDoctorQueue);
router.get('/patients/:id/records', getPatientRecords);
router.get('/records', getMyRecords);
router.get('/records/:id', getRecordById);
router.post('/records', createMedicalRecord);
router.patch('/records/:id', updateRecordStatus);
router.patch('/records/:id/complete', completeExamination);
router.get('/prescriptions', getMyPrescriptions);
router.post('/prescriptions', createPrescription);

export default router;