import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const MedicalRecord = sequelize.define('MedicalRecord', {
    complaint: {
      type: DataTypes.TEXT
    },
    diagnosis: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.TEXT
    },
    status: {
      type: DataTypes.ENUM('menunggu', 'selesai'),
      defaultValue: 'menunggu'
    }
  }, {
    tableName: 'medical_records',
    timestamps: true
  });

  MedicalRecord.associate = (models) => {
    MedicalRecord.belongsTo(models.Patient, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
    MedicalRecord.belongsTo(models.Staff, {
      foreignKey: 'doctor_id',
      as: 'doctor'
    });
    MedicalRecord.belongsTo(models.Queue, {
      foreignKey: 'queue_id',
      as: 'queue'
    });
    MedicalRecord.hasOne(models.Prescription, {
      foreignKey: 'medical_record_id',
      as: 'prescription'
    });
  };

  return MedicalRecord;
};