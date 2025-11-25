import React, { useState, useEffect } from 'react';
import { doctorService, pharmacistService } from '../../services/patientService.js';
import api from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function PatientQueue() {
  const [queues, setQueues] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [medicinesLoading, setMedicinesLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [showExaminationModal, setShowExaminationModal] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [medicalRecordId, setMedicalRecordId] = useState(null);
  const [formData, setFormData] = useState({
    complaint: '',
    diagnosis: '',
    notes: ''
  });
  const [prescriptionItems, setPrescriptionItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueues();
    fetchMedicines();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchQueues, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMedicines = async () => {
    try {
      setMedicinesLoading(true);
      const res = await pharmacistService.getMedicines();
      setMedicines(res.data?.medicines || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
    } finally {
      setMedicinesLoading(false);
    }
  };

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getQueue();
      setQueues(res.data?.queues || res.data || []);
    } catch (err) {
      console.error('Error fetching queues:', err);
      setError(err.response?.data?.error || 'Gagal memuat antrian');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQueue = (queue) => {
    setSelectedQueue(queue);
    setFormData({ complaint: '', diagnosis: '', notes: '' });
    setPrescriptionItems([]);
    setShowPrescription(false);
    setMedicalRecordId(null);
    setShowExaminationModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleViewPatientDetail = (queue) => {
    navigate(`/doctor/patient/${queue.patient.user_id || queue.patient_id}`);
  };

  const handleSubmitExamination = async () => {
    if (!selectedQueue || !formData.diagnosis) {
      setError('Diagnosa harus diisi');
      return;
    }

    try {
      setError('');
      const res = await doctorService.createMedicalRecord({
        patient_id: selectedQueue.patient?.user_id || selectedQueue.patient_id,
        queue_id: selectedQueue.id,
        complaint: formData.complaint,
        diagnosis: formData.diagnosis,
        notes: formData.notes
      });
      
      // Get medical record ID from response
      const recordId = res.data?.record?.id;
      if (recordId) {
        setMedicalRecordId(recordId);
        setShowPrescription(true);
        // Don't close modal yet, show prescription form
      } else {
        // If no record ID, close modal
        setShowExaminationModal(false);
        setSelectedQueue(null);
        setFormData({ complaint: '', diagnosis: '', notes: '' });
        fetchQueues();
        alert('Pemeriksaan berhasil disimpan!');
      }
    } catch (err) {
      console.error('Error saving examination:', err);
      setError(err.response?.data?.error || 'Gagal menyimpan pemeriksaan');
    }
  };

  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([...prescriptionItems, {
      medicine_id: '',
      quantity: 1,
      dosage_instruction: ''
    }]);
  };

  const handleRemovePrescriptionItem = (index) => {
    const newItems = prescriptionItems.filter((_, i) => i !== index);
    setPrescriptionItems(newItems);
  };

  const handlePrescriptionItemChange = (index, field, value) => {
    const newItems = [...prescriptionItems];
    newItems[index][field] = value;
    setPrescriptionItems(newItems);
  };

  const handleSubmitPrescription = async () => {
    if (prescriptionItems.length === 0) {
      // If no prescription items, just close modal
      setShowExaminationModal(false);
      setSelectedQueue(null);
      setFormData({ complaint: '', diagnosis: '', notes: '' });
      setPrescriptionItems([]);
      setShowPrescription(false);
      setMedicalRecordId(null);
      fetchQueues();
      alert('Pemeriksaan berhasil disimpan!');
      return;
    }

    // Validate prescription items
    const invalidItems = prescriptionItems.filter(item => !item.medicine_id || !item.quantity || !item.dosage_instruction);
    if (invalidItems.length > 0) {
      setError('Semua field resep harus diisi');
      return;
    }

    try {
      setError('');
      await doctorService.createPrescription({
        medical_record_id: medicalRecordId,
        prescription_items: prescriptionItems
      });
      
      setShowExaminationModal(false);
      setSelectedQueue(null);
      setFormData({ complaint: '', diagnosis: '', notes: '' });
      setPrescriptionItems([]);
      setShowPrescription(false);
      setMedicalRecordId(null);
      fetchQueues();
      alert('Pemeriksaan dan resep berhasil disimpan! Resep akan dikirim ke apoteker.');
    } catch (err) {
      console.error('Error saving prescription:', err);
      setError(err.response?.data?.error || 'Gagal menyimpan resep');
    }
  };

  const handleSkipPrescription = () => {
    setShowExaminationModal(false);
    setSelectedQueue(null);
    setFormData({ complaint: '', diagnosis: '', notes: '' });
    setPrescriptionItems([]);
    setShowPrescription(false);
    setMedicalRecordId(null);
    fetchQueues();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'dipanggil':
        return 'bg-blue-100 text-blue-800';
      case 'selesai':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'dipanggil':
        return 'Dipanggil';
      case 'selesai':
        return 'Selesai';
      default:
        return 'Menunggu';
    }
  };

  if (loading && queues.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-800">Antrian Pasien</h1>
          <p className="text-gray-600 mt-1">Daftar pasien yang menunggu pemeriksaan</p>
        </div>
        <button
          onClick={fetchQueues}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

      {/* Queue Table - Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Antrian Pasien</h2>
          <p className="text-sm text-gray-600 mt-1">{queues.length} pasien dalam antrian</p>
        </div>

        {queues.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <p className="text-gray-600 text-lg">Tidak ada pasien dalam antrian</p>
            <p className="text-gray-500 text-sm mt-2">Antrian pasien akan muncul di sini setelah pasien mendaftar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomor Antrian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                    Nama Pasien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">
                    No. HP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                    Waktu Daftar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {queues.map((queue, index) => (
                  <tr
                    key={queue.id}
                    className={`hover:bg-gray-50 transition ${
                      selectedQueue?.id === queue.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{queue.position || index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-blue-600">
                        {queue.queue_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {queue.patient?.user?.name || queue.patient_name || 'Pasien'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {queue.patient?.user?.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {queue.createdAt
                          ? new Date(queue.createdAt).toLocaleString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : queue.created_at
                          ? new Date(queue.created_at).toLocaleString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(queue.status)}`}>
                        {getStatusLabel(queue.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewPatientDetail(queue)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-xs font-medium"
                        >
                          👁️ Detail
                        </button>
                        <button
                          onClick={() => handleSelectQueue(queue)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={queue.status === 'selesai'}
                        >
                          🩺 Periksa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics - Moved Below Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Statistik Hari Ini</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Total Antrian</p>
            <p className="text-3xl font-bold text-blue-600">{queues.length}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Menunggu</p>
            <p className="text-3xl font-bold text-yellow-600">
              {queues.filter(q => q.status === 'menunggu').length}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Dipanggil</p>
            <p className="text-3xl font-bold text-green-600">
              {queues.filter(q => q.status === 'dipanggil').length}
            </p>
          </div>
        </div>
      </div>

      {/* Examination Modal */}
      {showExaminationModal && selectedQueue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Form Pemeriksaan</h2>
                <button
                  onClick={() => {
                    setShowExaminationModal(false);
                    setSelectedQueue(null);
                    setError('');
                    setShowPrescription(false);
                    setPrescriptionItems([]);
                    setMedicalRecordId(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 bg-blue-50 p-3 rounded-lg">
                <p className="font-semibold text-gray-800">
                  Pasien: {selectedQueue.patient?.user?.name || selectedQueue.patient_name}
                </p>
                <p className="text-sm text-gray-600">No. Antrian: {selectedQueue.queue_number}</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Keluhan Pasien
                </label>
                <textarea
                  name="complaint"
                  value={formData.complaint}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Masukkan keluhan yang disampaikan pasien..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diagnosa *
                </label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Masukkan diagnosa..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Tambahan
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Catatan, instruksi, atau tindak lanjut..."
                />
              </div>

              {!showPrescription ? (
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSubmitExamination}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    ✅ Simpan Pemeriksaan & Lanjutkan ke Resep
                  </button>
                  <button
                    onClick={() => {
                      setShowExaminationModal(false);
                      setSelectedQueue(null);
                      setError('');
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <>
                  {/* Prescription Section */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">💊 Resep Obat</h3>
                      <button
                        onClick={handleAddPrescriptionItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        ➕ Tambah Obat
                      </button>
                    </div>

                    {prescriptionItems.length === 0 ? (
                      <div className="p-6 bg-gray-50 rounded-lg text-center border-2 border-dashed border-gray-300">
                        <p className="text-gray-500 mb-3">Belum ada obat yang ditambahkan</p>
                        <p className="text-sm text-gray-400">Klik "Tambah Obat" untuk menambahkan resep, atau klik "Lewati" jika tidak ada resep</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {prescriptionItems.map((item, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-medium text-gray-800">Obat #{index + 1}</h4>
                              <button
                                onClick={() => handleRemovePrescriptionItem(index)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                🗑️ Hapus
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Nama Obat *
                                </label>
                                <select
                                  value={item.medicine_id}
                                  onChange={(e) => handlePrescriptionItemChange(index, 'medicine_id', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  required
                                >
                                  <option value="">Pilih Obat</option>
                                  {medicines.map((medicine) => (
                                    <option key={medicine.id} value={medicine.id}>
                                      {medicine.name} ({medicine.dosage}) - Stok: {medicine.stock}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Jumlah *
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handlePrescriptionItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Aturan Pakai *
                                </label>
                                <input
                                  type="text"
                                  value={item.dosage_instruction}
                                  onChange={(e) => handlePrescriptionItemChange(index, 'dosage_instruction', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  placeholder="Contoh: 3x1 sesudah makan"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleSubmitPrescription}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                      ✅ Simpan Pemeriksaan & Resep
                    </button>
                    <button
                      onClick={handleSkipPrescription}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                    >
                      Lewati Resep
                    </button>
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
