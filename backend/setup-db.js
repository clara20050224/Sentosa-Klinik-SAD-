import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME || 'klinik_sentosa';

console.log('🚀 Setting up Klinik Sentosa Database...\n');

// Connect to postgres database first (to create the target database)
const adminClient = new Client({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: 'postgres' // Connect to default postgres database
});

try {
  await adminClient.connect();
  console.log('✅ Connected to PostgreSQL server.\n');

  // Check if database exists
  console.log('📋 Step 1: Checking database...');
  const dbCheck = await adminClient.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [DB_NAME]
  );

  if (dbCheck.rows.length === 0) {
    console.log(`📝 Creating database "${DB_NAME}"...`);
    await adminClient.query(`CREATE DATABASE ${DB_NAME}`);
    console.log(`✅ Database "${DB_NAME}" created successfully.\n`);
  } else {
    console.log(`✅ Database "${DB_NAME}" already exists.\n`);
  }

  await adminClient.end();

  // Now connect to the target database
  const client = new Client({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME
  });

  await client.connect();
  console.log(`✅ Connected to database "${DB_NAME}".\n`);

  // Run schema SQL
  console.log('📋 Step 2: Running schema SQL...');
  const schemaPath = join(projectRoot, 'database', 'schema.sql');
  const schemaSQL = readFileSync(schemaPath, 'utf-8');
  
  // Split SQL into individual statements and execute
  const statements = schemaSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  for (const statement of statements) {
    if (statement.length > 0) {
      try {
        await client.query(statement);
      } catch (err) {
        // Ignore "does not exist" errors for DROP statements
        if (!err.message.includes('does not exist')) {
          throw err;
        }
      }
    }
  }
  
  console.log('✅ Schema SQL executed successfully.\n');

  // Verify tables were created
  console.log('📋 Step 3: Verifying tables...');
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  
  console.log(`✅ Found ${tables.rows.length} tables:`);
  tables.rows.forEach(row => {
    console.log(`   - ${row.table_name}`);
  });

  await client.end();

  console.log('\n✅ Database setup completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. (Optional) Run seeds: node backend/setup-db.js --seeds');
  console.log('   2. Start the backend server: cd backend && npm run dev');
  console.log('   3. You should see: "✅ Database connected."\n');

} catch (error) {
  console.error('\n❌ Error setting up database:');
  console.error('   Message:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure PostgreSQL is running');
  console.error('   2. Check your backend/.env file has correct DB credentials');
  console.error('   3. Verify DB_PASS matches your PostgreSQL password');
  process.exit(1);
}

