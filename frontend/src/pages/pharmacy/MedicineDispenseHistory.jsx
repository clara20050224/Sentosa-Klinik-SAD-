import React, { useState, useEffect } from 'react';
import { pharmacistService } from '../../services/patientService.js';
import { useNavigate } from 'react-router-dom';

export default function MedicineDispenseHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    medicineId: ''
  });
  const [medicines, setMedicines] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch medicines
      const medRes = await pharmacistService.getMedicines();
      setMedicines(medRes.data?.medicines || medRes.data || []);

      // Fetch prescriptions
      const prescRes = await pharmacistService.getPrescriptions();
      const prescriptions = prescRes.data?.prescriptions || [];

      // Build history from dispensed prescriptions
      const historyData = [];
      prescriptions.forEach((presc) => {
        if (presc.status === 'diberikan' && presc.items) {
          presc.items.forEach((item) => {
            historyData.push({
              id: `${presc.id}-${item.medicine_id}`,
              date: presc.updatedAt || presc.createdAt,
              prescription_id: presc.id,
              medicine_id: item.medicine_id,
              medicine_name: item.medicine?.name || '-',
              medicine_dosage: item.medicine?.dosage || '-',
              quantity: item.quantity,
              patient: presc.medical_record?.patient?.user?.name || '-',
              doctor: presc.medical_record?.doctor?.user?.name || '-',
              diagnosis: presc.medical_record?.diagnosis || '-'
            });
          });
        }
      });

      // Sort by date descending
      historyData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistory(historyData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter.startDate) {
      const itemDate = new Date(item.date);
      const startDate = new Date(filter.startDate);
      if (itemDate < startDate) return false;
    }
    if (filter.endDate) {
      const itemDate = new Date(item.date);
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (itemDate > endDate) return false;
    }
    if (filter.medicineId) {
      if (item.medicine_id != filter.medicineId) return false;
    }
    return true;
  });

  const totalDispensed = filteredHistory.reduce((sum, item) => sum + item.quantity, 0);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Pengeluaran Obat</h1>
          <p className="text-gray-600 mt-1">Daftar semua obat yang telah diserahkan ke pasien</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-blue-600">{totalDispensed} unit</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Jumlah Transaksi</p>
          <p className="text-2xl font-bold text-green-600">{filteredHistory.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Jenis Obat</p>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(filteredHistory.map((h) => h.medicine_id)).size}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={filter.startDate}
              onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={filter.endDate}
              onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Obat
            </label>
            <select
              value={filter.medicineId}
              onChange={(e) => setFilter({ ...filter, medicineId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Obat</option>
              {medicines.map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name} ({med.dosage})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Daftar Pengeluaran ({filteredHistory.length} item)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Obat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dokter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Resep
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">📋</div>
                    <p className="text-lg">Tidak ada riwayat pengeluaran</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.date
                        ? new Date(item.date).toLocaleString('id-ID')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-800">{item.medicine_name}</p>
                        <p className="text-xs text-gray-500">{item.medicine_dosage}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-semibold text-gray-800">{item.quantity} unit</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.patient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.doctor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      #{item.prescription_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/pharmacist/medicines/${item.medicine_id}`)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        👁️ Detail Obat
                      </button>
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

