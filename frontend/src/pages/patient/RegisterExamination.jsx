import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService.js';

export default function RegisterExamination() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    complaint: '',
    medical_history: '',
    blood_type: '',
    emergency_contact: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = {
        complaint: formData.complaint,
        medical_history: formData.medical_history || null,
        blood_type: formData.blood_type || null,
        emergency_contact: formData.emergency_contact || null
      };
      
      const res = await patientService.registerExamination(data);
      alert(`Pendaftaran berhasil! Nomor antrian Anda: ${res.data.queue_number || 'Akan ditentukan'}`);
      navigate('/dashboard/queue');
    } catch (err) {
      console.error('Error registering examination:', err);
      alert(err.response?.data?.error || 'Gagal mendaftar pemeriksaan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Daftar Pemeriksaan Kesehatan</h1>
        <p className="text-gray-600 mt-1">Isi formulir di bawah ini untuk mendaftar pemeriksaan kesehatan</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informasi Pasien */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Informasi Pasien</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Nama:</span>
                <span className="ml-2 font-medium text-gray-800">{user?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium text-gray-800">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Keluhan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keluhan / Gejala yang Dirasakan *
            </label>
            <textarea
              value={formData.complaint}
              onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Jelaskan keluhan atau gejala yang Anda rasakan..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Jelaskan secara detail keluhan atau gejala yang Anda alami
            </p>
          </div>

          {/* Informasi Medis */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
              Informasi Medis Tambahan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Golongan Darah
                </label>
                <select
                  value={formData.blood_type}
                  onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Golongan Darah</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontak Darurat *
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="081234567890"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nomor HP keluarga atau kerabat yang bisa dihubungi
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Riwayat Medis
                </label>
                <textarea
                  value={formData.medical_history}
                  onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Contoh: Riwayat hipertensi, diabetes, alergi obat tertentu, dll. (Kosongkan jika tidak ada)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Informasikan riwayat penyakit, alergi, atau kondisi medis yang perlu diketahui dokter
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mendaftar...' : '✅ Daftar Pemeriksaan'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-1">Informasi Penting</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Setelah mendaftar, Anda akan mendapatkan nomor antrian</li>
              <li>• Nomor antrian akan ditampilkan di halaman "Status Antrian"</li>
              <li>• Pastikan data yang diisi sudah benar dan lengkap</li>
              <li>• Datang tepat waktu sesuai dengan nomor antrian Anda</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

