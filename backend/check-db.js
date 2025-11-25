import pg from 'pg';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

console.log('🔍 Checking database tables...\n');

const client = new Client({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME
});

try {
  await client.connect();
  console.log('✅ Connected to database.\n');

  // Check if users table exists
  const checkTable = await client.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    );
  `);

  if (checkTable.rows[0].exists) {
    console.log('✅ Table "users" exists.\n');
    
    // List all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`📋 Found ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
  } else {
    console.log('❌ Table "users" does NOT exist.\n');
    console.log('📝 Running schema SQL to create tables...\n');
    
    const schemaPath = join(projectRoot, 'database', 'schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf-8');
    
    // Split and execute statements
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
            console.error('❌ Error executing statement:', err.message);
            throw err;
          }
        }
      }
    }
    
    console.log('✅ Schema SQL executed successfully.\n');
    
    // Verify tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`✅ Created ${tables.rows.length} tables:`);
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
  }

  await client.end();
  console.log('\n✅ Database check completed!\n');

} catch (error) {
  console.error('\n❌ Error:');
  console.error('   Message:', error.message);
  console.error('\n💡 Troubleshooting:');
  console.error('   1. Make sure PostgreSQL is running');
  console.error('   2. Check your backend/.env file has correct DB credentials');
  console.error('   3. Verify DB_PASS matches your PostgreSQL password');
  console.error('   4. Make sure database "klinik_sentosa" exists');
  process.exit(1);
}

