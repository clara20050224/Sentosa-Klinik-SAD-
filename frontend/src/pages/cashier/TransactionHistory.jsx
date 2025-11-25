import React, { useState, useEffect } from 'react';
import { cashierService } from '../../services/patientService.js';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    startDate: '',
    endDate: '',
    paymentMethod: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await cashierService.getTransactionHistory();
      setTransactions(res.data?.transactions || res.data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter.startDate) {
      const transactionDate = new Date(t.createdAt || t.created_at);
      const startDate = new Date(filter.startDate);
      if (transactionDate < startDate) return false;
    }
    if (filter.endDate) {
      const transactionDate = new Date(t.createdAt || t.created_at);
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (transactionDate > endDate) return false;
    }
    if (filter.paymentMethod) {
      if (t.payment_method !== filter.paymentMethod) return false;
    }
    return true;
  });

  const totalRevenue = filteredTransactions.reduce((sum, t) => {
    return sum + parseFloat(t.total || 0);
  }, 0);

  const handlePrintReceipt = (transaction) => {
    const printWindow = window.open('', '_blank');
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Struk Pembayaran</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 5px 0; font-size: 12px; }
            .section { margin: 15px 0; }
            .section h3 { margin: 0 0 10px 0; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { font-weight: bold; font-size: 18px; margin-top: 10px; padding-top: 10px; border-top: 2px solid #000; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KLINIK SENTOSA</h1>
            <p>Jl. Contoh No. 123, Kota</p>
            <p>Telp: (021) 1234-5678</p>
          </div>
          
          <div class="section">
            <h3>Informasi Pasien</h3>
            <div class="row">
              <span>Nama:</span>
              <span>${transaction.patient?.user?.name || transaction.patient_name || '-'}</span>
            </div>
            <div class="row">
              <span>Tanggal:</span>
              <span>${transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('id-ID') : '-'}</span>
            </div>
            <div class="row">
              <span>No. Transaksi:</span>
              <span>#${transaction.id}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Rincian Pembayaran</h3>
            <div class="row total">
              <span>Total:</span>
              <span>Rp ${parseFloat(transaction.total || 0).toLocaleString('id-ID')}</span>
            </div>
            <div class="row">
              <span>Metode Pembayaran:</span>
              <span>${(transaction.payment_method || 'tunai').toUpperCase()}</span>
            </div>
            <div class="row">
              <span>Status:</span>
              <span>${transaction.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Terima kasih atas kunjungan Anda</p>
            <p>Semoga lekas sembuh</p>
          </div>
          
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Cetak Struk
          </button>
        </body>
      </html>
    `;
    printWindow.document.write(receiptContent);
    printWindow.document.close();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Riwayat Pembayaran</h1>
          <p className="text-gray-600 mt-1">Daftar semua transaksi pembayaran</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Pendapatan</p>
          <p className="text-2xl font-bold text-green-600">
            Rp {totalRevenue.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Jumlah Transaksi</p>
          <p className="text-2xl font-bold text-blue-600">{filteredTransactions.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Rata-rata per Transaksi</p>
          <p className="text-2xl font-bold text-purple-600">
            Rp {filteredTransactions.length > 0 ? (totalRevenue / filteredTransactions.length).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}
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
              Metode Pembayaran
            </label>
            <select
              value={filter.paymentMethod}
              onChange={(e) => setFilter({ ...filter, paymentMethod: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Metode</option>
              <option value="tunai">Tunai</option>
              <option value="transfer">Transfer Bank</option>
              <option value="ewallet">E-Wallet</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Daftar Transaksi ({filteredTransactions.length})
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
                  Pasien
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Metode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">🧾</div>
                    <p className="text-lg">Tidak ada transaksi</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {transaction.createdAt
                        ? new Date(transaction.createdAt).toLocaleString('id-ID')
                        : transaction.created_at
                        ? new Date(transaction.created_at).toLocaleString('id-ID')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-gray-800">
                          {transaction.patient?.user?.name || transaction.patient_name || '-'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.patient?.user?.email || transaction.patient_email || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      Rp {parseFloat(transaction.total || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.payment_method === 'tunai' ? 'bg-gray-100' :
                        transaction.payment_method === 'transfer' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {transaction.payment_method === 'tunai' ? 'Tunai' :
                         transaction.payment_method === 'transfer' ? 'Transfer' :
                         'E-Wallet'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'lunas'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handlePrintReceipt(transaction)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        🖨️ Cetak
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

