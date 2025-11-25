import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/patientService.js';
import api from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function PatientHistory() {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamination, setSelectedExamination] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExaminations();
  }, []);

  const fetchExaminations = async () => {
    try {
      setLoading(true);
      // Get all medical records created by this doctor
      const res = await doctorService.getMyRecords();
      setExaminations(res.data?.records || res.data || []);
    } catch (err) {
      console.error('Error fetching examinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (exam) => {
    setSelectedExamination(exam);
    setShowDetail(true);
  };

  const handleViewPrescription = (recordId) => {
    navigate(`/doctor/prescription/${recordId}`);
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
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Pemeriksaan</h1>
          <p className="text-gray-600 mt-1">Daftar semua pemeriksaan yang telah dilakukan</p>
        </div>
        <button
          onClick={fetchExaminations}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Examinations List */}
      <div className="space-y-4">
        {examinations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg">Belum ada riwayat pemeriksaan</p>
            <p className="text-gray-500 text-sm mt-2">
              Riwayat pemeriksaan akan muncul setelah Anda melakukan pemeriksaan pasien
            </p>
          </div>
        ) : (
          examinations.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {exam.patient?.user?.name || exam.patient_name || 'Pasien'}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        exam.status === 'selesai'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {exam.status === 'selesai' ? 'Selesai' : 'Menunggu'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Tanggal:</span>{' '}
                      {exam.createdAt
                        ? new Date(exam.createdAt).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : exam.created_at
                        ? new Date(exam.created_at).toLocaleDateString('id-ID')
                        : '-'}
                    </div>
                    <div>
                      <span className="font-medium">Diagnosa:</span>{' '}
                      {exam.diagnosis ? (exam.diagnosis.substring(0, 40) + '...') : '-'}
                    </div>
                    <div>
                      <span className="font-medium">Keluhan:</span>{' '}
                      {exam.complaint ? (exam.complaint.substring(0, 30) + '...') : '-'}
                    </div>
                    <div>
                      <span className="font-medium">No. Antrian:</span>{' '}
                      {exam.queue?.queue_number || '-'}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleViewDetail(exam)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    👁️ Detail
                  </button>
                  {exam.status === 'selesai' && (
                    <button
                      onClick={() => handleViewPrescription(exam.id)}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium"
                    >
                      💊 Resep
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedExamination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Detail Pemeriksaan</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Pasien</p>
                  <p className="font-semibold">
                    {selectedExamination.patient?.user?.name ||
                      selectedExamination.patient_name ||
                      '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-semibold">
                    {selectedExamination.createdAt
                      ? new Date(selectedExamination.createdAt).toLocaleString('id-ID')
                      : selectedExamination.created_at
                      ? new Date(selectedExamination.created_at).toLocaleString('id-ID')
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      selectedExamination.status === 'selesai'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {selectedExamination.status === 'selesai' ? 'Selesai' : 'Menunggu'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">No. Antrian</p>
                  <p className="font-semibold">
                    {selectedExamination.queue?.queue_number || '-'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Keluhan</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedExamination.complaint || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Diagnosa</p>
                <p className="bg-gray-50 p-3 rounded-lg">{selectedExamination.diagnosis || '-'}</p>
              </div>
              {selectedExamination.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Catatan</p>
                  <p className="bg-gray-50 p-3 rounded-lg">{selectedExamination.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

