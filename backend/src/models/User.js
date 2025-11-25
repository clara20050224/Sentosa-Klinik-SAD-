import { DataTypes } from 'sequelize';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING
    },
    address: {
      type: DataTypes.TEXT
    },
    role: {
      type: DataTypes.ENUM('admin', 'pasien', 'resepsionis', 'dokter', 'apoteker', 'kasir'),
      allowNull: false
    }
  }, {
    tableName: 'users',
    timestamps: true
  });

  User.associate = (models) => {
    User.hasOne(models.Patient, {
      foreignKey: 'user_id',
      as: 'patientProfile'
    });
    User.hasOne(models.Staff, {
      foreignKey: 'user_id',
      as: 'staffProfile'
    });
  };

  return User;
};