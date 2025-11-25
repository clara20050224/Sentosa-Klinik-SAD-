import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/patientService.js';
import api from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function ExaminationStatus() {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamination, setSelectedExamination] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExaminations();
  }, []);

  const fetchExaminations = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getMyRecords();
      setExaminations(res.data?.records || []);
    } catch (err) {
      console.error('Error fetching examinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = (exam) => {
    setSelectedExamination(exam);
    setNewStatus(exam.status || 'menunggu');
    setShowStatusModal(true);
  };

  const handleSubmitStatusUpdate = async () => {
    if (!selectedExamination || !newStatus) {
      alert('Pilih status terlebih dahulu');
      return;
    }

    try {
      // Update medical record status
      await api.patch(`/doctor/records/${selectedExamination.id}`, {
        status: newStatus
      });

      // If status is 'selesai', also update queue status
      if (newStatus === 'selesai' && selectedExamination.queue_id) {
        try {
          await api.patch(`/receptionist/queue/${selectedExamination.queue_id}`, {
            status: 'selesai'
          });
        } catch (e) {
          console.error('Error updating queue status:', e);
        }
      }

      setShowStatusModal(false);
      setSelectedExamination(null);
      fetchExaminations();
      alert('Status pemeriksaan berhasil diperbarui!');
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Gagal memperbarui status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'dipanggil':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'selesai':
        return 'Selesai';
      case 'dipanggil':
        return 'Dipanggil';
      default:
        return 'Menunggu';
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
          <h1 className="text-3xl font-bold text-gray-800">Update Status Pemeriksaan</h1>
          <p className="text-gray-600 mt-1">Kelola status pemeriksaan pasien</p>
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
            <p className="text-gray-600 text-lg">Belum ada pemeriksaan</p>
            <p className="text-gray-500 text-sm mt-2">
              Pemeriksaan akan muncul setelah Anda melakukan pemeriksaan pasien
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
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        exam.status
                      )}`}
                    >
                      {getStatusLabel(exam.status)}
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
                    onClick={() => handleUpdateStatus(exam)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    🔄 Update Status
                  </button>
                  <button
                    onClick={() => navigate(`/doctor/patient/${exam.patient_id}`)}
                    className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
                  >
                    👁️ Detail
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedExamination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Update Status Pemeriksaan</h2>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedExamination(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Pasien</p>
                <p className="font-semibold text-gray-800">
                  {selectedExamination.patient?.user?.name ||
                    selectedExamination.patient_name ||
                    '-'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Pemeriksaan *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="menunggu">Menunggu</option>
                  <option value="dipanggil">Dipanggil</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSubmitStatusUpdate}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  ✅ Simpan Perubahan
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedExamination(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

