// frontend/src/pages/cashier/ReceiptPreview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

export default function ReceiptPreview() {
  const { id } = useParams(); // transaction id
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const res = await axios.get(`/api/cashier/transactions/${id}`);
        setTransaction(res.data);
      } catch (err) {
        alert('Gagal memuat bukti pembayaran.');
        navigate('/cashier');
      } finally {
        setLoading(false);
      }
    };
    fetchTransaction();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-6">Memuat...</div>;
  if (!transaction) return <div className="p-6">Data tidak ditemukan.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Tombol Aksi */}
      <div className="flex justify-end space-x-2 mb-6 print:hidden">
        <button
          onClick={() => navigate('/cashier')}
          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Kembali
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
        >
          Cetak / Simpan PDF
        </button>
      </div>

      {/* Receipt Content */}
      <div className="bg-white p-6 border border-gray-200 rounded shadow max-w-md mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-primary">KLINIK SENTOSA</h1>
          <p className="text-sm text-gray-600">Jl. Sehat No. 123, Jakarta</p>
          <p className="text-sm">📞 (021) 1234-5678</p>
          <div className="border-t border-b my-2 py-1">
            <p className="text-xs">BUKTI PEMBAYARAN</p>
          </div>
        </div>

        <div className="text-sm space-y-1 mb-4">
          <p><span className="font-semibold">No. Transaksi:</span> #{transaction.id}</p>
          <p><span className="font-semibold">Tanggal:</span> {new Date(transaction.created_at).toLocaleString('id-ID')}</p>
          <p><span className="font-semibold">Pasien:</span> {transaction.patient_name}</p>
          <p><span className="font-semibold">Dokter:</span> {transaction.doctor_name}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-1">Deskripsi</th>
              <th className="text-right pb-1">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1">Biaya Konsultasi</td>
              <td className="text-right">Rp 100.000</td>
            </tr>
            {transaction.medicine_items?.map((item, idx) => (
              <tr key={idx}>
                <td className="py-1">{item.name} ({item.dosage}) × {item.quantity}</td>
                <td className="text-right">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</td>
              </tr>
            ))}
            <tr className="border-t pt-2 font-bold">
              <td>Total</td>
              <td className="text-right">Rp {transaction.total.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <div className="text-sm mb-4">
          <p><span className="font-semibold">Metode Bayar:</span> {transaction.payment_method}</p>
          <p><span className="font-semibold">Status:</span> <span className="text-green-600">Lunas</span></p>
        </div>

        <div className="text-center text-xs text-gray-500 mt-6">
          <p>Terima kasih telah mempercayakan kesehatan Anda kepada kami.</p>
          <p>Simpan bukti ini untuk keperluan administrasi.</p>
        </div>
      </div>
    </div>
  );
}