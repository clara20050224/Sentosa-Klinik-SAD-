import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models/Index.js';

const { User, Patient, Staff } = db;

export const registerPasien = async (req, res) => {
  const { name, email, password, phone, address, role } = req.body;

  try {
    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password harus diisi.' });
    }

    // Validasi role
    const validRoles = ['admin', 'pasien', 'resepsionis', 'dokter', 'apoteker', 'kasir'];
    const selectedRole = role || 'pasien';
    
    if (!validRoles.includes(selectedRole)) {
      return res.status(400).json({ error: 'Role tidak valid.' });
    }

    // Check JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET tidak ditemukan di environment variables');
      return res.status(500).json({ error: 'Konfigurasi server tidak lengkap.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email sudah terdaftar.' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      address,
      role: selectedRole
    });

    // Jika role adalah staff (dokter, apoteker, kasir, resepsionis), buat Staff profile
    if (['dokter', 'apoteker', 'kasir', 'resepsionis', 'admin'].includes(selectedRole)) {
      await Staff.create({ user_id: user.id });
    }

    // Jika role adalah pasien, buat Patient profile
    if (selectedRole === 'pasien') {
      await Patient.create({ user_id: user.id });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.status(201).json({
      message: 'Pendaftaran berhasil.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('❌ Register error:', err);
    console.error('   Error message:', err.message);
    console.error('   Error stack:', err.stack);
    res.status(500).json({ 
      error: err.message || 'Terjadi kesalahan saat pendaftaran.',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validasi input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password harus diisi.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Email atau password salah.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Email atau password salah.' });

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET tidak ditemukan di environment variables');
      return res.status(500).json({ error: 'Konfigurasi server tidak lengkap.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    res.json({
      message: 'Login berhasil.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ 
      error: err.message || 'Terjadi kesalahan saat login.',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) return res.status(404).json({ error: 'User tidak ditemukan.' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = (req, res) => {
  res.json({ message: 'Logout berhasil.' });
};