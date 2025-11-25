// frontend/src/pages/patient/QueueStatus.jsx
import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService.js';
import { useNavigate } from 'react-router-dom';

export default function QueueStatus() {
  const [queue, setQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await patientService.getQueueStatus();
      setQueue(res.data?.queue || null);
    } catch (err) {
      console.error('Error fetching queue status:', err);
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Status Antrian Saya</h1>
        <p className="text-gray-600 mt-1">Informasi posisi antrian dan status pemeriksaan</p>
      </div>

      {queue ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Queue Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white text-center">
              <div className="text-6xl font-bold mb-2">{queue.queue_number}</div>
              <p className="text-lg font-medium">Nomor Antrian</p>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-block px-6 py-3 bg-blue-50 rounded-lg mb-4">
                  <p className="text-sm text-gray-600 mb-1">Posisi Antrian</p>
                  <p className="text-3xl font-bold text-blue-600">
                    Antrian ke-{queue.position}
                  </p>
                  {queue.total_in_queue > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      dari {queue.total_in_queue} antrian aktif
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    queue.status === 'menunggu' ? 'bg-yellow-100 text-yellow-800' :
                    queue.status === 'dipanggil' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {queue.status === 'menunggu' ? '⏳ Menunggu' :
                     queue.status === 'dipanggil' ? '📢 Sedang Dipanggil' : 
                     '✅ Selesai'}
                  </span>
                </div>

                {queue.status === 'menunggu' && queue.ahead_count > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Masih ada {queue.ahead_count} pasien di depan Anda
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Silakan menunggu hingga nomor antrian Anda dipanggil
                    </p>
                  </div>
                )}

                {queue.status === 'dipanggil' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
                    <p className="text-sm text-blue-800 font-bold mb-2">
                      📢 ANTRIAN ANDA DIPANGGIL!
                    </p>
                    <p className="text-xs text-blue-700">
                      Silakan segera menuju ruang pemeriksaan dokter
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Waktu Pendaftaran:</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(queue.created_at).toLocaleString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Informasi Antrian</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">🎫</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Nomor Antrian</p>
                    <p className="text-lg font-bold text-blue-600">{queue.queue_number}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Posisi</p>
                    <p className="text-lg font-bold text-gray-700">
                      Antrian ke-{queue.position}
                      {queue.total_in_queue > 0 && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          (dari {queue.total_in_queue})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {queue.ahead_count > 0 && (
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">⏱️</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Antrian di Depan</p>
                      <p className="text-lg font-bold text-yellow-600">
                        {queue.ahead_count} pasien
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Pastikan Anda berada di area klinik</li>
                <li>• Perhatikan panggilan nomor antrian</li>
                <li>• Siapkan dokumen yang diperlukan</li>
                <li>• Halaman ini akan otomatis diperbarui setiap 10 detik</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🎫</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Tidak Ada Antrian Aktif</h3>
          <p className="text-gray-600 mb-6">
            Anda belum mendaftar untuk pemeriksaan hari ini.
          </p>
          <button
            onClick={() => navigate('/dashboard/register-examination')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Daftar Pemeriksaan
          </button>
        </div>
      )}
    </div>
  );
}