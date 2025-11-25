import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const PrescriptionItem = sequelize.define('PrescriptionItem', {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dosage_instruction: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'prescription_items',
    timestamps: true
  });

  PrescriptionItem.associate = (models) => {
    PrescriptionItem.belongsTo(models.Prescription, {
      foreignKey: 'prescription_id',
      as: 'prescription'
    });
    PrescriptionItem.belongsTo(models.Medicine, {
      foreignKey: 'medicine_id',
      as: 'medicine'
    });
  };

  return PrescriptionItem;
};