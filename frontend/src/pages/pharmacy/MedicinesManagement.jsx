import React, { useState, useEffect } from 'react';
import { pharmacistService } from '../../services/patientService.js';
import { useNavigate } from 'react-router-dom';

export default function MedicinesManagement() {
  const [medicines, setMedicines] = useState([]);
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    stock: '',
    price: '',
    min_stock: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const res = await pharmacistService.getMedicines();
      setMedicines(Array.isArray(res.data) ? res.data : res.data?.medicines || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      alert(err.response?.data?.error || 'Gagal memuat data obat.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm({ name: '', dosage: '', stock: '', price: '', min_stock: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = {
        ...form,
        stock: parseInt(form.stock),
        price: parseFloat(form.price),
        min_stock: parseInt(form.min_stock)
      };

      if (editingId) {
        await pharmacistService.updateMedicine(editingId, formData);
        alert('Obat berhasil diperbarui!');
      } else {
        await pharmacistService.createMedicine(formData);
        alert('Obat berhasil ditambahkan!');
      }
      resetForm();
      fetchMedicines();
    } catch (err) {
      console.error('Error saving medicine:', err);
      alert(err.response?.data?.error || 'Gagal menyimpan obat.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medicine) => {
    setForm({
      name: medicine.name || '',
      dosage: medicine.dosage || '',
      stock: medicine.stock || '',
      price: medicine.price || '',
      min_stock: medicine.min_stock || ''
    });
    setEditingId(medicine.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus obat ini?')) return;
    try {
      await pharmacistService.deleteMedicine(id);
      alert('Obat berhasil dihapus!');
      fetchMedicines();
    } catch (err) {
      console.error('Error deleting medicine:', err);
      alert(err.response?.data?.error || 'Gagal menghapus obat.');
    }
  };

  const filteredMedicines = medicines.filter((med) => {
    const search = searchTerm.toLowerCase();
    return (
      med.name?.toLowerCase().includes(search) ||
      med.dosage?.toLowerCase().includes(search)
    );
  });

  const lowStockMedicines = filteredMedicines.filter(
    (med) => med.stock <= med.min_stock
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Kelola Obat</h1>
          <p className="text-gray-600 mt-1">Manajemen data obat dan stok</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          ➕ Tambah Obat
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-800">
                Peringatan: {lowStockMedicines.length} obat dengan stok menipis!
              </p>
              <p className="text-sm text-red-700">
                Segera lakukan restock untuk obat-obat tersebut.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Cari obat (nama atau dosis)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Medicines List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">
            Daftar Obat ({filteredMedicines.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama Obat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Dosis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stok
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Harga
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
              {filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-lg">Tidak ada obat</p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((medicine) => {
                  const isLowStock = medicine.stock <= medicine.min_stock;
                  return (
                    <tr key={medicine.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-800">{medicine.name}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {medicine.dosage || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            isLowStock ? 'text-red-600' : 'text-gray-800'
                          }`}
                        >
                          {medicine.stock} unit
                        </span>
                        {isLowStock && (
                          <span className="ml-2 text-xs text-red-600">⚠️</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        Rp {parseFloat(medicine.price || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isLowStock
                              ? 'bg-red-100 text-red-800'
                              : medicine.stock > medicine.min_stock * 2
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {isLowStock
                            ? 'Stok Menipis'
                            : medicine.stock > medicine.min_stock * 2
                            ? 'Stok Cukup'
                            : 'Perlu Diperhatikan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => navigate(`/pharmacist/medicines/${medicine.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          👁️ Detail
                        </button>
                        <button
                          onClick={() => handleEdit(medicine)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(medicine.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️ Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingId ? 'Edit Obat' : 'Tambah Obat Baru'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Obat *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosis *
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={form.dosage}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: 500mg, 10ml"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Minimum *
                  </label>
                  <input
                    type="number"
                    name="min_stock"
                    value={form.min_stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harga per Unit *
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : editingId ? '💾 Update' : '💾 Simpan'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

