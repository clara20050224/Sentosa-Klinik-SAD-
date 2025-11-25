import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService.js';

export default function PatientDashboard() {
  const [visits, setVisits] = useState([]);
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queueLoading, setQueueLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch visits
      try {
        setLoading(true);
        setError(null);
        const res = await patientService.getVisits();
        const visitsData = res.data?.visits || res.data || [];
        setVisits(Array.isArray(visitsData) ? visitsData : []);
      } catch (err) {
        console.error('Error fetching visits:', err);
        setError(err.response?.data?.error || 'Gagal memuat riwayat kunjungan');
        setVisits([]);
      } finally {
        setLoading(false);
      }

      // Fetch queue status
      try {
        setQueueLoading(true);
        const queueRes = await patientService.getQueueStatus();
        setQueue(queueRes.data?.queue || null);
      } catch (err) {
        console.error('Error fetching queue status:', err);
        setQueue(null);
      } finally {
        setQueueLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Selamat Datang di Klinik Sentosa</h2>
        <p className="text-gray-600">
          Sistem kami memastikan pelayanan kesehatan cepat, aman, dan profesional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-blue-600 text-xl">🎫</span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600 mb-1">Antrian Saat Ini</p>
              {queueLoading ? (
                <p className="text-sm text-gray-500">Memuat...</p>
              ) : queue ? (
                <>
                  <p className="text-2xl font-bold text-blue-600">{queue.queue_number}</p>
                  <p className={`text-sm ${
                    queue.status === 'menunggu' ? 'text-yellow-600' :
                    queue.status === 'dipanggil' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {queue.status === 'menunggu' ? '⏳ Menunggu' :
                     queue.status === 'dipanggil' ? '📢 Sedang Dipanggil' :
                     '✅ Selesai'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-2">Belum ada antrian</p>
                  <p className="text-xs text-gray-400 mb-2">
                    Belum melakukan pendaftaran pemeriksaan
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/register-examination')}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    Daftar Pemeriksaan →
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600">Pemeriksaan Terakhir</p>
              {loading ? (
                <p className="text-sm text-gray-500">Memuat...</p>
              ) : visits.length > 0 ? (
                <>
                  <p className="text-2xl font-bold">
                    {visits[0].createdAt 
                      ? new Date(visits[0].createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : visits[0].created_at 
                      ? new Date(visits[0].created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '-'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {visits[0].diagnosis || visits[0].complaint || 'Tidak ada diagnosa'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Belum ada pemeriksaan</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-purple-600 text-xl">💊</span>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm text-gray-600">Resep Terakhir</p>
              {loading ? (
                <p className="text-sm text-gray-500">Memuat...</p>
              ) : visits.length > 0 && visits[0].prescription ? (
                <>
                  <p className="text-2xl font-bold">
                    {visits[0].prescription.items?.length || 0} obat
                  </p>
                  <p className="text-sm text-gray-500">
                    {visits[0].prescription.items?.[0]?.medicine_name || 'Tidak ada detail'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500">Belum ada resep</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold">Riwayat Kunjungan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-red-500">
                    {error}
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    Belum ada riwayat kunjungan
                  </td>
                </tr>
              ) : (
                visits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-6 py-4 text-sm">
                      {visit.createdAt 
                        ? new Date(visit.createdAt).toLocaleDateString('id-ID')
                        : visit.created_at 
                        ? new Date(visit.created_at).toLocaleDateString('id-ID')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {visit.doctor?.user?.name || visit.doctor_name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">{visit.diagnosis || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        visit.status === 'selesai' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {visit.status === 'selesai' ? 'Selesai' : 'Menunggu'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}