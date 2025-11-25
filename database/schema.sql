-- Klinik Sentosa Database Schema
-- PostgreSQL Database Schema

-- Drop tables if exist (for fresh install)
DROP TABLE IF EXISTS prescription_items CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS queues CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin','pasien','resepsionis','dokter','apoteker','kasir')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  medical_history TEXT,
  blood_type VARCHAR(5),
  emergency_contact VARCHAR(20),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Staff table
CREATE TABLE staff (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialization VARCHAR(100),
  license_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Medicines table
CREATE TABLE medicines (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  dosage VARCHAR(50),
  stock INTEGER DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  min_stock INTEGER DEFAULT 10,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Queues table
CREATE TABLE queues (
  id SERIAL PRIMARY KEY,
  queue_number VARCHAR(10) UNIQUE NOT NULL,
  patient_id INT NOT NULL REFERENCES patients(user_id) ON DELETE CASCADE,
  receptionist_id INT REFERENCES staff(user_id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'menunggu' CHECK (status IN ('menunggu','dipanggil','selesai')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Medical Records table
CREATE TABLE medical_records (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(user_id) ON DELETE CASCADE,
  doctor_id INT REFERENCES staff(user_id) ON DELETE SET NULL,
  queue_id INT REFERENCES queues(id) ON DELETE SET NULL,
  complaint TEXT,
  diagnosis TEXT,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'menunggu' CHECK (status IN ('menunggu','selesai')),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id SERIAL PRIMARY KEY,
  medical_record_id INT NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
  pharmacist_id INT REFERENCES staff(user_id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'menunggu' CHECK (status IN ('menunggu','disetujui','ditolak','diberikan')),
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Prescription Items table
CREATE TABLE prescription_items (
  id SERIAL PRIMARY KEY,
  prescription_id INT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_id INT NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  dosage_instruction TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(user_id) ON DELETE CASCADE,
  cashier_id INT REFERENCES staff(user_id) ON DELETE SET NULL,
  medical_record_id INT REFERENCES medical_records(id) ON DELETE SET NULL,
  total DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(20) DEFAULT 'tunai' CHECK (payment_method IN ('tunai','transfer','ewallet')),
  status VARCHAR(20) DEFAULT 'lunas' CHECK (status IN ('lunas','belum')),
  receipt_url VARCHAR(255),
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_queues_status ON queues(status);
CREATE INDEX idx_queues_patient_id ON queues(patient_id);
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_transactions_patient_id ON transactions(patient_id);
