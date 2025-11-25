import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { reportService } from '../../services/patientService.js';

export default function ExaminationsManagement() {
  const [examinations, setExaminations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('examinations'); // 'examinations' or 'prescriptions'
  const [selectedExamination, setSelectedExamination] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'examinations') {
        const res = await reportService.getVisitsReport();
        setExaminations(res.data?.visits || []);
      } else {
        const res = await api.get('/pharmacist/prescriptions');
        setPrescriptions(res.data?.prescriptions || res.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (item) => {
    setSelectedExamination(item);
    setShowDetail(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'menunggu':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Pemeriksaan & Resep</h1>
          <p className="text-gray-600 mt-1">Lihat dan kelola semua pemeriksaan dan resep</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('examinations')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'examinations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏥 Pemeriksaan ({examinations.length})
            </button>
            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition ${
                activeTab === 'prescriptions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              💊 Resep ({prescriptions.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'examinations' ? (
            <div className="space-y-4">
              {examinations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">🏥</div>
                  <p className="text-lg">Belum ada data pemeriksaan</p>
                </div>
              ) : (
                examinations.map((exam) => (
                  <div
                    key={exam.id}
                    className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {exam.patient_name || exam.patient?.name || 'Pasien'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                            {exam.status === 'selesai' ? 'Selesai' : 'Menunggu'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Dokter:</span>{' '}
                            {exam.doctor_name || exam.doctor?.user?.name || '-'}
                          </div>
                          <div>
                            <span className="font-medium">Tanggal:</span>{' '}
                            {exam.created_at
                              ? new Date(exam.created_at).toLocaleDateString('id-ID')
                              : exam.createdAt
                              ? new Date(exam.createdAt).toLocaleDateString('id-ID')
                              : '-'}
                          </div>
                          <div>
                            <span className="font-medium">Diagnosa:</span>{' '}
                            {exam.diagnosis || '-'}
                          </div>
                          <div>
                            <span className="font-medium">Keluhan:</span>{' '}
                            {exam.complaint ? (exam.complaint.substring(0, 30) + '...') : '-'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetail(exam)}
                        className="ml-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        👁️ Detail
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-6xl mb-4">💊</div>
                  <p className="text-lg">Belum ada data resep</p>
                </div>
              ) : (
                prescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">
                            Resep #{prescription.id}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              prescription.status === 'menunggu'
                                ? 'bg-yellow-100 text-yellow-800'
                                : prescription.status === 'disetujui'
                                ? 'bg-green-100 text-green-800'
                                : prescription.status === 'ditolak'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {prescription.status === 'menunggu'
                              ? 'Menunggu'
                              : prescription.status === 'disetujui'
                              ? 'Disetujui'
                              : prescription.status === 'ditolak'
                              ? 'Ditolak'
                              : 'Diberikan'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Pasien:</span>{' '}
                            {prescription.medical_record?.patient?.user?.name ||
                              prescription.patient_name ||
                              '-'}
                          </div>
                          <div>
                            <span className="font-medium">Dokter:</span>{' '}
                            {prescription.medical_record?.doctor?.user?.name ||
                              prescription.doctor_name ||
                              '-'}
                          </div>
                          <div>
                            <span className="font-medium">Tanggal:</span>{' '}
                            {prescription.createdAt
                              ? new Date(prescription.createdAt).toLocaleDateString('id-ID')
                              : '-'}
                          </div>
                          <div>
                            <span className="font-medium">Item:</span>{' '}
                            {prescription.prescription_items?.length ||
                              prescription.items?.length ||
                              0}{' '}
                            obat
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDetail(prescription)}
                        className="ml-4 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                      >
                        👁️ Detail
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedExamination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Detail {activeTab === 'examinations' ? 'Pemeriksaan' : 'Resep'}</h2>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedExamination(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {activeTab === 'examinations' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Pasien</p>
                      <p className="font-semibold">{selectedExamination.patient_name || selectedExamination.patient?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dokter</p>
                      <p className="font-semibold">{selectedExamination.doctor_name || selectedExamination.doctor?.user?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tanggal</p>
                      <p className="font-semibold">
                        {selectedExamination.created_at
                          ? new Date(selectedExamination.created_at).toLocaleString('id-ID')
                          : selectedExamination.createdAt
                          ? new Date(selectedExamination.createdAt).toLocaleString('id-ID')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedExamination.status)}`}>
                        {selectedExamination.status === 'selesai' ? 'Selesai' : 'Menunggu'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Keluhan</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedExamination.complaint || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Diagnosa</p>
                    <p className="bg-gray-50 p-3 rounded-lg">{selectedExamination.diagnosis || '-'}</p>
                  </div>
                  {selectedExamination.notes && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Catatan</p>
                      <p className="bg-gray-50 p-3 rounded-lg">{selectedExamination.notes}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Pasien</p>
                      <p className="font-semibold">
                        {selectedExamination.medical_record?.patient?.user?.name ||
                          selectedExamination.patient_name ||
                          '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dokter</p>
                      <p className="font-semibold">
                        {selectedExamination.medical_record?.doctor?.user?.name ||
                          selectedExamination.doctor_name ||
                          '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          selectedExamination.status === 'menunggu'
                            ? 'bg-yellow-100 text-yellow-800'
                            : selectedExamination.status === 'disetujui'
                            ? 'bg-green-100 text-green-800'
                            : selectedExamination.status === 'ditolak'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {selectedExamination.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Daftar Obat</p>
                    <div className="space-y-2">
                      {(selectedExamination.prescription_items ||
                        selectedExamination.items ||
                        []).map((item, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">
                            {item.medicine?.name || item.medicine_name || 'Obat'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} {item.medicine?.dosage || item.dosage || 'unit'} - {item.dosage_instruction}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

