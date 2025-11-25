// frontend/src/pages/admin/VisitsReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VisitsReport() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await axios.get('/api/reports/visits');
        setData(res.data.visits);
        setSummary(res.data.summary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisits();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Laporan Kunjungan Pasien</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-600">Total Kunjungan</p>
          <p className="text-2xl font-bold">{summary.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-600">Hari Ini</p>
          <p className="text-2xl font-bold text-primary">{summary.today || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-600">Rata-rata/Hari</p>
          <p className="text-2xl font-bold">{summary.average || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <p className="text-sm text-gray-600">Dokter Teraktif</p>
          <p className="text-lg font-bold">{summary.topDoctor?.name || '-'}</p>
        </div>
      </div>

      {/* Tabel Kunjungan */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasien</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dokter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diagnosa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((visit) => (
              <tr key={visit.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(visit.created_at).toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{visit.patient_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{visit.doctor_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{visit.diagnosis || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {visit.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <div className="p-6 text-center text-gray-500">Tidak ada kunjungan.</div>}
      </div>
    </div>
  );
}