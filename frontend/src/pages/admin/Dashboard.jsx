import React, { useState, useEffect } from 'react';
import { adminService, reportService } from '../../services/patientService.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayVisits: 0,
    todayRevenue: 0,
    lowStockCount: 0,
    totalTransactions: 0,
    pendingQueues: 0
  });
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, reportsRes] = await Promise.all([
        adminService.getDashboardStats(),
        reportService.getDashboardStats()
      ]);

      const dashboardData = dashboardRes.data;
      const reportsData = reportsRes.data;

      setStats({
        totalPatients: reportsData.totalPatients || 0,
        todayVisits: reportsData.todayVisits || 0,
        todayRevenue: dashboardData.totalRevenue || 0,
        lowStockCount: reportsData.lowStockMedicines || 0,
        totalTransactions: reportsData.totalTransactions || 0,
        pendingQueues: 0
      });

      setLowStockMedicines(reportsData.medicines || []);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
          <p className="text-gray-600 mt-1">Overview sistem Klinik Sentosa</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="👥"
          title="Total Pasien"
          value={stats.totalPatients}
          subtitle="Hari ini"
          color="blue"
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon="🏥"
          title="Kunjungan Hari Ini"
          value={stats.todayVisits}
          subtitle="Pemeriksaan"
          color="green"
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          icon="💰"
          title="Pendapatan Hari Ini"
          value={`Rp ${stats.todayRevenue.toLocaleString('id-ID')}`}
          subtitle="Total transaksi"
          color="yellow"
          bgColor="bg-yellow-50"
          iconColor="text-yellow-600"
        />
        <StatCard
          icon="⚠️"
          title="Stok Menipis"
          value={stats.lowStockCount}
          subtitle="Obat perlu restock"
          color="red"
          bgColor="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">⚠️ Obat Stok Menipis</h2>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {lowStockMedicines.length} item
              </span>
            </div>
          </div>
          <div className="p-6">
            {lowStockMedicines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">✅ Semua stok obat aman</p>
                <p className="text-sm mt-2">Tidak ada obat yang perlu restock</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lowStockMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{medicine.name}</p>
                      <p className="text-sm text-gray-600">{medicine.dosage}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{medicine.stock}</p>
                      <p className="text-xs text-gray-500">Min: {medicine.min_stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Aktivitas Terkini</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <p>Fitur aktivitas terkini akan segera hadir</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle, bgColor, iconColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`${bgColor} p-4 rounded-xl`}>
          <span className={`text-3xl ${iconColor}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

