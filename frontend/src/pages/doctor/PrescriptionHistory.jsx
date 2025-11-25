import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/patientService.js';
import { useNavigate } from 'react-router-dom';

export default function PrescriptionHistory() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      // Get all prescriptions created by this doctor
      const res = await doctorService.getMyPrescriptions();
      setPrescriptions(res.data?.prescriptions || res.data || []);
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
          <h1 className="text-3xl font-bold text-gray-800">Histori Resep</h1>
          <p className="text-gray-600 mt-1">Daftar semua resep yang pernah dibuat</p>
        </div>
        <button
          onClick={fetchPrescriptions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">💊</div>
            <p className="text-gray-600 text-lg">Belum ada resep yang dibuat</p>
            <p className="text-gray-500 text-sm mt-2">
              Resep akan muncul setelah Anda membuat resep untuk pasien
            </p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
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
                      {prescription.medical_record?.patient?.user?.name ||
                        prescription.patient_name ||
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
                    <div>
                      <span className="font-medium">Diagnosa:</span>{' '}
                      {prescription.medical_record?.diagnosis || '-'}
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

      {/* Detail Modal */}
      {showDetail && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Detail Resep #{selectedPrescription.id}
                </h2>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedPrescription(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Informasi Pasien</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Nama:</span>{' '}
                    <span className="font-medium">
                      {selectedPrescription.medical_record?.patient?.user?.name ||
                        selectedPrescription.patient_name ||
                        '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Diagnosa:</span>{' '}
                    <span className="font-medium">
                      {selectedPrescription.medical_record?.diagnosis || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>{' '}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        selectedPrescription.status
                      )}`}
                    >
                      {getStatusLabel(selectedPrescription.status)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tanggal:</span>{' '}
                    <span className="font-medium">
                      {selectedPrescription.createdAt
                        ? new Date(selectedPrescription.createdAt).toLocaleString('id-ID')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prescription Items */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Daftar Obat</h3>
                <div className="space-y-3">
                  {(selectedPrescription.prescription_items ||
                    selectedPrescription.items ||
                    []).map((item, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            {item.medicine?.name || item.medicine_name || 'Obat'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.medicine?.dosage || item.dosage || '-'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Petunjuk: {item.dosage_instruction}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800">
                            {item.quantity} {item.medicine?.dosage || 'unit'}
                          </p>
                          {item.medicine?.price && (
                            <p className="text-xs text-gray-500">
                              Rp{' '}
                              {(
                                parseFloat(item.medicine.price) * item.quantity
                              ).toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedPrescription.notes && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Catatan</h3>
                  <p className="bg-gray-50 p-3 rounded-lg text-gray-600">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

