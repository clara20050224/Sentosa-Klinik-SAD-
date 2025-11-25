import { Sequelize } from 'sequelize';
import sequelize from '../config/db.js';
import UserModel from './User.js';
import PatientModel from './Patient.js';
import StaffModel from './Staff.js';
import MedicineModel from './Medicine.js';
import QueueModel from './Queue.js';
import MedicalRecordModel from './MedicalRecord.js';
import PrescriptionModel from './Prescription.js';
import PrescriptionItemModel from './PrescriptionItem.js';
import TransactionModel from './Transaction.js';

const db = {};

// Buat semua models
db.User = UserModel(sequelize, Sequelize.DataTypes);
db.Patient = PatientModel(sequelize, Sequelize.DataTypes);
db.Staff = StaffModel(sequelize, Sequelize.DataTypes);
db.Medicine = MedicineModel(sequelize, Sequelize.DataTypes);
db.Queue = QueueModel(sequelize, Sequelize.DataTypes);
db.MedicalRecord = MedicalRecordModel(sequelize, Sequelize.DataTypes);
db.Prescription = PrescriptionModel(sequelize, Sequelize.DataTypes);
db.PrescriptionItem = PrescriptionItemModel(sequelize, Sequelize.DataTypes);
db.Transaction = TransactionModel(sequelize, Sequelize.DataTypes);

// Jalankan asosiasi
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;