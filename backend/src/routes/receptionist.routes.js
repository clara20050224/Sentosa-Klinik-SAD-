import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  createQueue,
  getTodaysQueues,
  updateQueueStatus,
  registerPatient,
  listPatients
} from '../controllers/receptionist.controller.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['resepsionis', 'admin']));

// Queue management
router.post('/queue', createQueue);
router.get('/queues/today', getTodaysQueues);
router.patch('/queue/:id', updateQueueStatus);

// Patient management
router.post('/patients', registerPatient);
router.get('/patients', listPatients);

export default router;