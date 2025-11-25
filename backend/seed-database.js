import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import db from './src/models/Index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: `${__dirname}/.env` });

const { User, Patient, Staff, Medicine, Queue, MedicalRecord, Prescription, PrescriptionItem, Transaction } = db;

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Sync database
    await db.sequelize.authenticate();
    console.log('✅ Database connected.\n');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // 1. Create Users
    console.log('📝 Creating users...');
    const users = await User.bulkCreate([
      // Admin
      {
        name: 'Admin Klinik',
        email: 'admin@klinik.com',
        password: hashedPassword,
        phone: '081234567890',
        address: 'Jl. Admin No. 1',
        role: 'admin'
      },
      // Patients
      {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        password: hashedPassword,
        phone: '081111111111',
        address: 'Jl. Pasien No. 1, Jakarta',
        role: 'pasien'
      },
      {
        name: 'Siti Nurhaliza',
        email: 'siti@example.com',
        password: hashedPassword,
        phone: '081222222222',
        address: 'Jl. Pasien No. 2, Bandung',
        role: 'pasien'
      },
      {
        name: 'Ahmad Fauzi',
        email: 'ahmad@example.com',
        password: hashedPassword,
        phone: '081333333333',
        address: 'Jl. Pasien No. 3, Surabaya',
        role: 'pasien'
      },
      // Doctors
      {
        name: 'Dr. Sarah Wijaya',
        email: 'sarah@klinik.com',
        password: hashedPassword,
        phone: '082111111111',
        address: 'Jl. Dokter No. 1',
        role: 'dokter'
      },
      {
        name: 'Dr. Rizki Pratama',
        email: 'rizki@klinik.com',
        password: hashedPassword,
        phone: '082222222222',
        address: 'Jl. Dokter No. 2',
        role: 'dokter'
      },
      // Pharmacist
      {
        name: 'Apoteker Indah',
        email: 'indah@klinik.com',
        password: hashedPassword,
        phone: '083111111111',
        address: 'Jl. Apoteker No. 1',
        role: 'apoteker'
      },
      // Cashier
      {
        name: 'Kasir Budi',
        email: 'kasir@klinik.com',
        password: hashedPassword,
        phone: '084111111111',
        address: 'Jl. Kasir No. 1',
        role: 'kasir'
      }
    ], { returning: true });
    console.log(`✅ Created ${users.length} users.\n`);

    // 2. Create Patients
    console.log('📝 Creating patients...');
    const patientUsers = users.filter(u => u.role === 'pasien');
    const patients = await Patient.bulkCreate([
      {
        user_id: patientUsers[0].id,
        medical_history: 'Riwayat hipertensi, diabetes',
        blood_type: 'A',
        emergency_contact: '081999999999'
      },
      {
        user_id: patientUsers[1].id,
        medical_history: 'Alergi antibiotik',
        blood_type: 'B',
        emergency_contact: '081888888888'
      },
      {
        user_id: patientUsers[2].id,
        medical_history: 'Tidak ada',
        blood_type: 'O',
        emergency_contact: '081777777777'
      }
    ]);
    console.log(`✅ Created ${patients.length} patients.\n`);

    // 3. Create Staff
    console.log('📝 Creating staff...');
    const doctorUsers = users.filter(u => u.role === 'dokter');
    const pharmacistUser = users.find(u => u.role === 'apoteker');
    const cashierUser = users.find(u => u.role === 'kasir');
    
    const staff = await Staff.bulkCreate([
      {
        user_id: doctorUsers[0].id,
        specialization: 'Dokter Umum',
        license_number: 'STR-001',
        is_active: true
      },
      {
        user_id: doctorUsers[1].id,
        specialization: 'Dokter Anak',
        license_number: 'STR-002',
        is_active: true
      },
      {
        user_id: pharmacistUser.id,
        specialization: 'Apoteker',
        license_number: 'APT-001',
        is_active: true
      },
      {
        user_id: cashierUser.id,
        specialization: 'Kasir',
        license_number: 'KAS-001',
        is_active: true
      }
    ]);
    console.log(`✅ Created ${staff.length} staff.\n`);

    // 4. Create Medicines
    console.log('📝 Creating medicines...');
    const medicines = await Medicine.bulkCreate([
      {
        name: 'Paracetamol',
        dosage: '500mg',
        stock: 100,
        price: 5000,
        min_stock: 20
      },
      {
        name: 'Amoxicillin',
        dosage: '250mg',
        stock: 50,
        price: 15000,
        min_stock: 15
      },
      {
        name: 'Ibuprofen',
        dosage: '400mg',
        stock: 8,
        price: 8000,
        min_stock: 10
      },
      {
        name: 'Cetirizine',
        dosage: '10mg',
        stock: 75,
        price: 12000,
        min_stock: 20
      },
      {
        name: 'Omeprazole',
        dosage: '20mg',
        stock: 30,
        price: 20000,
        min_stock: 10
      }
    ]);
    console.log(`✅ Created ${medicines.length} medicines.\n`);

    // 5. Create Queues
    console.log('📝 Creating queues...');
    const queues = await Queue.bulkCreate([
      {
        queue_number: 'A001',
        patient_id: patients[0].user_id,
        receptionist_id: null,
        status: 'dipanggil'
      },
      {
        queue_number: 'A002',
        patient_id: patients[1].user_id,
        receptionist_id: null,
        status: 'menunggu'
      },
      {
        queue_number: 'A003',
        patient_id: patients[2].user_id,
        receptionist_id: null,
        status: 'selesai'
      }
    ]);
    console.log(`✅ Created ${queues.length} queues.\n`);

    // 6. Create Medical Records
    console.log('📝 Creating medical records...');
    const medicalRecords = await MedicalRecord.bulkCreate([
      {
        patient_id: patients[0].user_id,
        doctor_id: doctorUsers[0].id,
        queue_id: queues[0].id,
        complaint: 'Demam tinggi sejak 2 hari, batuk, pilek',
        diagnosis: 'ISPA (Infeksi Saluran Pernapasan Akut)',
        notes: 'Istirahat cukup, minum air putih banyak',
        status: 'selesai'
      },
      {
        patient_id: patients[1].user_id,
        doctor_id: doctorUsers[1].id,
        queue_id: queues[1].id,
        complaint: 'Sakit kepala, mual, pusing',
        diagnosis: 'Vertigo',
        notes: 'Hindari gerakan tiba-tiba, konsumsi obat teratur',
        status: 'selesai'
      },
      {
        patient_id: patients[2].user_id,
        doctor_id: doctorUsers[0].id,
        queue_id: queues[2].id,
        complaint: 'Nyeri perut, mual, muntah',
        diagnosis: 'Gastritis',
        notes: 'Hindari makanan pedas dan asam',
        status: 'selesai'
      }
    ]);
    console.log(`✅ Created ${medicalRecords.length} medical records.\n`);

    // 7. Create Prescriptions
    console.log('📝 Creating prescriptions...');
    const prescriptions = await Prescription.bulkCreate([
      {
        medical_record_id: medicalRecords[0].id,
        pharmacist_id: pharmacistUser.id,
        status: 'diberikan',
        notes: 'Resep sudah diberikan ke pasien'
      },
      {
        medical_record_id: medicalRecords[1].id,
        pharmacist_id: pharmacistUser.id,
        status: 'disetujui',
        notes: 'Menunggu penyerahan obat'
      },
      {
        medical_record_id: medicalRecords[2].id,
        pharmacist_id: null,
        status: 'menunggu',
        notes: null
      }
    ]);
    console.log(`✅ Created ${prescriptions.length} prescriptions.\n`);

    // 8. Create Prescription Items
    console.log('📝 Creating prescription items...');
    const prescriptionItems = await PrescriptionItem.bulkCreate([
      {
        prescription_id: prescriptions[0].id,
        medicine_id: medicines[0].id,
        quantity: 2,
        dosage_instruction: '3x1 sesudah makan'
      },
      {
        prescription_id: prescriptions[0].id,
        medicine_id: medicines[1].id,
        quantity: 1,
        dosage_instruction: '2x1 sebelum makan'
      },
      {
        prescription_id: prescriptions[1].id,
        medicine_id: medicines[2].id,
        quantity: 1,
        dosage_instruction: '3x1 sesudah makan'
      },
      {
        prescription_id: prescriptions[1].id,
        medicine_id: medicines[3].id,
        quantity: 1,
        dosage_instruction: '1x1 sebelum tidur'
      },
      {
        prescription_id: prescriptions[2].id,
        medicine_id: medicines[4].id,
        quantity: 1,
        dosage_instruction: '1x1 sebelum makan pagi'
      }
    ]);
    console.log(`✅ Created ${prescriptionItems.length} prescription items.\n`);

    // 9. Create Transactions
    console.log('📝 Creating transactions...');
    // Calculate totals from prescription items
    const total1 = 50000 + (medicines[0].price * 2) + (medicines[1].price * 1); // 50000 + 10000 + 15000 = 75000
    const total2 = 50000 + (medicines[2].price * 1) + (medicines[3].price * 1); // 50000 + 8000 + 12000 = 70000
    const total3 = 50000 + (medicines[4].price * 1); // 50000 + 20000 = 70000
    
    const transactions = await Transaction.bulkCreate([
      {
        patient_id: patients[0].user_id,
        medical_record_id: medicalRecords[0].id,
        cashier_id: cashierUser.id,
        total: total1,
        payment_method: 'tunai',
        status: 'lunas'
      },
      {
        patient_id: patients[1].user_id,
        medical_record_id: medicalRecords[1].id,
        cashier_id: cashierUser.id,
        total: total2,
        payment_method: 'transfer',
        status: 'lunas'
      },
      {
        patient_id: patients[2].user_id,
        medical_record_id: medicalRecords[2].id,
        cashier_id: null,
        total: total3,
        payment_method: 'tunai',
        status: 'belum'
      }
    ]);
    console.log(`✅ Created ${transactions.length} transactions.\n`);

    console.log('✅ Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Patients: ${patients.length}`);
    console.log(`   - Staff: ${staff.length}`);
    console.log(`   - Medicines: ${medicines.length}`);
    console.log(`   - Queues: ${queues.length}`);
    console.log(`   - Medical Records: ${medicalRecords.length}`);
    console.log(`   - Prescriptions: ${prescriptions.length}`);
    console.log(`   - Prescription Items: ${prescriptionItems.length}`);
    console.log(`   - Transactions: ${transactions.length}\n`);
    console.log('🔑 Default password for all users: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

seedDatabase();

