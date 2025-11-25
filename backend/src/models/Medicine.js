import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Medicine = sequelize.define('Medicine', {
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    dosage: {
      type: DataTypes.STRING(50)
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    price: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    min_stock: {
      type: DataTypes.INTEGER,
      defaultValue: 10
    }
  }, {
    tableName: 'medicines',
    timestamps: true
  });

  Medicine.associate = (models) => {
    Medicine.hasMany(models.PrescriptionItem, {
      foreignKey: 'medicine_id',
      as: 'prescriptionItems'
    });
  };

  return Medicine;
};