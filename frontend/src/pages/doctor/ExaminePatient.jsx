import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/patientService.js';
import api from '../../services/api.js';

export default function ExaminePatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [queues, setQueues] = useState([]);
  const [formData, setFormData] = useState({
    queue_id: '',
    complaint: '',
    diagnosis: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch patient info
      let patientRes;
      try {
        patientRes = await api.get(`/patients/${id}`);
      } catch (e) {
        try {
          patientRes = await api.get(`/admin/patients/${id}`);
        } catch (e2) {
          throw new Error('Pasien tidak ditemukan');
        }
      }
      setPatient(patientRes.data?.patient || patientRes.data);

      // Fetch active queues for this patient
      try {
        const queueRes = await doctorService.getQueue();
        const patientQueues = (queueRes.data?.queues || []).filter(
          (q) => (q.patient?.user_id || q.patient_id) == id && q.status !== 'selesai'
        );
        setQueues(patientQueues);
        if (patientQueues.length > 0) {
          setFormData({ ...formData, queue_id: patientQueues[0].id });
        }
      } catch (e) {
        console.error('Error fetching queues:', e);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Gagal memuat data pasien');
      navigate('/doctor');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.diagnosis) {
      setError('Diagnosa harus diisi');
      return;
    }

    try {
      setSaving(true);
      await doctorService.createMedicalRecord({
        patient_id: id,
        queue_id: formData.queue_id || null,
        complaint: formData.complaint,
        diagnosis: formData.diagnosis,
        notes: formData.notes
      });

      alert('Pemeriksaan berhasil disimpan!');
      navigate('/doctor');
    } catch (err) {
      console.error('Error saving examination:', err);
      setError(err.response?.data?.error || 'Gagal menyimpan pemeriksaan');
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

  if (!id) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-600 text-lg mb-4">Pilih pasien untuk input diagnosa</p>
          <button
            onClick={() => navigate('/doctor/patients')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Lihat Daftar Pasien
          </button>
        </div>
      </div>
    );
  }

  if (!patient && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Pasien tidak ditemukan</p>
        <button
          onClick={() => navigate('/doctor')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Kembali ke Antrian
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Input Diagnosa</h1>
          <p className="text-gray-600 mt-1">Form pemeriksaan dan diagnosa pasien</p>
        </div>
        <button
          onClick={() => navigate('/doctor')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Kembali
        </button>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Informasi Pasien</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Nama:</p>
            <p className="font-medium">{patient.user?.name || patient.name}</p>
          </div>
          <div>
            <p className="text-gray-600">No. HP:</p>
            <p className="font-medium">{patient.user?.phone || patient.phone || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Alamat:</p>
            <p className="font-medium">{patient.user?.address || patient.address || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600">Riwayat Medis:</p>
            <p className="font-medium">{patient.medical_history || 'Tidak ada'}</p>
          </div>
        </div>
      </div>

      {/* Examination Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {queues.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. Antrian
            </label>
            <select
              name="queue_id"
              value={formData.queue_id}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {queues.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.queue_number} - {q.status}
                </option>
              ))}
            </select>
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
            rows="4"
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
            rows="4"
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

        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Pemeriksaan'}
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

