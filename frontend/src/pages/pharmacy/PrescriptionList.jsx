import React, { useState, useEffect } from 'react';
import { pharmacistService } from '../../services/patientService.js';

export default function PrescriptionList() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPrescriptions();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPrescriptions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await pharmacistService.getPrescriptions();
      setPrescriptions(Array.isArray(res.data) ? res.data : res.data?.prescriptions || []);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetail(true);
  };

  const handleApprove = async (id) => {
    if (!confirm('Setujui resep ini?')) return;
    try {
      await pharmacistService.approvePrescription(id);
      alert('Resep berhasil disetujui!');
      fetchPrescriptions();
      setShowDetail(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyetujui resep');
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      alert('Alasan penolakan harus diisi');
      return;
    }
    if (!confirm('Tolak resep ini?')) return;
    try {
      await pharmacistService.rejectPrescription(id, rejectReason);
      alert('Resep berhasil ditolak!');
      fetchPrescriptions();
      setShowDetail(false);
      setRejectReason('');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menolak resep');
    }
  };

  const handleDispense = async (id) => {
    if (!confirm('Konfirmasi penyerahan obat ke pasien?')) return;
    try {
      await pharmacistService.dispenseMedicine(id);
      alert('Obat berhasil diserahkan ke pasien!');
      fetchPrescriptions();
      setShowDetail(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyerahkan obat');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'menunggu':
        return 'bg-yellow-100 text-yellow-800';
      case 'disetujui':
        return 'bg-green-100 text-green-800';
      case 'ditolak':
        return 'bg-red-100 text-red-800';
      case 'diberikan':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'menunggu':
        return 'Menunggu Validasi';
      case 'disetujui':
        return 'Disetujui';
      case 'ditolak':
        return 'Ditolak';
      case 'diberikan':
        return 'Sudah Diberikan';
      default:
        return status;
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
          <h1 className="text-3xl font-bold text-gray-800">Daftar Resep</h1>
          <p className="text-gray-600 mt-1">
            Resep yang dikirimkan oleh dokter - Validasi dan serahkan obat ke pasien
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Total: {prescriptions.length} resep | Menunggu: {prescriptions.filter(p => p.status === 'menunggu').length} | Disetujui: {prescriptions.filter(p => p.status === 'disetujui').length}
          </p>
        </div>
        <button
          onClick={fetchPrescriptions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Low Stock Notifications */}
      {prescriptions.some((p) => 
        (p.prescription_items || p.items || []).some((item) => 
          item.medicine && item.medicine.stock <= item.medicine.min_stock
        )
      ) && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">Peringatan Stok Menipis!</p>
              <p className="text-sm text-yellow-700">
                Beberapa obat dalam resep memiliki stok yang menipis. Periksa detail resep untuk informasi lebih lanjut.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 gap-4">
        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 text-lg">Tidak ada resep yang menunggu</p>
            <p className="text-gray-500 text-sm mt-2">Resep baru akan muncul di sini</p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Resep #{prescription.id}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        prescription.status
                      )}`}
                    >
                      {getStatusLabel(prescription.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Pasien:</span>{' '}
                      {prescription.medical_record?.patient?.user?.name || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Dokter:</span>{' '}
                      {prescription.medical_record?.doctor?.user?.name || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Tanggal:</span>{' '}
                      {prescription.createdAt
                        ? new Date(prescription.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'}
                    </div>
                    <div>
                      <span className="font-medium">Item:</span>{' '}
                      {prescription.prescription_items?.length || prescription.items?.length || 0} obat
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleViewDetail(prescription)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    👁️ Detail
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Detail Resep</h2>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setRejectReason('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Patient Info - Detailed */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-4 text-lg flex items-center">
                  <span className="mr-2">👤</span> Informasi Pasien
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 block mb-1">Nama Lengkap:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.patient?.user?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Email:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.patient?.user?.email || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">No. HP:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.patient?.user?.phone || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Alamat:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.patient?.user?.address || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Golongan Darah:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.patient?.blood_type || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Kontak Darurat:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.patient?.emergency_contact || '-'}
                    </span>
                  </div>
                </div>
                {selectedPrescription.medical_record?.patient?.medical_history && (
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <span className="text-gray-600 block mb-1">Riwayat Medis:</span>
                    <span className="text-gray-800 text-sm">
                      {selectedPrescription.medical_record.patient.medical_history}
                    </span>
                  </div>
                )}
              </div>

              {/* Doctor & Examination Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 text-lg flex items-center">
                  <span className="mr-2">🩺</span> Informasi Pemeriksaan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 block mb-1">Dokter:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.doctor?.user?.name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Email Dokter:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.doctor?.user?.email || '-'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-600 block mb-1">Keluhan:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.complaint || '-'}
                    </span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-600 block mb-1">Diagnosa:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.medical_record?.diagnosis || '-'}
                    </span>
                  </div>
                  {selectedPrescription.medical_record?.notes && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600 block mb-1">Catatan Dokter:</span>
                      <span className="font-medium text-gray-800">
                        {selectedPrescription.medical_record.notes}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 block mb-1">Status Resep:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${getStatusColor(
                        selectedPrescription.status
                      )}`}
                    >
                      {getStatusLabel(selectedPrescription.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 block mb-1">Tanggal Resep:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPrescription.createdAt
                        ? new Date(selectedPrescription.createdAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prescription Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Daftar Obat</h3>
                <div className="space-y-3">
                  {(selectedPrescription.prescription_items || selectedPrescription.items || []).length > 0 ? (
                    (selectedPrescription.prescription_items || selectedPrescription.items || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-4 bg-white"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {item.medicine?.name || 'Obat tidak ditemukan'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {item.medicine?.dosage || '-'}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Petunjuk: {item.dosage_instruction}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">
                              {item.quantity} {item.medicine?.dosage || 'unit'}
                            </p>
                            <p className={`text-xs ${
                              item.medicine && item.medicine.stock <= item.medicine.min_stock
                                ? 'text-red-600 font-semibold'
                                : 'text-gray-500'
                            }`}>
                              Stok: {item.medicine?.stock || 0}
                              {item.medicine && item.medicine.stock <= item.medicine.min_stock && (
                                <span className="ml-1">⚠️ Menipis!</span>
                              )}
                            </p>
                            {item.medicine && item.medicine.stock < item.quantity && (
                              <p className="text-xs text-red-600 font-semibold mt-1">
                                ⚠️ Stok tidak cukup!
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Tidak ada item resep</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Catatan</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              {selectedPrescription.status === 'menunggu' && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alasan Penolakan (jika ditolak)
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Masukkan alasan jika menolak resep..."
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(selectedPrescription.id)}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      ✅ Setujui Resep
                    </button>
                    <button
                      onClick={() => handleReject(selectedPrescription.id)}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      ❌ Tolak Resep
                    </button>
                  </div>
                </div>
              )}

              {selectedPrescription.status === 'disetujui' && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleDispense(selectedPrescription.id)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    📦 Serahkan Obat ke Pasien
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
