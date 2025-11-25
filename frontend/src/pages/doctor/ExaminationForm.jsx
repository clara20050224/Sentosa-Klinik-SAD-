// frontend/src/pages/doctor/ExaminationForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ExaminationForm() {
  const { id } = useParams(); // patient queue id
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [formData, setFormData] = useState({
    complaint: '',
    diagnosis: '',
    notes: ''
  });
  const [prescriptionItems, setPrescriptionItems] = useState([{
    medicine_id: '',
    quantity: 1,
    dosage_instruction: '3x1 sesudah makan'
  }]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const res = await axios.get(`/api/doctor/queue/${id}`);
        setPatient(res.data);
        
        const medRes = await axios.get('/api/pharmacist/medicines');
        setMedicines(medRes.data);
      } catch (err) {
        alert('Gagal memuat data pasien.');
        navigate('/doctor');
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePrescriptionChange = (index, field, value) => {
    const newItems = [...prescriptionItems];
    newItems[index][field] = value;
    setPrescriptionItems(newItems);
  };

  const addPrescriptionItem = () => {
    setPrescriptionItems([...prescriptionItems, {
      medicine_id: '',
      quantity: 1,
      dosage_instruction: '3x1 sesudah makan'
    }]);
  };

  const removePrescriptionItem = (index) => {
    if (prescriptionItems.length <= 1) return;
    const newItems = prescriptionItems.filter((_, i) => i !== index);
    setPrescriptionItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const recordData = {
        patient_id: patient.patient_id,
        queue_id: id,
        complaint: formData.complaint,
        diagnosis: formData.diagnosis,
        notes: formData.notes,
        prescription_items: prescriptionItems.filter(item => item.medicine_id)
      };

      await axios.post('/api/doctor/records', recordData);
      alert('Pemeriksaan berhasil disimpan.');
      navigate('/doctor');
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan pemeriksaan.');
    }
  };

  if (loading) return <div className="p-6">Memuat data pasien...</div>;
  if (!patient) return <div className="p-6">Pasien tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pemeriksaan Pasien</h1>

      {/* Info Pasien */}
      <div className="bg-white rounded-lg shadow p-5 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{patient.patient_name}</h2>
            <p className="text-gray-600">Antrian: {patient.queue_number}</p>
            <p className="text-sm mt-1">Riwayat: {patient.medical_history || 'Tidak ada'}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            {patient.status}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Keluhan */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold mb-4">Keluhan Utama</h3>
          <textarea
            name="complaint"
            value={formData.complaint}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded h-24"
            placeholder="Contoh: Demam tinggi sejak 2 hari, batuk, pilek"
            required
          />
        </div>

        {/* Diagnosa */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold mb-4">Diagnosa</h3>
          <textarea
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded h-24"
            placeholder="Contoh: ISPA, Influenza, dll"
            required
          />
        </div>

        {/* Catatan */}
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="text-lg font-semibold mb-4">Catatan Tambahan</h3>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded h-24"
            placeholder="Instruksi khusus, tindak lanjut, dll"
          />
        </div>

        {/* Resep Obat */}
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Resep Obat</h3>
            <button
              type="button"
              onClick={addPrescriptionItem}
              className="text-primary hover:underline"
            >
              + Tambah Obat
            </button>
          </div>

          <div className="space-y-4">
            {prescriptionItems.map((item, index) => (
              <div key={index} className="border rounded p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Obat</label>
                    <select
                      value={item.medicine_id}
                      onChange={(e) => handlePrescriptionChange(index, 'medicine_id', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      required
                    >
                      <option value="">Pilih obat</option>
                      {medicines.map(med => (
                        <option key={med.id} value={med.id}>
                          {med.name} ({med.dosage}) — Stok: {med.stock}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Jumlah</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handlePrescriptionChange(index, 'quantity', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-1">Petunjuk</label>
                    <input
                      type="text"
                      value={item.dosage_instruction}
                      onChange={(e) => handlePrescriptionChange(index, 'dosage_instruction', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                      placeholder="3x1 sesudah makan"
                      required
                    />
                  </div>
                </div>
                {prescriptionItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrescriptionItem(index)}
                    className="mt-2 text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Tombol */}
        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Simpan & Selesai
          </button>
          <button
            type="button"
            onClick={() => navigate('/doctor')}
            className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}