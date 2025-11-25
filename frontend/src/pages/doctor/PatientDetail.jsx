import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/patientService.js';
import api from '../../services/api.js';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'history'

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      // Fetch patient info - try different endpoints
      let patientRes;
      try {
        patientRes = await api.get(`/patients/${id}`);
      } catch (e) {
        // Try admin endpoint
        patientRes = await api.get(`/admin/patients/${id}`);
      }
      setPatient(patientRes.data?.patient || patientRes.data);

      // Fetch medical records
      const recordsRes = await doctorService.getPatientRecords(id);
      setMedicalRecords(recordsRes.data?.records || []);
    } catch (err) {
      console.error('Error fetching patient data:', err);
      alert('Gagal memuat data pasien');
      navigate('/doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExamination = () => {
    navigate(`/doctor/examine/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Pasien tidak ditemukan</p>
        <button
          onClick={() => navigate('/doctor')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Kembali ke Antrian
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Detail Pasien</h1>
          <p className="text-gray-600 mt-1">Informasi lengkap pasien dan riwayat medis</p>
        </div>
        <button
          onClick={() => navigate('/doctor')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Kembali
        </button>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {patient.user?.name || patient.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{patient.user?.email || patient.email || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">No. HP</p>
                <p className="font-medium">{patient.user?.phone || patient.phone || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Alamat</p>
                <p className="font-medium">{patient.user?.address || patient.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Golongan Darah</p>
                <p className="font-medium">{patient.blood_type || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kontak Darurat</p>
                <p className="font-medium">{patient.emergency_contact || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Riwayat Medis</p>
                <p className="font-medium">{patient.medical_history || 'Tidak ada'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleStartExamination}
            className="ml-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            🩺 Mulai Pemeriksaan
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 Informasi Pasien
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📜 Riwayat Medis ({medicalRecords.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Informasi Pribadi</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Nama:</span>{' '}
                      <span className="font-medium">{patient.user?.name || patient.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>{' '}
                      <span className="font-medium">{patient.user?.email || patient.email || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">No. HP:</span>{' '}
                      <span className="font-medium">{patient.user?.phone || patient.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Alamat:</span>{' '}
                      <span className="font-medium">{patient.user?.address || patient.address || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Informasi Medis</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Golongan Darah:</span>{' '}
                      <span className="font-medium">{patient.blood_type || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Kontak Darurat:</span>{' '}
                      <span className="font-medium">{patient.emergency_contact || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Riwayat Medis:</span>{' '}
                      <span className="font-medium">{patient.medical_history || 'Tidak ada'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {medicalRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-lg">Belum ada riwayat medis</p>
                </div>
              ) : (
                medicalRecords.map((record) => (
                  <div
                    key={record.id}
                    className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-sm text-gray-600">
                          {record.createdAt
                            ? new Date(record.createdAt).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : record.created_at
                            ? new Date(record.created_at).toLocaleDateString('id-ID')
                            : '-'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'selesai'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {record.status === 'selesai' ? 'Selesai' : 'Menunggu'}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Keluhan:</p>
                        <p className="text-gray-600">{record.complaint || '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Diagnosa:</p>
                        <p className="text-gray-600">{record.diagnosis || '-'}</p>
                      </div>
                      {record.notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Catatan:</p>
                          <p className="text-gray-600">{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

