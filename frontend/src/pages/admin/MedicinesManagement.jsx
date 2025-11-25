// frontend/src/pages/admin/MedicinesManagement.jsx
import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/patientService.js';

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

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await adminService.getMedicines();
      setMedicines(Array.isArray(res.data) ? res.data : res.data?.medicines || []);
    } catch (err) {
      console.error('Error fetching medicines:', err);
      alert(err.response?.data?.error || 'Gagal memuat data obat.');
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
      const formData = {
        ...form,
        stock: parseInt(form.stock),
        price: parseFloat(form.price),
        min_stock: parseInt(form.min_stock)
      };

      if (editingId) {
        await adminService.updateMedicine(editingId, formData);
        alert('Obat berhasil diperbarui!');
      } else {
        await adminService.createMedicine(formData);
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
      name: medicine.name,
      dosage: medicine.dosage,
      stock: medicine.stock.toString(),
      price: medicine.price.toString(),
      min_stock: medicine.min_stock.toString()
    });
    setEditingId(medicine.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus obat ini?')) return;
    try {
      await adminService.deleteMedicine(id);
      alert('Obat berhasil dihapus!');
      fetchMedicines();
    } catch (err) {
      console.error('Error deleting medicine:', err);
      alert(err.response?.data?.error || 'Gagal menghapus obat.');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      dosage: '',
      stock: '',
      price: '',
      min_stock: ''
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manajemen Obat</h1>
          <p className="text-gray-600 mt-1">Kelola data obat, stok, dan harga</p>
        </div>
        <button
          onClick={resetForm}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Tambah Obat</span>
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editingId ? '✏️ Edit Obat' : '➕ Tambah Obat Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Nama Obat</label>
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
            <label className="block text-sm text-gray-700 mb-1">Dosis</label>
            <input
              type="text"
              name="dosage"
              value={form.dosage}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="500mg, 10ml, dll"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Stok Awal</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Harga (Rp)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Stok Minimum</label>
            <input
              type="number"
              name="min_stock"
              value={form.min_stock}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded"
              required
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

      {/* Tabel Obat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800">Daftar Obat</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosis</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map((med) => (
              <tr key={med.id}>
                <td className="px-6 py-4 whitespace-nowrap">{med.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{med.dosage}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${
                  med.stock <= med.min_stock ? 'text-red-600 font-bold' : ''
                }`}>
                  <div className="flex items-center space-x-2">
                    <span>{med.stock}</span>
                    {med.stock <= med.min_stock && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                        ⚠️ Stok Menipis
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  Rp {med.price.toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <button
                    onClick={() => handleEdit(med)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(med.id)}
                    className="text-red-600 hover:underline"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {medicines.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Belum ada data obat
          </div>
        )}
      </div>
    </div>
  );
}