import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASS) {
  console.error('❌ Database configuration missing in .env file!');
  console.error('Required: DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT');
  process.exit(1);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

export default sequelize;