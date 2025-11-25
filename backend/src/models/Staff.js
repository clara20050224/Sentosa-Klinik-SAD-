import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    specialization: {
      type: DataTypes.STRING(100)
    },
    license_number: {
      type: DataTypes.STRING(50)
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'staff',
    timestamps: true
  });

  Staff.associate = (models) => {
    Staff.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Staff.hasMany(models.Queue, {
      foreignKey: 'receptionist_id',
      as: 'createdQueues'
    });
    Staff.hasMany(models.MedicalRecord, {
      foreignKey: 'doctor_id',
      as: 'records'
    });
    Staff.hasMany(models.Prescription, {
      foreignKey: 'pharmacist_id',
      as: 'prescriptions'
    });
    Staff.hasMany(models.Transaction, {
      foreignKey: 'cashier_id',
      as: 'transactions'
    });
  };

  return Staff;
};