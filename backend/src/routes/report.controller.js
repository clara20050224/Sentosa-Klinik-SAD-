import db from '../models/Index.js';
import { Op } from 'sequelize';

const { Patient, MedicalRecord, Medicine, Transaction, User, Queue } = db;

export const getDashboardStats = async (req, res) => {
  try {
    const totalPatients = await Patient.count();
    const todayVisits = await MedicalRecord.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });
    const totalTransactions = await Transaction.count();
    const lowStockMedicines = await Medicine.findAll({
      where: {
        stock: {
          [Op.lte]: db.sequelize.where(
            db.sequelize.col('min_stock'),
            Op.gte,
            db.sequelize.col('stock')
          )
        }
      }
    });

    res.status(200).json({
      totalPatients,
      todayVisits,
      totalTransactions,
      lowStockMedicines: lowStockMedicines.length,
      medicines: lowStockMedicines
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMedicineUsageReport = async (req, res) => {
  try {
    const report = await Medicine.findAll({
      attributes: ['id', 'name', 'stock', 'price']
    });

    res.json({ report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getVisitsReport = async (req, res) => {
  try {
    const visits = await MedicalRecord.findAll({
      include: [
        { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ visits });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransactionsReport = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        { model: Patient, as: 'patient', include: [{ model: User, as: 'user' }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
