// frontend/src/pages/receptionist/ManagePatients.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/receptionist/patients');
      setPatients(res.data);
    } catch (err) {
      alert('Gagal memuat data pasien.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    // Bisa diarahkan ke form edit
    alert(`Edit pasien ID: ${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus pasien ini?')) return;
    try {
      await axios.delete(`/api/receptionist/patients/${id}`);
      setPatients(patients.filter(p => p.id !== id));
    } catch (err) {
      alert('Gagal menghapus pasien.');
    }
  };

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Pasien</h1>
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Cari nama/no HP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 border rounded"
          />
          <button className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-700">
            + Tambah Manual
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. HP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gol. Darah</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
            ) : filteredPatients.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">Tidak ada pasien ditemukan.</td></tr>
            ) : (
              filteredPatients.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{p.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.blood_type || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEdit(p.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}