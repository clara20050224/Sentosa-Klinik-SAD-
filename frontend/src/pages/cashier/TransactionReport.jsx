import React, { useState, useEffect } from 'react';
import { cashierService } from '../../services/patientService.js';

export default function TransactionReport() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('daily'); // 'daily' or 'monthly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    fetchTransactions();
  }, [reportType, selectedDate, selectedMonth]);

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

  const getFilteredTransactions = () => {
    if (reportType === 'daily') {
      return transactions.filter((t) => {
        const transactionDate = new Date(t.createdAt || t.created_at);
        const selected = new Date(selectedDate);
        return (
          transactionDate.getDate() === selected.getDate() &&
          transactionDate.getMonth() === selected.getMonth() &&
          transactionDate.getFullYear() === selected.getFullYear()
        );
      });
    } else {
      return transactions.filter((t) => {
        const transactionDate = new Date(t.createdAt || t.created_at);
        const selected = new Date(selectedMonth + '-01');
        return (
          transactionDate.getMonth() === selected.getMonth() &&
          transactionDate.getFullYear() === selected.getFullYear()
        );
      });
    }
  };

  const filteredTransactions = getFilteredTransactions();

  const calculateStats = () => {
    const total = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.total || 0), 0);
    const byMethod = {
      tunai: 0,
      transfer: 0,
      ewallet: 0
    };
    filteredTransactions.forEach((t) => {
      const method = t.payment_method || 'tunai';
      if (byMethod[method] !== undefined) {
        byMethod[method] += parseFloat(t.total || 0);
      }
    });
    return { total, byMethod, count: filteredTransactions.length };
  };

  const stats = calculateStats();

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Transaksi ${reportType === 'daily' ? 'Harian' : 'Bulanan'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 24px; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
            .stat-box { border: 1px solid #ccc; padding: 15px; border-radius: 5px; }
            .stat-box h3 { margin: 0 0 10px 0; font-size: 14px; }
            .stat-box p { margin: 0; font-size: 20px; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f0f0f0; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KLINIK SENTOSA</h1>
            <p>Laporan Transaksi ${reportType === 'daily' ? 'Harian' : 'Bulanan'}</p>
            <p>${reportType === 'daily' ? new Date(selectedDate).toLocaleDateString('id-ID') : new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <h3>Total Pendapatan</h3>
              <p>Rp ${stats.total.toLocaleString('id-ID')}</p>
            </div>
            <div class="stat-box">
              <h3>Jumlah Transaksi</h3>
              <p>${stats.count}</p>
            </div>
            <div class="stat-box">
              <h3>Rata-rata</h3>
              <p>Rp ${stats.count > 0 ? (stats.total / stats.count).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Pasien</th>
                <th>Total</th>
                <th>Metode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map((t) => `
                <tr>
                  <td>${t.createdAt ? new Date(t.createdAt).toLocaleString('id-ID') : '-'}</td>
                  <td>${t.patient?.user?.name || t.patient_name || '-'}</td>
                  <td>Rp ${parseFloat(t.total || 0).toLocaleString('id-ID')}</td>
                  <td>${(t.payment_method || 'tunai').toUpperCase()}</td>
                  <td>${t.status === 'lunas' ? 'LUNAS' : 'BELUM LUNAS'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Cetak Laporan
          </button>
        </body>
      </html>
    `;
    printWindow.document.write(reportContent);
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
          <h1 className="text-3xl font-bold text-gray-800">Laporan Transaksi</h1>
          <p className="text-gray-600 mt-1">Laporan transaksi harian dan bulanan</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          📄 Export PDF
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setReportType('daily')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              reportType === 'daily'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Laporan Harian
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              reportType === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Laporan Bulanan
          </button>
        </div>
        <div>
          {reportType === 'daily' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Bulan
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Pendapatan</p>
          <p className="text-2xl font-bold text-green-600">
            Rp {stats.total.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Jumlah Transaksi</p>
          <p className="text-2xl font-bold text-blue-600">{stats.count}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Rata-rata per Transaksi</p>
          <p className="text-2xl font-bold text-purple-600">
            Rp {stats.count > 0 ? (stats.total / stats.count).toLocaleString('id-ID', { maximumFractionDigits: 0 }) : '0'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Tunai</p>
          <p className="text-xl font-bold text-gray-800">
            Rp {stats.byMethod.tunai.toLocaleString('id-ID')}
          </p>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-lg">Tidak ada transaksi pada periode ini</p>
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
                      {transaction.patient?.user?.name || transaction.patient_name || '-'}
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

