// frontend/src/pages/admin/TransactionsReport.jsx
import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/patientService.js';

export default function TransactionsReport() {
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await reportService.getTransactionsReport();
      // Backend returns { transactions: [...] }
      let transactionsData = res.data?.transactions || (Array.isArray(res.data) ? res.data : []);
      
      // Apply filters
      if (filters.startDate || filters.endDate || filters.paymentMethod) {
        transactionsData = transactionsData.filter((t) => {
          const transactionDate = new Date(t.createdAt || t.created_at);
          const startDate = filters.startDate ? new Date(filters.startDate) : null;
          const endDate = filters.endDate ? new Date(filters.endDate) : null;
          
          if (startDate && transactionDate < startDate) return false;
          if (endDate && transactionDate > endDate) return false;
          if (filters.paymentMethod && t.payment_method !== filters.paymentMethod) return false;
          return true;
        });
      }
      
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      alert(err.response?.data?.error || 'Gagal memuat laporan.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const totalRevenue = transactions.reduce((sum, t) => {
    const total = parseFloat(t.total) || 0;
    return sum + total;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transaksi & Laporan</h1>
          <p className="text-gray-600 mt-1">Lihat laporan pembayaran dan transaksi</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Pendapatan</p>
          <p className="text-2xl font-bold text-green-600">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Dari Tanggal</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Metode Bayar</label>
            <select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Semua</option>
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer</option>
              <option value="ewallet">E-Wallet</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchTransactions}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              🔍 Terapkan Filter
            </button>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Daftar Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pasien</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bukti</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {t.createdAt
                    ? new Date(t.createdAt).toLocaleString('id-ID')
                    : t.created_at
                    ? new Date(t.created_at).toLocaleString('id-ID')
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {t.patient?.user?.name || t.patient_name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">
                  Rp {parseFloat(t.total || 0).toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${
                    t.payment_method === 'tunai' ? 'bg-gray-100' :
                    t.payment_method === 'transfer' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {t.payment_method}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    {t.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {t.receipt_url && (
                    <a
                      href={t.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Lihat PDF
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {transactions.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">💰</div>
            <p className="text-lg">Belum ada data transaksi</p>
          </div>
        )}
      </div>
    </div>
  );
}