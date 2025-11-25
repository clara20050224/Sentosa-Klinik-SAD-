import db from '../models/Index.js';
import bcrypt from 'bcrypt';

const { User, Medicine, Queue, MedicalRecord, Transaction, Staff, Patient } = db;

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalMedicines = await Medicine.count();
    const totalQueues = await Queue.count();
    const totalTransactions = await Transaction.count();
    const totalRevenue = await Transaction.sum('total', { where: { status: 'lunas' } });

    res.json({
      totalUsers,
      totalMedicines,
      totalQueues,
      totalTransactions,
      totalRevenue: totalRevenue || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['name', 'ASC']]
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, phone, address, role } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email sudah terdaftar.' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      address,
      role
    });

    // Jika role adalah staff/dokter, buat Staff profile
    if (['dokter', 'apoteker', 'kasir', 'resepsionis'].includes(role)) {
      await Staff.create({ user_id: user.id });
    }

    // Jika role adalah pasien, buat Patient profile
    if (role === 'pasien') {
      await Patient.create({ user_id: user.id });
    }

    res.status(201).json({
      message: 'User berhasil dibuat.',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, role, is_active } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

    await user.update({ name, email, phone, address, role });

    // Update Staff is_active if applicable
    if (is_active !== undefined) {
      await Staff.update({ is_active }, { where: { user_id: id } });
    }

    res.json({ message: 'User berhasil diperbarui.', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

    await user.destroy();

    res.json({ message: 'User berhasil dihapus.' });
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

// Get all patients - only patients who registered for examination (have queue)
// This ensures we only show patients who input their own data through the examination form
export const getAllPatients = async (req, res) => {
  try {
    // Get patients who have registered for examination (have at least one queue)
    // Queue is created when patient registers through "Ingin Melakukan Pemeriksaan" form
    const patients = await Patient.findAll({
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: { exclude: ['password'] } 
        },
        {
          model: Queue,
          as: 'queues',
          required: true, // INNER JOIN - only patients with queues (who registered for examination)
          attributes: ['id', 'queue_number', 'status', 'createdAt'],
          separate: false // Get all queues in one query
        }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true // Avoid duplicate rows from JOIN
    });

    // Format response - remove queues array and keep only patient data
    const formattedPatients = patients.map(patient => {
      // Get the most recent queue for reference
      const latestQueue = patient.queues && patient.queues.length > 0
        ? patient.queues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
        : null;

      // Return patient data without queues array to match frontend expectation
      const patientData = {
        user_id: patient.user_id,
        id: patient.user_id,
        medical_history: patient.medical_history,
        blood_type: patient.blood_type,
        emergency_contact: patient.emergency_contact,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        user: patient.user
      };

      // Optionally include latest queue info if needed
      if (latestQueue) {
        patientData.latest_queue = {
          id: latestQueue.id,
          queue_number: latestQueue.queue_number,
          status: latestQueue.status,
          created_at: latestQueue.createdAt
        };
      }

      return patientData;
    });

    res.json({ patients: formattedPatients });
  } catch (err) {
    console.error('Error getting patients:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get single patient by id
export const getPatientById = async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await Patient.findOne({
      where: { user_id: id },
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: { exclude: ['password'] } 
      }]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Pasien tidak ditemukan.' });
    }

    res.json({ patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address, blood_type, emergency_contact, medical_history } = req.body;

  try {
    const patient = await Patient.findOne({
      where: { user_id: id },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Pasien tidak ditemukan.' });
    }

    // Update user data
    if (patient.user) {
      await patient.user.update({ 
        name: name || patient.user.name,
        email: email || patient.user.email,
        phone: phone || patient.user.phone,
        address: address || patient.user.address
      });
    }

    // Update patient data
    await patient.update({ 
      blood_type: blood_type || patient.blood_type,
      emergency_contact: emergency_contact || patient.emergency_contact,
      medical_history: medical_history !== undefined ? medical_history : patient.medical_history
    });

    // Fetch updated patient with user data
    const updatedPatient = await Patient.findOne({
      where: { user_id: id },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
    });

    res.json({ message: 'Data pasien berhasil diperbarui.', patient: updatedPatient });
  } catch (err) {
    console.error('Error updating patient:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete patient
export const deletePatient = async (req, res) => {
  const { id } = req.params;

  try {
    const patient = await Patient.findOne({
      where: { user_id: id },
      include: [{ model: User, as: 'user' }]
    });

    if (!patient) {
      return res.status(404).json({ error: 'Pasien tidak ditemukan.' });
    }

    // Delete user will cascade delete patient
    if (patient.user) {
      await patient.user.destroy();
    }

    res.json({ message: 'Pasien berhasil dihapus.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
