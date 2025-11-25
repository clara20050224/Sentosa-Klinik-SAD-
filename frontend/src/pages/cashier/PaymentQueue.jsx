import React, { useState, useEffect } from 'react';
import { cashierService } from '../../services/patientService.js';
import api from '../../services/api.js';

export default function PaymentQueue() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    payment_method: 'tunai',
    amount_paid: ''
  });
  const [calculation, setCalculation] = useState({
    examination_fee: 0,
    medicine_total: 0,
    total: 0
  });

  useEffect(() => {
    fetchCompletedPatients();
  }, []);

  const fetchCompletedPatients = async () => {
    try {
      setLoading(true);
      // Get medical records with status 'selesai' that don't have transaction yet
      const res = await api.get('/cashier/completed-patients');
      setPatients(res.data?.patients || res.data || []);
    } catch (err) {
      console.error('Error fetching completed patients:', err);
      // Fallback: try to get from pending payments
      try {
        const pendingRes = await cashierService.getPendingPayments();
        setPatients(pendingRes.data?.transactions || []);
      } catch (e) {
        console.error('Error fetching pending payments:', e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    
    // Calculate total cost
    try {
      const medicalRecordId = patient.medical_record_id || patient.medical_record?.id;
      if (medicalRecordId) {
        const recordRes = await api.get(`/doctor/records/${medicalRecordId}`);
        const record = recordRes.data?.record || recordRes.data;
        
        // Get prescription if exists
        let medicineTotal = 0;
        if (record.prescription || record.prescription_id) {
          const prescId = record.prescription?.id || record.prescription_id;
          try {
            const prescRes = await api.get(`/pharmacist/prescriptions`);
            const prescriptions = prescRes.data?.prescriptions || [];
            const prescription = prescriptions.find(p => p.id == prescId || p.medical_record_id == medicalRecordId);
            if (prescription && (prescription.items || prescription.prescription_items)) {
              const items = prescription.items || prescription.prescription_items || [];
              items.forEach((item) => {
                const price = parseFloat(item.medicine?.price || 0);
                const quantity = parseInt(item.quantity || 0);
                medicineTotal += price * quantity;
              });
            }
          } catch (e) {
            console.error('Error fetching prescription:', e);
          }
        }
        
        // Examination fee (default 50000)
        const examinationFee = 50000;
        const total = examinationFee + medicineTotal;
        
        setCalculation({
          examination_fee: examinationFee,
          medicine_total: medicineTotal,
          total: total
        });
        setFormData({ ...formData, amount_paid: total.toString() });
      }
    } catch (err) {
      console.error('Error calculating cost:', err);
      // Default calculation
      const defaultTotal = parseFloat(patient.total || 50000);
      setCalculation({
        examination_fee: 50000,
        medicine_total: defaultTotal - 50000,
        total: defaultTotal
      });
      setFormData({ ...formData, amount_paid: defaultTotal.toString() });
    }
    
    setShowPaymentModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProcessPayment = async () => {
    if (!selectedPatient) {
      alert('Pilih pasien terlebih dahulu');
      return;
    }

    if (!formData.amount_paid || parseFloat(formData.amount_paid) < calculation.total) {
      alert(`Jumlah pembayaran minimal Rp ${calculation.total.toLocaleString('id-ID')}`);
      return;
    }

    try {
      const medicalRecordId = selectedPatient.medical_record_id || selectedPatient.medical_record?.id;
      const patientId = selectedPatient.patient_id || selectedPatient.patient?.user_id || selectedPatient.patient_id;
      
      const transactionRes = await cashierService.processTransaction({
        patient_id: patientId,
        medical_record_id: medicalRecordId,
        total: calculation.total,
        payment_method: formData.payment_method,
        amount_paid: parseFloat(formData.amount_paid)
      });

      // Print receipt
      handlePrintReceipt(transactionRes.data?.transaction || { ...selectedPatient, ...calculation });

      setShowPaymentModal(false);
      setSelectedPatient(null);
      setFormData({ payment_method: 'tunai', amount_paid: '' });
      fetchCompletedPatients();
      alert('Pembayaran berhasil diproses!');
    } catch (err) {
      console.error('Error processing payment:', err);
      alert(err.response?.data?.error || 'Gagal memproses pembayaran');
    }
  };

  const handlePrintReceipt = (transaction) => {
    const printWindow = window.open('', '_blank');
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; font-size: 12px; }
            .section { margin: 15px 0; }
            .section h3 { margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #000; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KLINIK SENTOSA</h1>
            <p>Jl. Contoh No. 123, Kota</p>
            <p>Telp: (021) 1234-5678</p>
          </div>
          
          <div class="section">
            <h3>Informasi Pasien</h3>
            <div class="row">
              <span>Nama:</span>
              <span>${selectedPatient?.patient?.user?.name || selectedPatient?.patient_name || '-'}</span>
            </div>
            <div class="row">
              <span>Tanggal:</span>
              <span>${new Date().toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Rincian Pembayaran</h3>
            <div class="row">
              <span>Biaya Pemeriksaan:</span>
              <span>Rp ${calculation.examination_fee.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span>Biaya Obat:</span>
              <span>Rp ${calculation.medicine_total.toLocaleString('id-ID')}</span>
            </div>
            <div class="row total">
              <span>Total:</span>
              <span>Rp ${calculation.total.toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span>Metode Pembayaran:</span>
              <span>${formData.payment_method.toUpperCase()}</span>
            </div>
            <div class="row">
              <span>Jumlah Dibayar:</span>
              <span>Rp ${parseFloat(formData.amount_paid || 0).toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span>Kembalian:</span>
              <span>Rp ${(parseFloat(formData.amount_paid || 0) - calculation.total).toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Terima kasih atas kunjungan Anda</p>
            <p>Semoga lekas sembuh</p>
          </div>
          
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Cetak Struk
          </button>
        </body>
      </html>
    `;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
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
          <h1 className="text-3xl font-bold text-gray-800">Daftar Pembayaran</h1>
          <p className="text-gray-600 mt-1">Pasien yang sudah selesai diperiksa dan siap dibayar</p>
        </div>
        <button
          onClick={fetchCompletedPatients}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Patients List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Pasien Selesai Diperiksa ({patients.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Pemeriksaan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Diagnosa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">💰</div>
                    <p className="text-lg">Tidak ada pasien yang siap dibayar</p>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id || patient.medical_record_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {patient.patient?.user?.name || patient.patient_name || '-'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {patient.patient?.user?.email || patient.patient_email || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {patient.medical_record?.createdAt
                        ? new Date(patient.medical_record.createdAt).toLocaleString('id-ID')
                        : patient.createdAt
                        ? new Date(patient.createdAt).toLocaleString('id-ID')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {patient.medical_record?.diagnosis || patient.diagnosis || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Menunggu Pembayaran
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleSelectPatient(patient)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        💳 Proses Pembayaran
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Proses Pembayaran</h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPatient(null);
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
                      {selectedPatient.patient?.user?.name || selectedPatient.patient_name || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>{' '}
                    <span className="font-medium">
                      {selectedPatient.patient?.user?.email || selectedPatient.patient_email || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Calculation */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Rincian Biaya</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biaya Pemeriksaan:</span>
                    <span className="font-medium">Rp {calculation.examination_fee.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biaya Obat:</span>
                    <span className="font-medium">Rp {calculation.medicine_total.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-lg text-blue-600">
                      Rp {calculation.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metode Pembayaran *
                  </label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="tunai">Tunai</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="ewallet">E-Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Dibayar *
                  </label>
                  <input
                    type="number"
                    name="amount_paid"
                    value={formData.amount_paid}
                    onChange={handleInputChange}
                    min={calculation.total}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formData.amount_paid && parseFloat(formData.amount_paid) >= calculation.total && (
                    <p className="text-sm text-green-600 mt-1">
                      Kembalian: Rp {(parseFloat(formData.amount_paid) - calculation.total).toLocaleString('id-ID')}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleProcessPayment}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  💳 Konfirmasi Pembayaran
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPatient(null);
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
