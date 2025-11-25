// frontend/src/pages/admin/UsersManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/patientService.js';

const ROLES = ['admin', 'dokter', 'apoteker', 'kasir'];

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'resepsionis',
    phone: '',
    address: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getAllUsers();
      setUsers(Array.isArray(res.data) ? res.data : res.data?.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      alert(err.response?.data?.error || 'Gagal memuat data user.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await adminService.updateUser(editingId, form);
        alert('User berhasil diperbarui!');
      } else {
        await adminService.createUser({ ...form, password: 'default123' });
        alert('User berhasil dibuat!');
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      alert(err.response?.data?.error || 'Gagal menyimpan user.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || ''
    });
    setEditingId(user.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus user ini?')) return;
    try {
      await adminService.deleteUser(id);
      alert('User berhasil dihapus!');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert(err.response?.data?.error || 'Gagal menghapus user.');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      role: 'resepsionis',
      phone: '',
      address: ''
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen User</h1>
          <p className="text-gray-600 mt-1">Kelola user untuk role: Admin, Dokter, Apoteker, Kasir</p>
        </div>
        <button
          onClick={resetForm}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Tambah User</span>
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editingId ? '✏️ Edit User' : '➕ Tambah User Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              {ROLES.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">No. HP</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Alamat</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              rows="2"
            />
          </div>
          <div className="md:col-span-2 flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50"
              >
                Batal Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Daftar User</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. HP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'dokter' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{user.phone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {users.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Belum ada data user
          </div>
        )}
      </div>
    </div>
  );
}