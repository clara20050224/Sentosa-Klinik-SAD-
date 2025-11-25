-- Database Seeds for Klinik Sentosa - SQL Format
-- This file contains demo/test data
-- All test accounts use hashed passwords with bcrypt

-- INSERT ADMIN USER
-- Email: admin@klinik.com, Password: admin123
INSERT INTO users (name, email, password, phone, address, role, "createdAt", "updatedAt")
VALUES ('Admin Klinik', 'admin@klinik.com', '$2b$12$K6CZj5VJ.0R5Dp/6QI6/3etAaP2pHBTMWPF0f5KqxqP/khUO6eJWu', '081234567890', 'Jl. Raya Klinik No. 1', 'admin', NOW(), NOW());

INSERT INTO staff (user_id, is_active, "createdAt", "updatedAt")
VALUES ((SELECT id FROM users WHERE email='admin@klinik.com'), true, NOW(), NOW());

-- INSERT DOCTOR
-- Email: dokter@klinik.com, Password: dokter123
INSERT INTO users (name, email, password, phone, address, role, "createdAt", "updatedAt")
VALUES ('Dr. Budi Santoso', 'dokter@klinik.com', '$2b$12$K6CZj5VJ.0R5Dp/6QI6/3etAaP2pHBTMWPF0f5KqxqP/khUO6eJWu', '081234567891', 'Jl. Dokter', 'dokter', NOW(), NOW());

INSERT INTO staff (user_id, specialization, license_number, is_active, "createdAt", "updatedAt")
VALUES ((SELECT id FROM users WHERE email='dokter@klinik.com'), 'Praktisi Umum', 'SIP-12345-2022', true, NOW(), NOW());

-- INSERT RECEPTIONIST
-- Email: resepsionis@klinik.com, Password: resepsionis123
INSERT INTO users (name, email, password, phone, address, role, "createdAt", "updatedAt")
VALUES ('Siti Resepsionis', 'resepsionis@klinik.com', '$2b$12$K6CZj5VJ.0R5Dp/6QI6/3etAaP2pHBTMWPF0f5KqxqP/khUO6eJWu', '081234567892', 'Jl. Resepsionis', 'resepsionis', NOW(), NOW());

INSERT INTO staff (user_id, is_active, "createdAt", "updatedAt")
VALUES ((SELECT id FROM users WHERE email='resepsionis@klinik.com'), true, NOW(), NOW());

-- INSERT PHARMACIST
-- Email: apoteker@klinik.com, Password: apoteker123
INSERT INTO users (name, email, password, phone, address, role, "createdAt", "updatedAt")
VALUES ('Rina Apoteker', 'apoteker@klinik.com', '$2b$12$K6CZj5VJ.0R5Dp/6QI6/3etAaP2pHBTMWPF0f5KqxqP/khUO6eJWu', '081234567893', 'Jl. Apotek', 'apoteker', NOW(), NOW());

INSERT INTO staff (user_id, license_number, is_active, "createdAt", "updatedAt")
VALUES ((SELECT id FROM users WHERE email='apoteker@klinik.com'), 'SIA-67890-2022', true, NOW(), NOW());

-- INSERT CASHIER
-- Email: kasir@klinik.com, Password: kasir123
INSERT INTO users (name, email, password, phone, address, role, "createdAt", "updatedAt")
VALUES ('Ahmad Kasir', 'kasir@klinik.com', '$2b$12$K6CZj5VJ.0R5Dp/6QI6/3etAaP2pHBTMWPF0f5KqxqP/khUO6eJWu', '081234567894', 'Jl. Kasir', 'kasir', NOW(), NOW());

INSERT INTO staff (user_id, is_active, "createdAt", "updatedAt")
VALUES ((SELECT id FROM users WHERE email='kasir@klinik.com'), true, NOW(), NOW());

-- INSERT PATIENTS
-- Password: pasien123 for all
INSERT INTO users (name, email, password, phone, address, role, "createdAt", "updatedAt")
VALUES 
('Pasien Demo 1', 'pasien1@klinik.com', '$2b$12$K6CZj5VJ.0R5Dp/6QI6/3etAaP2pHBTMWPF0f5KqxqP/khUO6eJWu', '082123456789', 'Jl. Pasien No. 1', 'pasien', NOW(), NOW()),
('Pasien Demo 2', 'pasien2@klinik.com', '$2b$12$K6CZj5VJ.0R5Dp/6QI6/3etAaP2pHBTMWPF0f5KqxqP/khUO6eJWu', '082123456790', 'Jl. Pasien No. 2', 'pasien', NOW(), NOW()),
('Pasien Demo 3', 'pasien3@klinik.com', '$2b$12$K6CZj5VJ.0R5Dp/6QI6/3etAaP2pHBTMWPF0f5KqxqP/khUO6eJWu', '082123456791', 'Jl. Pasien No. 3', 'pasien', NOW(), NOW());

-- INSERT PATIENT PROFILES
INSERT INTO patients (user_id, blood_type, medical_history, "createdAt", "updatedAt")
VALUES 
((SELECT id FROM users WHERE email='pasien1@klinik.com'), 'O+', 'Riwayat hipertensi', NOW(), NOW()),
((SELECT id FROM users WHERE email='pasien2@klinik.com'), 'A+', 'Alergi makanan laut', NOW(), NOW()),
((SELECT id FROM users WHERE email='pasien3@klinik.com'), 'B+', 'Alergi obat penisilin', NOW(), NOW());

-- INSERT MEDICINES
INSERT INTO medicines (name, dosage, stock, price, min_stock, "createdAt", "updatedAt")
VALUES 
('Paracetamol', '500mg', 100, 2500, 10, NOW(), NOW()),
('Amoxicillin', '500mg', 50, 8000, 10, NOW(), NOW()),
('Ibuprofen', '200mg', 75, 3000, 10, NOW(), NOW()),
('Vitamin C', '500mg', 200, 1500, 20, NOW(), NOW()),
('Antasida', '500mg', 60, 3500, 10, NOW(), NOW()),
('Chloramphenicol', '500mg', 30, 15000, 10, NOW(), NOW()),
('Deksametason', '0.5mg', 40, 2000, 10, NOW(), NOW()),
('Cetirizine', '10mg', 80, 4000, 10, NOW(), NOW());

-- Run this with: psql -U postgres -d klinik_sentosa -f database/seeds_sql.sql
