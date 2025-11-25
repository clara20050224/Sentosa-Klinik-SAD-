import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import { useNavigate } from 'react-router-dom';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      // Try different endpoints
      let res;
      try {
        res = await api.get('/admin/patients');
      } catch (e) {
        try {
          res = await api.get('/receptionist/patients');
        } catch (e2) {
          // If both fail, try to get from patient list
          res = { data: { patients: [] } };
        }
      }
      setPatients(res.data?.patients || res.data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (patient) => {
    const patientId = patient.user_id || patient.id || patient.user?.id;
    if (patientId) {
      navigate(`/doctor/patient/${patientId}`);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const name = patient.user?.name || patient.name || '';
    const email = patient.user?.email || patient.email || '';
    const phone = patient.user?.phone || patient.phone || '';
    const search = searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search) ||
      phone.toLowerCase().includes(search)
    );
  });

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
          <h1 className="text-3xl font-bold text-gray-800">Detail Data Pasien</h1>
          <p className="text-gray-600 mt-1">Daftar semua pasien yang terdaftar</p>
        </div>
        <button
          onClick={fetchPatients}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Cari pasien (nama, email, atau no. HP)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Patients List */}
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'Pasien tidak ditemukan' : 'Belum ada pasien terdaftar'}
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const patientId = patient.user_id || patient.id || patient.user?.id;
            return (
              <div
                key={patientId || patient.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      {patient.user?.name || patient.name || 'Pasien'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Email:</span>{' '}
                        {patient.user?.email || patient.email || '-'}
                      </div>
                      <div>
                        <span className="font-medium">No. HP:</span>{' '}
                        {patient.user?.phone || patient.phone || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Alamat:</span>{' '}
                        {patient.user?.address || patient.address || '-'}
                      </div>
                      <div>
                        <span className="font-medium">Golongan Darah:</span>{' '}
                        {patient.blood_type || '-'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetail(patient)}
                    className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    👁️ Lihat Detail
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

