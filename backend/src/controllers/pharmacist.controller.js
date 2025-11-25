import db from '../models/Index.js';
import { Op } from 'sequelize';

const { Prescription, PrescriptionItem, Medicine, MedicalRecord, Patient, User, Staff } = db;

export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.findAll({
      include: [
        {
          model: MedicalRecord,
          as: 'medicalRecord',
          include: [
            {
              model: Patient,
              as: 'patient',
              attributes: ['id', 'user_id', 'medical_history', 'blood_type', 'emergency_contact', 'createdAt', 'updatedAt'],
              include: [{ 
                model: User, 
                as: 'user',
                attributes: { exclude: ['password'] } // Include all user fields except password
              }]
            },
            {
              model: Staff,
              as: 'doctor',
              include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }]
            }
          ]
        },
        {
          model: PrescriptionItem,
          as: 'items',
          include: [{ model: Medicine, as: 'medicine' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ prescriptions });
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: err.message });
  }
};

export const approvePrescription = async (req, res) => {
  const { id } = req.params;

  try {
    const prescription = await Prescription.findByPk(id);
    if (!prescription) return res.status(404).json({ error: 'Resep tidak ditemukan.' });

    await prescription.update({
      status: 'disetujui',
      pharmacist_id: req.user.id
    });

    res.json({ message: 'Resep berhasil disetujui.', prescription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rejectPrescription = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const prescription = await Prescription.findByPk(id);
    if (!prescription) return res.status(404).json({ error: 'Resep tidak ditemukan.' });

    await prescription.update({
      status: 'ditolak',
      notes: reason,
      pharmacist_id: req.user.id
    });

    res.json({ message: 'Resep berhasil ditolak.', prescription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const dispenseMedicine = async (req, res) => {
  const { id } = req.params;

  try {
    const prescription = await Prescription.findByPk(id, {
      include: [
        {
          model: PrescriptionItem,
          as: 'items',
          include: [{ model: Medicine, as: 'medicine' }]
        }
      ]
    });

    if (!prescription) return res.status(404).json({ error: 'Resep tidak ditemukan.' });

    // Update stock obat
    for (const item of prescription.items) {
      const medicine = item.medicine;
      if (medicine.stock < item.quantity) {
        return res.status(400).json({ error: `Stok obat ${medicine.name} tidak cukup.` });
      }

      await medicine.update({
        stock: medicine.stock - item.quantity
      });
    }

    await prescription.update({ status: 'diberikan' });

    res.json({ message: 'Obat berhasil diberikan.', prescription });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.findAll({
      order: [['name', 'ASC']]
    });

    res.json({ medicines });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMedicine = async (req, res) => {
  const { name, dosage, stock, price, min_stock } = req.body;

  try {
    const medicine = await Medicine.create({
      name,
      dosage,
      stock,
      price,
      min_stock
    });

    res.status(201).json({ message: 'Obat berhasil ditambahkan.', medicine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateMedicine = async (req, res) => {
  const { id } = req.params;
  const { name, dosage, stock, price, min_stock } = req.body;

  try {
    const medicine = await Medicine.findByPk(id);
    if (!medicine) return res.status(404).json({ error: 'Obat tidak ditemukan.' });

    await medicine.update({ name, dosage, stock, price, min_stock });

    res.json({ message: 'Obat berhasil diperbarui.', medicine });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteMedicine = async (req, res) => {
  const { id } = req.params;

  try {
    const medicine = await Medicine.findByPk(id);
    if (!medicine) return res.status(404).json({ error: 'Obat tidak ditemukan.' });

    await medicine.destroy();

    res.json({ message: 'Obat berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
