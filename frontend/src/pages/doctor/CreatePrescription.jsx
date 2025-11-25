import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/patientService.js';
import api from '../../services/api.js';

export default function CreatePrescription() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const [medicalRecord, setMedicalRecord] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [prescriptionItems, setPrescriptionItems] = useState([
    { medicine_id: '', quantity: 1, dosage_instruction: '3x1 sesudah makan' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [recordId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch medical record
      const recordRes = await api.get(`/doctor/records/${recordId}`);
      setMedicalRecord(recordRes.data);

      // Fetch medicines
      const medRes = await api.get('/pharmacist/medicines');
      setMedicines(medRes.data?.medicines || medRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Gagal memuat data');
      navigate('/doctor');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionChange = (index, field, value) => {
    const newItems = [...prescriptionItems];
    newItems[index][field] = value;
    setPrescriptionItems(newItems);
  };

  const addPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { medicine_id: '', quantity: 1, dosage_instruction: '3x1 sesudah makan' }
    ]);
  };

  const removePrescriptionItem = (index) => {
    if (prescriptionItems.length > 1) {
      setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const validItems = prescriptionItems.filter(
        (item) => item.medicine_id && item.quantity > 0 && item.dosage_instruction
      );

      if (validItems.length === 0) {
        setError('Minimal harus ada 1 item obat dalam resep');
        setSaving(false);
        return;
      }

      await doctorService.createPrescription({
        medical_record_id: recordId,
        prescription_items: validItems
      });

      alert('Resep berhasil dibuat!');
      navigate('/doctor');
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError(err.response?.data?.error || 'Gagal membuat resep');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Buat Resep Digital</h1>
          <p className="text-gray-600 mt-1">Buat resep untuk pemeriksaan pasien</p>
        </div>
        <button
          onClick={() => navigate('/doctor')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Kembali
        </button>
      </div>

      {/* Patient Info */}
      {medicalRecord && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Informasi Pemeriksaan</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Pasien:</p>
              <p className="font-medium">
                {medicalRecord.patient?.user?.name || medicalRecord.patient_name || '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Diagnosa:</p>
              <p className="font-medium">{medicalRecord.diagnosis || '-'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Prescription Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Obat</h2>
          <button
            type="button"
            onClick={addPrescriptionItem}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            ➕ Tambah Obat
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {prescriptionItems.map((item, index) => {
            const selectedMedicine = medicines.find((m) => m.id === parseInt(item.medicine_id));
            return (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-lg p-5 bg-gray-50 hover:border-blue-300 transition"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Obat #{index + 1}</h3>
                  {prescriptionItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrescriptionItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Hapus
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Obat *
                    </label>
                    <select
                      value={item.medicine_id}
                      onChange={(e) =>
                        handlePrescriptionChange(index, 'medicine_id', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Pilih obat</option>
                      {medicines.map((med) => (
                        <option key={med.id} value={med.id}>
                          {med.name} ({med.dosage}) - Stok: {med.stock}
                        </option>
                      ))}
                    </select>
                    {selectedMedicine && selectedMedicine.stock <= selectedMedicine.min_stock && (
                      <p className="text-xs text-red-600 mt-1">⚠️ Stok menipis!</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedMedicine?.stock || 999}
                      value={item.quantity}
                      onChange={(e) =>
                        handlePrescriptionChange(index, 'quantity', parseInt(e.target.value) || 1)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    {selectedMedicine && (
                      <p className="text-xs text-gray-500 mt-1">
                        Stok tersedia: {selectedMedicine.stock}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Petunjuk Penggunaan *
                    </label>
                    <input
                      type="text"
                      value={item.dosage_instruction}
                      onChange={(e) =>
                        handlePrescriptionChange(index, 'dosage_instruction', e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="3x1 sesudah makan"
                      required
                    />
                  </div>
                </div>
                {selectedMedicine && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Harga:</span> Rp{' '}
                      {parseFloat(selectedMedicine.price || 0).toLocaleString('id-ID')} per unit
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Subtotal:</span> Rp{' '}
                      {(
                        parseFloat(selectedMedicine.price || 0) * (item.quantity || 1)
                      ).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-800">Total Item:</span>
            <span className="text-xl font-bold text-blue-600">
              {prescriptionItems.filter((item) => item.medicine_id).length} obat
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Resep'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/doctor')}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}

