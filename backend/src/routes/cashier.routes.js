// backend/src/routes/cashier.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  getPendingPayments,
  processTransaction,
  getTransactionHistory,
  getCompletedPatients
} from '../controllers/cashier.controller.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['kasir', 'admin']));

router.get('/pending', getPendingPayments);
router.get('/completed-patients', getCompletedPatients);
router.post('/transactions', processTransaction);
router.get('/transactions', getTransactionHistory);

export default router;