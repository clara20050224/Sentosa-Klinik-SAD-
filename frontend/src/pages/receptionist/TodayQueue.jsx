import React, { useState, useEffect } from 'react';
import { receptionistService } from '../../services/patientService.js';

export default function TodayQueue() {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewQueueForm, setShowNewQueueForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');

  useEffect(() => {
    fetchQueues();
    fetchPatients();
  }, []);

  const fetchQueues = async () => {
    try {
      setLoading(true);
      const res = await receptionistService.getTodaysQueues();
      setQueues(res.data.queues || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal memuat antrian');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await receptionistService.listPatients();
      setPatients(res.data.patients || []);
    } catch (err) {
      console.error('Gagal memuat pasien', err);
    }
  };

  const handleCreateQueue = async () => {
    if (!selectedPatient) {
      setError('Pilih pasien terlebih dahulu');
      return;
    }

    try {
      await receptionistService.createQueue(selectedPatient);
      setShowNewQueueForm(false);
      setSelectedPatient('');
      setError('');
      fetchQueues();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal membuat antrian');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await receptionistService.updateQueueStatus(id, newStatus);
      fetchQueues();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Antrian Hari Ini</h1>
        <button
          onClick={() => setShowNewQueueForm(!showNewQueueForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showNewQueueForm ? 'Batal' : '+ Buat Antrian'}
        </button>
      </div>

      {showNewQueueForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Buat Antrian Baru</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Pasien
              </label>
              <select
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Pilih Pasien --</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.user_id}>
                    {patient.user?.name} ({patient.user?.email})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCreateQueue}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Buat Antrian
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Daftar Antrian</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-600">Loading...</div>
        ) : queues.length === 0 ? (
          <div className="p-6 text-center text-gray-600">Tidak ada antrian hari ini</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No. Antrian
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nama Pasien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Waktu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {queues.map((queue) => (
                  <tr key={queue.id}>
                    <td className="px-6 py-4 font-semibold text-blue-600">{queue.queue_number}</td>
                    <td className="px-6 py-4">{queue.patient_name}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          queue.status === 'menunggu'
                            ? 'bg-yellow-100 text-yellow-800'
                            : queue.status === 'dipanggil'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {queue.status === 'menunggu'
                          ? 'Menunggu'
                          : queue.status === 'dipanggil'
                          ? 'Dipanggil'
                          : 'Selesai'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(queue.created_at).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={queue.status}
                        onChange={(e) => handleUpdateStatus(queue.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="menunggu">Menunggu</option>
                        <option value="dipanggil">Dipanggil</option>
                        <option value="selesai">Selesai</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}