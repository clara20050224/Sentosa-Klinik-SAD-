import sequelize from '../src/config/db.js';
import User from '../src/models/User.js';
import Patient from '../src/models/Patient.js';
import Staff from '../src/models/Staff.js';
import Medicine from '../src/models/Medicine.js';
import bcrypt from 'bcrypt';

const seed = async () => {
  await sequelize.sync({ force: true });

  // Admin
  const adminPass = await bcrypt.hash('admin123', 12);
  const admin = await User.create({
    name: 'Admin Sentosa',
    email: 'admin@kliniksantosa.com',
    password: adminPass,
    role: 'admin'
  });

  // Pasien
  const pasienPass = await bcrypt.hash('pasien123', 12);
  const pasien = await User.create({
    name: 'Budi Santoso',
    email: 'budi@gmail.com',
    password: pasienPass,
    phone: '081234567890',
    address: 'Jl. Merdeka No. 10, Jakarta',
    role: 'pasien'
  });
  await Patient.create({ user_id: pasien.id });

  // Resepsionis
  const recPass = await bcrypt.hash('reception123', 12);
  const receptionist = await User.create({
    name: 'Siti Resepsionis',
    email: 'reception@kliniksantosa.com',
    password: recPass,
    role: 'resepsionis'
  });
  await Staff.create({ user_id: receptionist.id });

  // Dokter
  const docPass = await bcrypt.hash('dokter123', 12);
  const dokter = await User.create({
    name: 'Dr. Ahmad Fauzi',
    email: 'dr.ahmad@kliniksantosa.com',
    password: docPass,
    role: 'dokter'
  });
  await Staff.create({ user_id: dokter.id, specialization: 'Umum' });

  // Apoteker & Kasir (serupa)

  // Obat
  await Medicine.bulkCreate([
    { name: 'Paracetamol', dosage: '500mg', stock: 100, price: 5000 },
    { name: 'Amoxicillin', dosage: '500mg', stock: 50, price: 15000 },
    { name: 'Vitamin C', dosage: '100mg', stock: 200, price: 3000 }
  ]);

  console.log('✅ Database seeded successfully.');
  process.exit();
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});