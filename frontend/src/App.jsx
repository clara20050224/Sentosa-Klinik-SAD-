import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import { getRoleRoute } from './utils/getRoleRoute.js';

// Pages per role
import PatientDashboard from './pages/patient/Dashboard.jsx';
import PatientProfile from './pages/patient/Profile.jsx';
import PatientHistory from './pages/patient/History.jsx';
import PatientQueueStatus from './pages/patient/QueueStatus.jsx';
import RegisterExamination from './pages/patient/RegisterExamination.jsx';
import ReceptionistQueue from './pages/receptionist/TodayQueue.jsx';
import DoctorQueue from './pages/doctor/PatientQueue.jsx';
import DoctorPatientDetail from './pages/doctor/PatientDetail.jsx';
import DoctorPatientList from './pages/doctor/PatientList.jsx';
import DoctorPatientHistory from './pages/doctor/PatientHistory.jsx';
import DoctorPrescriptionHistory from './pages/doctor/PrescriptionHistory.jsx';
import DoctorCreatePrescription from './pages/doctor/CreatePrescription.jsx';
import DoctorCreatePrescriptionPage from './pages/doctor/CreatePrescriptionPage.jsx';
import DoctorExaminePatient from './pages/doctor/ExaminePatient.jsx';
import DoctorExaminationStatus from './pages/doctor/ExaminationStatus.jsx';
import PharmacistPrescriptions from './pages/pharmacy/PrescriptionList.jsx';
import PharmacistMedicinesManagement from './pages/pharmacy/MedicinesManagement.jsx';
import PharmacistMedicineDetail from './pages/pharmacy/MedicineDetail.jsx';
import PharmacistDispenseHistory from './pages/pharmacy/MedicineDispenseHistory.jsx';
import CashierPayment from './pages/cashier/PaymentQueue.jsx';
import CashierTransactionHistory from './pages/cashier/TransactionHistory.jsx';
import CashierTransactionReport from './pages/cashier/TransactionReport.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminPatientManagement from './pages/admin/PatientManagement.jsx';
import AdminUsersManagement from './pages/admin/UsersManagement.jsx';
import AdminMedicinesManagement from './pages/admin/MedicinesManagement.jsx';
import AdminExaminationsManagement from './pages/admin/ExaminationsManagement.jsx';
import AdminReports from './pages/admin/TransactionsReport.jsx';

// Guards
import RoleGuard from './components/RoleGuard.jsx';

function App() {
  const { loading, user } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  // Component untuk redirect berdasarkan role
  const IndexRedirect = () => {
    if (user) {
      const route = getRoleRoute(user.role);
      return <Navigate to={route} replace />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route index element={<IndexRedirect />} />

          {/* Pasien */}
          <Route path="/dashboard" element={
            <RoleGuard roles={['pasien']}>
              <PatientDashboard />
            </RoleGuard>
          } />
          <Route path="/dashboard/profile" element={
            <RoleGuard roles={['pasien']}>
              <PatientProfile />
            </RoleGuard>
          } />
          <Route path="/dashboard/history" element={
            <RoleGuard roles={['pasien']}>
              <PatientHistory />
            </RoleGuard>
          } />
          <Route path="/dashboard/queue" element={
            <RoleGuard roles={['pasien']}>
              <PatientQueueStatus />
            </RoleGuard>
          } />
          <Route path="/dashboard/register-examination" element={
            <RoleGuard roles={['pasien']}>
              <RegisterExamination />
            </RoleGuard>
          } />

          {/* Dokter */}
          <Route path="/doctor" element={
            <RoleGuard roles={['dokter']}>
              <DoctorQueue />
            </RoleGuard>
          } />
          <Route path="/doctor/patients" element={
            <RoleGuard roles={['dokter']}>
              <DoctorPatientList />
            </RoleGuard>
          } />
          <Route path="/doctor/patient/:id" element={
            <RoleGuard roles={['dokter']}>
              <DoctorPatientDetail />
            </RoleGuard>
          } />
          <Route path="/doctor/examine" element={
            <RoleGuard roles={['dokter']}>
              <DoctorExaminePatient />
            </RoleGuard>
          } />
          <Route path="/doctor/examine/:id" element={
            <RoleGuard roles={['dokter']}>
              <DoctorExaminePatient />
            </RoleGuard>
          } />
          <Route path="/doctor/prescription" element={
            <RoleGuard roles={['dokter']}>
              <DoctorCreatePrescriptionPage />
            </RoleGuard>
          } />
          <Route path="/doctor/prescription/:recordId" element={
            <RoleGuard roles={['dokter']}>
              <DoctorCreatePrescription />
            </RoleGuard>
          } />
          <Route path="/doctor/history" element={
            <RoleGuard roles={['dokter']}>
              <DoctorPatientHistory />
            </RoleGuard>
          } />
          <Route path="/doctor/examinations" element={
            <RoleGuard roles={['dokter']}>
              <DoctorExaminationStatus />
            </RoleGuard>
          } />
          <Route path="/doctor/prescriptions" element={
            <RoleGuard roles={['dokter']}>
              <DoctorPrescriptionHistory />
            </RoleGuard>
          } />

          {/* Apoteker */}
          <Route path="/pharmacist" element={
            <RoleGuard roles={['apoteker']}>
              <PharmacistPrescriptions />
            </RoleGuard>
          } />
          <Route path="/pharmacist/medicines" element={
            <RoleGuard roles={['apoteker']}>
              <PharmacistMedicinesManagement />
            </RoleGuard>
          } />
          <Route path="/pharmacist/medicines/:id" element={
            <RoleGuard roles={['apoteker']}>
              <PharmacistMedicineDetail />
            </RoleGuard>
          } />
          <Route path="/pharmacist/history" element={
            <RoleGuard roles={['apoteker']}>
              <PharmacistDispenseHistory />
            </RoleGuard>
          } />

          {/* Kasir */}
          <Route path="/cashier" element={
            <RoleGuard roles={['kasir']}>
              <CashierPayment />
            </RoleGuard>
          } />
          <Route path="/cashier/history" element={
            <RoleGuard roles={['kasir']}>
              <CashierTransactionHistory />
            </RoleGuard>
          } />
          <Route path="/cashier/report" element={
            <RoleGuard roles={['kasir']}>
              <CashierTransactionReport />
            </RoleGuard>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <RoleGuard roles={['admin']}>
              <AdminDashboard />
            </RoleGuard>
          } />
          <Route path="/admin/patients" element={
            <RoleGuard roles={['admin']}>
              <AdminPatientManagement />
            </RoleGuard>
          } />
          <Route path="/admin/users" element={
            <RoleGuard roles={['admin']}>
              <AdminUsersManagement />
            </RoleGuard>
          } />
          <Route path="/admin/medicines" element={
            <RoleGuard roles={['admin']}>
              <AdminMedicinesManagement />
            </RoleGuard>
          } />
          <Route path="/admin/examinations" element={
            <RoleGuard roles={['admin']}>
              <AdminExaminationsManagement />
            </RoleGuard>
          } />
          <Route path="/admin/reports" element={
            <RoleGuard roles={['admin']}>
              <AdminReports />
            </RoleGuard>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;