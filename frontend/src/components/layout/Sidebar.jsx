import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Link, useLocation } from 'react-router-dom';

const menuConfig = {
  pasien: [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Profil', path: '/dashboard/profile', icon: '👤' },
    { label: 'Riwayat', path: '/dashboard/history', icon: '📜' },
    { label: 'Status Antrian', path: '/dashboard/queue', icon: '🎫' },
    { label: 'Ingin Melakukan Pemeriksaan', path: '/dashboard/register-examination', icon: '🏥' }
  ],
  dokter: [
    { label: 'Daftar Antrian Pasien', path: '/doctor', icon: '👨‍⚕️' },
    { label: 'Detail Data Pasien', path: '/doctor/patients', icon: '👤' },
    { label: 'Riwayat Medis Pasien', path: '/doctor/history', icon: '📋' },
    { label: 'Update Status Pemeriksaan', path: '/doctor/examinations', icon: '🔄' }
  ],
  apoteker: [
    { label: 'Daftar Resep', path: '/pharmacist', icon: '💊' },
    { label: 'Kelola Obat', path: '/pharmacist/medicines', icon: '📦' },
    { label: 'Riwayat Pengeluaran', path: '/pharmacist/history', icon: '📋' }
  ],
  kasir: [
    { label: 'Daftar Pembayaran', path: '/cashier', icon: '💰' },
    { label: 'Riwayat Pembayaran', path: '/cashier/history', icon: '🧾' },
    { label: 'Laporan Transaksi', path: '/cashier/report', icon: '📊' }
  ],
  admin: [
    { label: 'Dashboard', path: '/admin', icon: '📊' },
    { label: 'Manajemen Pasien', path: '/admin/patients', icon: '👥' },
    { label: 'Manajemen User', path: '/admin/users', icon: '👤' },
    { label: 'Manajemen Obat', path: '/admin/medicines', icon: '💊' },
    { label: 'Pemeriksaan & Resep', path: '/admin/examinations', icon: '🏥' },
    { label: 'Transaksi & Laporan', path: '/admin/reports', icon: '📄' }
  ]
};

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menus = menuConfig[user.role] || [];

  return (
    <aside className="w-64 bg-white shadow-md h-full overflow-y-auto">
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-lg font-bold text-blue-700">Menu {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</h2>
        <p className="text-sm text-gray-600 mt-1">{user.name}</p>
      </div>
      
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {menus.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition font-medium ${
                  location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}