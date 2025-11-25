import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/patientService.js';

export default function PatientManagement() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllPatients();
      setPatients(res.data?.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
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
    <div className="space-y-6 w-full max-w-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Pasien</h1>
          <p className="text-gray-600 mt-1">Daftar pasien yang telah mendaftar untuk pemeriksaan</p>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden w-full max-w-full">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Daftar Pasien ({patients.length})
          </h3>
        </div>
        <div className="overflow-x-auto w-full" style={{ maxWidth: '100%' }}>
          <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'auto', width: '100%' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                  No
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Nama
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                  Email
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  No. HP
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Alamat
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Gol. Darah
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[130px]">
                  Kontak Darurat
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Riwayat Medis
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                  Status Antrian
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-lg">Belum ada data pasien</p>
                    <p className="text-sm mt-2">Data pasien akan muncul di sini setelah pasien mendaftar untuk pemeriksaan melalui menu "Ingin Melakukan Pemeriksaan"</p>
                  </td>
                </tr>
              ) : (
                patients.map((patient, index) => (
                  <tr key={patient.user_id || patient.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-medium">{index + 1}</div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={patient.user?.name || patient.name || ''}>
                        {patient.user?.name || patient.name || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm text-gray-600 truncate max-w-[180px]" title={patient.user?.email || patient.email || ''}>
                        {patient.user?.email || patient.email || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {patient.user?.phone || patient.phone || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm text-gray-600 truncate max-w-[200px]" title={patient.user?.address || patient.address || ''}>
                        {patient.user?.address || patient.address || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {patient.blood_type || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {patient.emergency_contact || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm text-gray-600 truncate max-w-[200px]" title={patient.medical_history || ''}>
                        {patient.medical_history ? (patient.medical_history.length > 40 ? patient.medical_history.substring(0, 40) + '...' : patient.medical_history) : '-'}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      {patient.latest_queue ? (
                        <div className="flex flex-col space-y-1">
                          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                            <span>🎫</span>
                            <span>Antrian: {patient.latest_queue.queue_number}</span>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            patient.latest_queue.status === 'menunggu' ? 'bg-yellow-100 text-yellow-800' :
                            patient.latest_queue.status === 'dipanggil' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {patient.latest_queue.status === 'menunggu' ? '⏳ Menunggu' :
                             patient.latest_queue.status === 'dipanggil' ? '📢 Dipanggil' :
                             '✅ Selesai'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
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

