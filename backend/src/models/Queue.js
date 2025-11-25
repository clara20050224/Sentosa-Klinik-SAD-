import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Queue = sequelize.define('Queue', {
    queue_number: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('menunggu', 'dipanggil', 'selesai'),
      defaultValue: 'menunggu'
    }
  }, {
    tableName: 'queues',
    timestamps: true
  });

  Queue.associate = (models) => {
    Queue.belongsTo(models.Patient, {
      foreignKey: 'patient_id',
      as: 'patient'
    });
    Queue.belongsTo(models.Staff, {
      foreignKey: 'receptionist_id',
      as: 'receptionist'
    });
  };

  return Queue;
};