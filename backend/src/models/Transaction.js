import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    total: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM('tunai', 'transfer', 'ewallet'),
      defaultValue: 'tunai'
    },
    status: {
      type: DataTypes.ENUM('lunas', 'belum'),
      defaultValue: 'lunas'
    },
    receipt_url: {
      type: DataTypes.STRING(255)
    }
  }, {
    tableName: 'transactions',
    timestamps: true
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.Patient, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
    Transaction.belongsTo(models.Staff, {
      foreignKey: 'cashier_id',
      as: 'cashier'
    });
    Transaction.belongsTo(models.MedicalRecord, {
      foreignKey: 'medical_record_id',
      as: 'medicalRecord'
    });
  };

  return Transaction;
};