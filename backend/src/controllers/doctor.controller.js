import db from '../models/Index.js';

const { Queue, Patient, MedicalRecord, User, Prescription, PrescriptionItem, Medicine, Staff } = db;

export const getDoctorQueue = async (req, res) => {
  try {
    const { Op } = await import('sequelize');
    
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all queues today with status menunggu or dipanggil, ordered by queue number (sequential)
    const queues = await Queue.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        status: {
          [Op.in]: ['menunggu', 'dipanggil']
        }
      },
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ 
            model: User, 
            as: 'user',
            attributes: { exclude: ['password'] }
          }]
        }
      ],
      order: [
        ['queue_number', 'ASC'], // Order by queue number (sequential: 1, 2, 3, etc.)
        ['createdAt', 'ASC'] // Secondary sort by creation time
      ]
    });

    // Format response with queue position
    const formattedQueues = queues.map((queue, index) => ({
      id: queue.id,
      queue_number: queue.queue_number,
      status: queue.status,
      createdAt: queue.createdAt,
      created_at: queue.createdAt,
      position: index + 1, // Position in queue (1, 2, 3, etc.)
      patient: {
        user_id: queue.patient?.user_id,
        user: queue.patient?.user ? {
          id: queue.patient.user.id,
          name: queue.patient.user.name,
          email: queue.patient.user.email,
          phone: queue.patient.user.phone,
          address: queue.patient.user.address
        } : null
      },
      patient_id: queue.patient_id,
      patient_name: queue.patient?.user?.name || 'Pasien'
    }));

    res.json({ queues: formattedQueues });
  } catch (err) {
    console.error('Error getting doctor queue:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getPatientRecords = async (req, res) => {
  const { id } = req.params;

  try {
    const records = await MedicalRecord.findAll({
      where: { patient_id: id },
      order: [['createdAt', 'DESC']]
    });

    res.json({ records });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMedicalRecord = async (req, res) => {
  const { patient_id, queue_id, complaint, diagnosis, notes } = req.body;
  const doctor_id = req.user.id;

  try {
    // Get staff record - doctor_id in MedicalRecord refers to Staff.user_id
    const staff = await Staff.findOne({ where: { user_id: doctor_id } });
    if (!staff) {
      return res.status(404).json({ error: 'Staff tidak ditemukan.' });
    }

    const record = await MedicalRecord.create({
      patient_id,
      doctor_id: staff.user_id,
      queue_id,
      complaint,
      diagnosis,
      notes,
      status: 'selesai'
    });

    // Update queue status to selesai
    if (queue_id) {
      await Queue.update({ status: 'selesai' }, { where: { id: queue_id } });
    }

    res.status(201).json({
      message: 'Rekam medis berhasil dibuat.',
      record
    });
  } catch (err) {
    console.error('Error creating medical record:', err);
    res.status(500).json({ error: err.message });
  }
};

export const completeExamination = async (req, res) => {
  const { id } = req.params;

  try {
    const record = await MedicalRecord.findByPk(id);
    if (!record) return res.status(404).json({ error: 'Rekam medis tidak ditemukan.' });

    await record.update({ status: 'selesai' });
    
    // Update queue status to selesai
    await Queue.update({ status: 'selesai' }, { where: { id: record.queue_id } });

    res.json({ message: 'Pemeriksaan berhasil diselesaikan.', record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all medical records created by this doctor
export const getMyRecords = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Get staff record - doctor_id in MedicalRecord refers to Staff.user_id
    const staff = await Staff.findOne({ where: { user_id } });
    if (!staff) {
      return res.status(404).json({ error: 'Staff tidak ditemukan.' });
    }

    const records = await MedicalRecord.findAll({
      where: { doctor_id: staff.user_id },
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Queue,
          as: 'queue'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ records });
  } catch (err) {
    console.error('Error in getMyRecords:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get single medical record by id
export const getRecordById = async (req, res) => {
  const { id } = req.params;

  try {
    const record = await MedicalRecord.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user' }]
        },
        {
          model: Queue,
          as: 'queue'
        }
      ]
    });

    if (!record) {
      return res.status(404).json({ error: 'Rekam medis tidak ditemukan.' });
    }

    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all prescriptions created by this doctor
export const getMyPrescriptions = async (req, res) => {
  try {
    const user_id = req.user.id;
    
    // Get staff record - doctor_id in MedicalRecord refers to Staff.user_id
    const staff = await Staff.findOne({ where: { user_id } });
    if (!staff) {
      return res.status(404).json({ error: 'Staff tidak ditemukan.' });
    }

    // Get prescriptions from medical records created by this doctor
    const records = await MedicalRecord.findAll({
      where: { doctor_id: staff.user_id },
      attributes: ['id']
    });

    const recordIds = records.map(r => r.id);

    if (recordIds.length === 0) {
      return res.json({ prescriptions: [] });
    }

    const prescriptions = await Prescription.findAll({
      where: { medical_record_id: recordIds },
      include: [
        {
          model: MedicalRecord,
          as: 'medicalRecord',
          include: [
            {
              model: Patient,
              as: 'patient',
              include: [{ model: User, as: 'user' }]
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
    console.error('Error in getMyPrescriptions:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update medical record status
export const updateRecordStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ error: 'Status harus diisi.' });
    }

    const record = await MedicalRecord.findByPk(id);
    if (!record) {
      return res.status(404).json({ error: 'Rekam medis tidak ditemukan.' });
    }

    await record.update({ status });

    // If status is 'selesai', also update queue status
    if (status === 'selesai' && record.queue_id) {
      await Queue.update({ status: 'selesai' }, { where: { id: record.queue_id } });
    }

    res.json({
      message: 'Status pemeriksaan berhasil diperbarui.',
      record
    });
  } catch (err) {
    console.error('Error updating record status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Create prescription
export const createPrescription = async (req, res) => {
  const { medical_record_id, prescription_items } = req.body;

  try {
    if (!medical_record_id || !prescription_items || prescription_items.length === 0) {
      return res.status(400).json({ error: 'Medical record ID dan prescription items harus diisi.' });
    }

    // Verify medical record exists
    const medicalRecord = await MedicalRecord.findByPk(medical_record_id);
    if (!medicalRecord) {
      return res.status(404).json({ error: 'Rekam medis tidak ditemukan.' });
    }

    // Create prescription
    const prescription = await Prescription.create({
      medical_record_id,
      status: 'menunggu'
    });

    // Create prescription items
    for (const item of prescription_items) {
      await PrescriptionItem.create({
        prescription_id: prescription.id,
        medicine_id: item.medicine_id,
        quantity: item.quantity,
        dosage_instruction: item.dosage_instruction
      });
    }

    // Fetch created prescription with relations
    const createdPrescription = await Prescription.findByPk(prescription.id, {
      include: [
        {
          model: MedicalRecord,
          as: 'medicalRecord',
          include: [
            {
              model: Patient,
              as: 'patient',
              include: [{ model: User, as: 'user' }]
            }
          ]
        },
        {
          model: PrescriptionItem,
          as: 'items',
          include: [{ model: Medicine, as: 'medicine' }]
        }
      ]
    });

    res.status(201).json({
      message: 'Resep berhasil dibuat.',
      prescription: createdPrescription
    });
  } catch (err) {
    console.error('Error creating prescription:', err);
    res.status(500).json({ error: err.message });
  }
};
