// backend/src/app.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import receptionistRoutes from './routes/receptionist.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import pharmacistRoutes from './routes/pharmacist.routes.js';
import cashierRoutes from './routes/cashier.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reportRoutes from './routes/reports.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root endpoint - API information
app.get('/', (req, res) => {
  res.json({
    name: 'Klinik Sentosa API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me (authenticated)',
        logout: 'POST /api/auth/logout (authenticated)'
      },
      documentation: 'See README.md for complete API documentation'
    },
    message: 'Welcome to Klinik Sentosa Management System API'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Server is running'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/receptionist', receptionistRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/pharmacist', pharmacistRoutes);
app.use('/api/cashier', cashierRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Terjadi kesalahan server' });
});

// 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Endpoint tidak ditemukan',
    path: req.path,
    method: req.method,
    message: `Tidak ada endpoint ${req.method} ${req.path}`,
    availableEndpoints: {
      public: [
        'GET /',
        'GET /health',
        'POST /api/auth/register',
        'POST /api/auth/login'
      ],
      authenticated: [
        'GET /api/auth/me',
        'POST /api/auth/logout',
        'GET /api/patients/me',
        'PUT /api/patients/me',
        'GET /api/patients/me/visits',
        'GET /api/patients/me/queue'
      ],
      note: 'Untuk endpoint lainnya, pastikan Anda sudah login dan memiliki role yang sesuai'
    }
  });
});

export default app;