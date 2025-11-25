import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    medical_history: {
      type: DataTypes.TEXT
    },
    blood_type: {
      type: DataTypes.STRING(5)
    },
    emergency_contact: {
      type: DataTypes.STRING(20)
    }
  }, {
    tableName: 'patients',
    timestamps: true
  });

  Patient.associate = (models) => {
    Patient.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Patient.hasMany(models.Queue, {
      foreignKey: 'patient_id',
      as: 'queues'
    });
    Patient.hasMany(models.MedicalRecord, {
      foreignKey: 'patient_id',
      as: 'medicalRecords'
    });
  };

  return Patient;
};