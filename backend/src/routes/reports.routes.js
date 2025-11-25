// backend/src/routes/reports.routes.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import {
  getDashboardStats,
  getVisitsReport,
  getTransactionsReport,
  getMedicineUsageReport
} from '../routes/report.controller.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole(['admin']));

// Endpoint laporan
router.get('/dashboard', getDashboardStats);
router.get('/visits', getVisitsReport);
router.get('/transactions', getTransactionsReport);
router.get('/medicine-usage', getMedicineUsageReport);

export default router;