import app from './src/app.js';
import dotenv from 'dotenv';
import sequelize from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Test database connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected.');
    app.listen(PORT, () => {
      console.log(`✅ Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('\n❌ Database connection error:');
    console.error('Error:', err.message);
    console.error('Error Code:', err.original?.code || 'N/A');
    console.error('\n💡 Checklist:');
    console.error('1. Pastikan PostgreSQL sudah running');
    console.error('2. Pastikan database "klinik_sentosa" sudah dibuat');
    console.error('3. Periksa file backend/.env dengan konfigurasi berikut:');
    console.error(`   DB_HOST=${process.env.DB_HOST || 'NOT SET'}`);
    console.error(`   DB_PORT=${process.env.DB_PORT || 'NOT SET'}`);
    console.error(`   DB_USER=${process.env.DB_USER || 'NOT SET'}`);
    console.error(`   DB_PASS=${process.env.DB_PASS ? '***' : 'NOT SET'}`);
    console.error(`   DB_NAME=${process.env.DB_NAME || 'NOT SET'}`);
    
    if (err.original?.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused - PostgreSQL mungkin tidak running');
      console.error('   Windows: Buka Services dan start PostgreSQL service');
    } else if (err.original?.code === '3D000') {
      console.error('\n⚠️  Database tidak ditemukan');
      console.error('   Jalankan: psql -U postgres -c "CREATE DATABASE klinik_sentosa;"');
    } else if (err.original?.code === '28P01') {
      console.error('\n⚠️  Password authentication failed');
      console.error('   Periksa DB_PASS di file .env');
    }
    
    console.error('\n📝 Untuk membuat database, jalankan:');
    console.error('   psql -U postgres -c "CREATE DATABASE klinik_sentosa;"');
    console.error('\n📝 Untuk menjalankan schema, jalankan:');
    console.error('   psql -U postgres -d klinik_sentosa -f database/schema.sql');
    console.error('\n');
    process.exit(1);
  });