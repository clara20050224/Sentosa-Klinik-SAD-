// frontend/src/pages/admin/MedicineUsageChart.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function MedicineUsageChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await axios.get('/api/reports/medicine-usage');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Penggunaan Obat (30 Hari Terakhir)</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-96 flex flex-col justify-end items-center space-y-4">
          {data.length > 0 ? (
            data.map((item, idx) => (
              <div key={idx} className="w-full flex items-end space-x-4">
                <div className="w-32 text-right text-sm text-gray-600 truncate">
                  {item.name} ({item.dosage})
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-8">
                  <div
                    className="bg-primary h-8 rounded-full flex items-center justify-end pr-2 text-white text-sm font-medium"
                    style={{ width: `${Math.min(100, (item.total_used / Math.max(...data.map(d => d.total_used))) * 100)}%` }}
                  >
                    {item.total_used}x
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Tidak ada data penggunaan obat.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Statistik</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Jenis Obat</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Penggunaan</p>
            <p className="text-2xl font-bold">
              {data.reduce((sum, item) => sum + item.total_used, 0)}x
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Obat Terbanyak Dipakai</p>
            <p className="text-lg font-bold">
              {data.length > 0 ? data[0].name : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}