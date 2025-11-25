import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pharmacistService } from '../../services/patientService.js';
import api from '../../services/api.js';

export default function MedicineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dispenseHistory, setDispenseHistory] = useState([]);

  useEffect(() => {
    fetchMedicineData();
  }, [id]);

  const fetchMedicineData = async () => {
    try {
      setLoading(true);
      // Fetch medicine detail
      const medRes = await pharmacistService.getMedicines();
      const medicines = medRes.data?.medicines || medRes.data || [];
      const foundMedicine = medicines.find((m) => m.id == id);
      setMedicine(foundMedicine);

      // Fetch dispense history from prescriptions
      const prescRes = await pharmacistService.getPrescriptions();
      const prescriptions = prescRes.data?.prescriptions || [];
      
      // Filter prescriptions that have this medicine and are already dispensed
      const history = [];
      prescriptions.forEach((presc) => {
        if (presc.status === 'diberikan' && presc.items) {
          presc.items.forEach((item) => {
            if (item.medicine_id == id) {
              history.push({
                id: presc.id,
                date: presc.updatedAt || presc.createdAt,
                patient: presc.medical_record?.patient?.user?.name || '-',
                quantity: item.quantity,
                prescription_id: presc.id
              });
            }
          });
        }
      });
      setDispenseHistory(history);
    } catch (err) {
      console.error('Error fetching medicine data:', err);
      alert('Gagal memuat data obat');
      navigate('/pharmacist/medicines');
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = medicine && medicine.stock <= medicine.min_stock;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Obat tidak ditemukan</p>
        <button
          onClick={() => navigate('/pharmacist/medicines')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Kembali ke Daftar Obat
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Detail Obat</h1>
          <p className="text-gray-600 mt-1">Informasi lengkap obat dan riwayat pengeluaran</p>
        </div>
        <button
          onClick={() => navigate('/pharmacist/medicines')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          ← Kembali
        </button>
      </div>

      {/* Low Stock Alert */}
      {isLowStock && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-800">Stok Menipis!</p>
              <p className="text-sm text-red-700">
                Stok saat ini: {medicine.stock} | Stok minimum: {medicine.min_stock}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Medicine Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{medicine.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nama Obat</p>
              <p className="font-semibold text-gray-800">{medicine.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Dosis</p>
              <p className="font-semibold text-gray-800">{medicine.dosage || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Harga per Unit</p>
              <p className="font-semibold text-gray-800">
                Rp {parseFloat(medicine.price || 0).toLocaleString('id-ID')}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Stok Tersedia</p>
              <p className={`text-2xl font-bold ${
                isLowStock ? 'text-red-600' : 'text-green-600'
              }`}>
                {medicine.stock} unit
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stok Minimum</p>
              <p className="font-semibold text-gray-800">{medicine.min_stock} unit</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                isLowStock
                  ? 'bg-red-100 text-red-800'
                  : medicine.stock > medicine.min_stock * 2
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isLowStock
                  ? 'Stok Menipis'
                  : medicine.stock > medicine.min_stock * 2
                  ? 'Stok Cukup'
                  : 'Stok Perlu Diperhatikan'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dispense History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Riwayat Pengeluaran Obat</h2>
          <p className="text-sm text-gray-600 mt-1">
            {dispenseHistory.length} kali pengeluaran
          </p>
        </div>
        <div className="p-6">
          {dispenseHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-lg">Belum ada riwayat pengeluaran</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dispenseHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.patient}
                      </p>
                      <p className="text-sm text-gray-600">
                        {item.date
                          ? new Date(item.date).toLocaleString('id-ID')
                          : '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        {item.quantity} unit
                      </p>
                      <p className="text-xs text-gray-500">
                        Resep #{item.prescription_id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

