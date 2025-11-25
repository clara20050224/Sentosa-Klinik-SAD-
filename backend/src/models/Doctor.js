import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const Doctor = sequelize.define('Doctor', {
    specialization: {
      type: DataTypes.STRING(100)
    }
  }, {
    tableName: 'staff',
    timestamps: true
  });

  return Doctor;
};
