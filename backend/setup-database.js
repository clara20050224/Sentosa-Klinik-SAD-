import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME || 'klinik_sentosa';

console.log('🚀 Setting up Klinik Sentosa Database...\n');

// Check if database exists, if not create it
console.log('📋 Step 1: Checking database...');
try {
  const checkDbCmd = `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -lqt | cut -d \\| -f 1 | grep -w ${DB_NAME}`;
  execSync(checkDbCmd, { stdio: 'ignore', env: { ...process.env, PGPASSWORD: DB_PASS } });
  console.log(`✅ Database "${DB_NAME}" already exists.`);
} catch (error) {
  console.log(`📝 Creating database "${DB_NAME}"...`);
  try {
    const createDbCmd = `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -c "CREATE DATABASE ${DB_NAME};"`;
    execSync(createDbCmd, { 
      stdio: 'inherit',
      env: { ...process.env, PGPASSWORD: DB_PASS }
    });
    console.log(`✅ Database "${DB_NAME}" created successfully.`);
  } catch (err) {
    console.error('❌ Failed to create database. Please create it manually:');
    console.error(`   psql -U ${DB_USER} -c "CREATE DATABASE ${DB_NAME};"`);
    process.exit(1);
  }
}

// Run schema SQL
console.log('\n📋 Step 2: Running schema SQL...');
try {
  const schemaPath = join(projectRoot, 'database', 'schema.sql');
  const schemaSQL = readFileSync(schemaPath, 'utf-8');
  
  const runSchemaCmd = `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -f "${schemaPath}"`;
  execSync(runSchemaCmd, {
    stdio: 'inherit',
    env: { ...process.env, PGPASSWORD: DB_PASS }
  });
  console.log('✅ Schema SQL executed successfully.');
} catch (error) {
  console.error('❌ Failed to run schema SQL:', error.message);
  console.error('\n💡 Try running manually:');
  console.error(`   psql -U ${DB_USER} -d ${DB_NAME} -f database/schema.sql`);
  process.exit(1);
}

// Optional: Run seeds
console.log('\n📋 Step 3: Do you want to run seeds? (Optional)');
console.log('   To run seeds manually:');
console.log(`   psql -U ${DB_USER} -d ${DB_NAME} -f database/seeds_sql.sql`);

console.log('\n✅ Database setup completed!');
console.log('\n📝 Next steps:');
console.log('   1. Make sure your backend/.env file is configured correctly');
console.log('   2. Start the backend server: cd backend && npm run dev');
console.log('   3. You should see: "✅ Database connected."');

