// frontend/src/pages/receptionist/RegisterPatient.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RegisterPatient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    blood_type: '',
    emergency_contact: ''
  });
  const [step, setStep] = useState(1); // 1: data pasien, 2: konfirmasi antrian
  const [queueNumber, setQueueNumber] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Daftar pasien (jika belum ada)
      let patientId;
      if (formData.email) {
        const userRes = await axios.post('/api/auth/register', {
          ...formData,
          role: 'pasien',
          password: 'default123' // Password default
        });
        patientId = userRes.data.user.id;
      } else {
        // Untuk tamu (tanpa email), buat pasien manual
        const guestRes = await axios.post('/api/receptionist/patients', formData);
        patientId = guestRes.data.id;
      }

      // Step 2: Buat antrian
      const queueRes = await axios.post('/api/receptionist/queue', {
        patientId
      });
      setQueueNumber(queueRes.data.queue.queue_number);
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal mendaftarkan pasien.');
    }
  };

  const handleNewPatient = () => {
    setStep(1);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      blood_type: '',
      emergency_contact: ''
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {step === 1 ? 'Daftar Pasien Baru' : 'Antrian Berhasil Dibuat'}
      </h1>

      {step === 1 ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nama Lengkap *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Email (Opsional)</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="kosongkan untuk tamu"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">No. HP *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Alamat</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Golongan Darah</label>
              <select
                name="blood_type"
                value={formData.blood_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">Pilih</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Kontak Darurat</label>
              <input
                type="tel"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                placeholder="081234567890"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-blue-700"
          >
            Daftar & Buat Antrian
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-lg shadow text-center p-8">
          <div className="text-6xl font-bold text-green-500 mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-800">Pendaftaran Berhasil!</h2>
          <p className="text-gray-600 mt-2">Pasien telah masuk antrian.</p>

          <div className="mt-6">
            <div className="text-4xl font-bold text-primary">{queueNumber}</div>
            <p className="text-gray-600 mt-2">Silakan berikan nomor ini ke pasien.</p>
          </div>

          <div className="mt-8 space-x-3">
            <button
              onClick={handleNewPatient}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Daftar Pasien Lain
            </button>
            <button
              onClick={() => navigate('/receptionist')}
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
            >
              Lihat Antrian Hari Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}