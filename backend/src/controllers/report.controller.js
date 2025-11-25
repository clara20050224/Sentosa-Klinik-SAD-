// backend/src/controllers/report.controller.js
import sequelize from '../config/db.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Transaction from '../models/Transaction.js';
import PrescriptionItem from '../models/PrescriptionItem.js';
import Medicine from '../models/Medicine.js';
import User from '../models/User.js';
import Staff from '../models/Staff.js';

// Helper: tanggal hari ini
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

export const getVisitsReport = async (req, res) => {
  try {
    // Kunjungan hari ini
    const todayVisits = await MedicalRecord.count({
      where: { created_at: { [Op.gte]: todayStart } }
    });

    // Total kunjungan
    const totalVisits = await MedicalRecord.count();

    // Rata-rata per hari (30 hari terakhir)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentVisits = await MedicalRecord.count({
      where: { created_at: { [Op.gte]: thirtyDaysAgo } }
    });
    const averagePerDay = Math.round(recentVisits / 30);

    // Dokter teraktif (30 hari)
    const topDoctor = await MedicalRecord.findAll({
      where: { created_at: { [Op.gte]: thirtyDaysAgo } },
      attributes: ['doctor_id', [sequelize.fn('COUNT', sequelize.col('id')), 'visit_count']],
      group: ['doctor_id'],
      order: [[sequelize.literal('visit_count'), 'DESC']],
      limit: 1,
      include: [{
        model: Staff,
        as: 'doctor',
        include: [{ model: User, as: 'user' }]
      }]
    });

    // Semua kunjungan (untuk tabel)
    const visits = await MedicalRecord.findAll({
      attributes: ['id', 'created_at', 'diagnosis', 'status'],
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['name']
        },
        {
          model: Staff,
          as: 'doctor',
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 100
    });

    const formattedVisits = visits.map(v => ({
      id: v.id,
      created_at: v.created_at,
      patient_name: v.patient?.name || '-',
      doctor_name: v.doctor?.user?.name || '-',
      diagnosis: v.diagnosis,
      status: v.status
    }));

    res.json({
      summary: {
        total: totalVisits,
        today: todayVisits,
        average: averagePerDay,
        topDoctor: topDoctor[0]?.doctor?.user
      },
      visits: formattedVisits
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactionsReport = async (req, res) => {
  try {
    const { start, end, method } = req.query;

    let where = {};
    if (start) where.created_at = { ...where.created_at, [Op.gte]: new Date(start) };
    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      where.created_at = { ...where.created_at, [Op.lte]: endDate };
    }
    if (method) where.payment_method = method;

    const transactions = await Transaction.findAll({
      where,
      attributes: ['id', 'total', 'payment_method', 'status', 'receipt_url', 'created_at'],
      include: [
        {
          model: User,
          as: 'patient',
          attributes: ['name']
        },
        {
          model: Staff,
          as: 'cashier',
          include: [{ model: User, as: 'user', attributes: ['name'] }]
        },
        {
          model: MedicalRecord,
          as: 'medicalRecord',
          include: [{
            model: Staff,
            as: 'doctor',
            include: [{ model: User, as: 'user', attributes: ['name'] }]
          }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formatted = transactions.map(t => ({
      id: t.id,
      patient_name: t.patient?.name || '-',
      doctor_name: t.medicalRecord?.doctor?.user?.name || '-',
      total: t.total,
      payment_method: t.payment_method,
      status: t.status,
      receipt_url: t.receipt_url,
      created_at: t.created_at
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMedicineUsageReport = async (req, res) => {
  try {
    // 30 hari terakhir
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Hitung penggunaan obat dari prescription_items
    const usage = await PrescriptionItem.findAll({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo }
      },
      attributes: [
        'medicine_id',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_used']
      ],
      group: ['medicine_id'],
      include: [{
        model: Medicine,
        as: 'medicine',
        attributes: ['name', 'dosage']
      }],
      order: [[sequelize.literal('total_used'), 'DESC']]
    });

    const formatted = usage.map(u => ({
      id: u.medicine.id,
      name: u.medicine.name,
      dosage: u.medicine.dosage,
      total_used: parseInt(u.dataValues.total_used)
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};