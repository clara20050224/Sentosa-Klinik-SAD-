import db from '../models/Index.js';
import { Op } from 'sequelize';

const { Patient, User, Queue, MedicalRecord, Staff, Prescription, PrescriptionItem, Medicine } = db;

export const getPatientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
    });

    if (!patient) return res.status(404).json({ error: 'Data pasien tidak ditemukan.' });

    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePatientProfile = async (req, res) => {
  const { medical_history, blood_type, emergency_contact, name, phone, address } = req.body;

  try {
    // Update Patient data
    await Patient.update(
      { medical_history, blood_type, emergency_contact },
      { where: { user_id: req.user.id } }
    );

    // Update User data
    await User.update(
      { name, phone, address },
      { where: { id: req.user.id } }
    );

    const patient = await Patient.findOne({
      where: { user_id: req.user.id },
      include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
    });

    res.json({ message: 'Profil berhasil diperbarui.', patient });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPatientVisits = async (req, res) => {
  try {
    // Find patient record first
    const patient = await Patient.findOne({
      where: { user_id: req.user.id }
    });

    if (!patient) {
      return res.json({ visits: [] });
    }

    const visits = await MedicalRecord.findAll({
      where: { patient_id: patient.user_id },
      include: [
        { 
          model: Queue, 
          as: 'queue',
          attributes: ['id', 'queue_number', 'status']
        },
        {
          model: Staff,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }]
        },
        {
          model: Prescription,
          as: 'prescription',
          include: [{
            model: PrescriptionItem,
            as: 'items',
            include: [{
              model: Medicine,
              as: 'medicine',
              attributes: ['id', 'name', 'dosage']
            }]
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format response for frontend
    const formattedVisits = visits.map(visit => ({
      id: visit.id,
      createdAt: visit.createdAt,
      created_at: visit.createdAt, // Keep both for compatibility
      complaint: visit.complaint,
      diagnosis: visit.diagnosis,
      notes: visit.notes,
      status: visit.status,
      doctor: visit.doctor ? {
        id: visit.doctor.user_id,
        name: visit.doctor.user?.name || '-'
      } : null,
      doctor_name: visit.doctor?.user?.name || '-', // For backward compatibility
      queue: visit.queue ? {
        id: visit.queue.id,
        queue_number: visit.queue.queue_number,
        status: visit.queue.status
      } : null,
      prescription: visit.prescription ? {
        id: visit.prescription.id,
        status: visit.prescription.status,
        items: visit.prescription.items?.map(item => ({
          id: item.id,
          medicine_name: item.medicine?.name || '-',
          medicine_dosage: item.medicine?.dosage || '-',
          quantity: item.quantity,
          dosage_instruction: item.dosage_instruction
        })) || []
      } : null
    }));

    res.json({ visits: formattedVisits });
  } catch (err) {
    console.error('Error fetching patient visits:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getPatientQueueStatus = async (req, res) => {
  try {
    const queue = await Queue.findOne({
      where: {
        patient_id: req.user.id,
        status: { [Op.ne]: 'selesai' }
      },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Patient,
          as: 'patient',
          include: [{ model: User, as: 'user', attributes: { exclude: ['password'] } }]
        }
      ]
    });

    if (!queue) {
      return res.json({ queue: null });
    }

    // Calculate queue position (how many patients are ahead)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get all active queues today (menunggu or dipanggil) ordered by creation time
    const activeQueues = await Queue.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        status: {
          [Op.in]: ['menunggu', 'dipanggil']
        }
      },
      order: [['createdAt', 'ASC']]
    });

    // Find position of current patient's queue
    const queuePosition = activeQueues.findIndex(q => q.id === queue.id) + 1;
    const totalInQueue = activeQueues.length;

    // Count how many are ahead (status menunggu and created before this queue)
    const aheadCount = activeQueues.filter(q => 
      q.id !== queue.id && 
      q.createdAt < queue.createdAt && 
      q.status === 'menunggu'
    ).length;

    res.json({ 
      queue: {
        id: queue.id,
        queue_number: queue.queue_number,
        status: queue.status,
        created_at: queue.createdAt,
        patient_name: queue.patient?.user?.name || 'Pasien',
        position: queuePosition,
        total_in_queue: totalInQueue,
        ahead_count: aheadCount
      }
    });
  } catch (err) {
    console.error('Error getting patient queue status:', err);
    res.status(500).json({ error: err.message });
  }
};

// Register examination - pasien mendaftar untuk pemeriksaan
export const registerExamination = async (req, res) => {
  const { complaint, medical_history, blood_type, emergency_contact } = req.body;
  const patientId = req.user.id;

  try {
    if (!complaint) {
      return res.status(400).json({ error: 'Keluhan harus diisi.' });
    }

    // Check if patient already has an active queue
    const existingQueue = await Queue.findOne({
      where: {
        patient_id: patientId,
        status: { [Op.in]: ['menunggu', 'dipanggil'] }
      }
    });

    if (existingQueue) {
      return res.status(400).json({ 
        error: 'Anda sudah memiliki antrian aktif. Silakan selesaikan antrian sebelumnya terlebih dahulu.' 
      });
    }

    // Find or create patient record
    let patient = await Patient.findOne({
      where: { user_id: patientId }
    });

    if (!patient) {
      // Create patient record if doesn't exist
      patient = await Patient.create({
        user_id: patientId,
        medical_history: medical_history || null,
        blood_type: blood_type || null,
        emergency_contact: emergency_contact || null
      });
    } else {
      // Update patient data if provided
      await patient.update({
        medical_history: medical_history !== undefined ? medical_history : patient.medical_history,
        blood_type: blood_type || patient.blood_type,
        emergency_contact: emergency_contact || patient.emergency_contact
      });
    }

    // Generate sequential queue number
    const { generateQueueNumber } = await import('../utils/queueGenerator.js');
    const queueNumber = await generateQueueNumber();

    // Create queue with sequential number
    const queue = await Queue.create({
      queue_number: queueNumber.toString(),
      patient_id: patientId,
      receptionist_id: null, // Will be set by admin/receptionist later
      status: 'menunggu'
    });

    // Create medical record with complaint
    const medicalRecord = await MedicalRecord.create({
      patient_id: patientId,
      doctor_id: null, // Will be set when doctor examines
      queue_id: queue.id,
      complaint: complaint,
      diagnosis: null,
      notes: null,
      status: 'menunggu'
    });

    res.status(201).json({
      message: 'Pendaftaran pemeriksaan berhasil!',
      queue_number: queueNumber,
      queue: {
        id: queue.id,
        queue_number: queueNumber,
        status: queue.status,
        created_at: queue.createdAt
      },
      medical_record: {
        id: medicalRecord.id,
        complaint: medicalRecord.complaint
      }
    });
  } catch (err) {
    console.error('Error registering examination:', err);
    res.status(500).json({ error: err.message });
  }
};
