import db from '../models/Index.js';
import { Op } from 'sequelize';

const { Transaction, MedicalRecord, Patient, User } = db;

export const getPendingPayments = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { status: 'belum' },
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: MedicalRecord,
          as: 'medicalRecord'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const processTransaction = async (req, res) => {
  const { patient_id, medical_record_id, total, payment_method } = req.body;
  const cashier_id = req.user.id;

  try {
    const transaction = await Transaction.create({
      patient_id,
      medical_record_id,
      cashier_id,
      total,
      payment_method,
      status: 'lunas'
    });

    res.status(201).json({
      message: 'Transaksi berhasil diproses.',
      transaction
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { status: 'lunas' },
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactionStats = async (req, res) => {
  try {
    const total = await Transaction.sum('total', { where: { status: 'lunas' } });
    const count = await Transaction.count({ where: { status: 'lunas' } });

    res.json({
      total_transactions: count,
      total_revenue: total || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get completed patients (patients with completed examinations that don't have transaction yet)
export const getCompletedPatients = async (req, res) => {
  try {
    // Get all medical records with status 'selesai'
    const completedRecords = await MedicalRecord.findAll({
      where: { status: 'selesai' },
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Get all existing transactions
    const existingTransactions = await Transaction.findAll({
      attributes: ['medical_record_id']
    });
    const existingRecordIds = existingTransactions.map(t => t.medical_record_id);

    // Filter out records that already have transactions
    const patientsWithoutTransaction = completedRecords
      .filter(record => !existingRecordIds.includes(record.id))
      .map(record => ({
        id: record.id,
        medical_record_id: record.id,
        patient_id: record.patient_id,
        patient: record.patient,
        patient_name: record.patient?.user?.name,
        patient_email: record.patient?.user?.email,
        medical_record: {
          id: record.id,
          diagnosis: record.diagnosis,
          complaint: record.complaint,
          createdAt: record.createdAt
        },
        diagnosis: record.diagnosis,
        createdAt: record.createdAt
      }));

    res.json({ patients: patientsWithoutTransaction });
  } catch (err) {
    console.error('Error getting completed patients:', err);
    res.status(500).json({ error: err.message });
  }
};