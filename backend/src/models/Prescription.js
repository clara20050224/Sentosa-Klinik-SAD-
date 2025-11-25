import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Prescription = sequelize.define('Prescription', {
    status: {
      type: DataTypes.ENUM('menunggu', 'disetujui', 'ditolak', 'diberikan'),
      defaultValue: 'menunggu'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'prescriptions',
    timestamps: true
  });

  Prescription.associate = (models) => {
    Prescription.belongsTo(models.MedicalRecord, {
      foreignKey: 'medical_record_id',
      as: 'medicalRecord'
    });
    Prescription.belongsTo(models.Staff, {
      foreignKey: 'pharmacist_id',
      as: 'pharmacist'
    });
    Prescription.hasMany(models.PrescriptionItem, {
      foreignKey: 'prescription_id',
      as: 'items'
    });
  };

  return Prescription;
};