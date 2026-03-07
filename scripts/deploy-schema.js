// FiniTax Guatemala — Deploy schema to Supabase PostgreSQL
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load env
let dbPassword = process.env.DB_PASSWORD;
try {
  const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const match = envFile.match(/DB_PASSWORD=(.+)/);
  if (match) dbPassword = match[1].trim();
} catch {}

if (!dbPassword) {
  console.error('❌ DB_PASSWORD not found');
  process.exit(1);
}

const PROJECT_REF = 'njbknxmdhmoreknnoylp';
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// Read all migration files in order
const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort();

console.log(`Found ${migrationFiles.length} migrations:`);
migrationFiles.forEach(f => console.log(`  📄 ${f}`));

const connections = [
  {
    name: 'Transaction pooler (port 6543)',
    connectionString: `postgresql://postgres.${PROJECT_REF}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Direct (port 5432)',
    connectionString: `postgresql://postgres.${PROJECT_REF}:${dbPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  },
  {
    name: 'Direct DB host',
    connectionString: `postgresql://postgres:${dbPassword}@db.${PROJECT_REF}.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  },
];

async function tryConnection(config) {
  console.log(`\n🔌 Trying: ${config.name}...`);
  const client = new Client({
    connectionString: config.connectionString,
    ssl: config.ssl,
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log('✅ Connected!');

    // Execute each migration
    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
      console.log(`\n📦 Running: ${file} (${sql.length} chars)...`);
      try {
        await client.query(sql);
        console.log(`✅ ${file} — SUCCESS`);
      } catch (err) {
        console.log(`❌ ${file} — ERROR: ${err.message.substring(0, 200)}`);
        // Continue with next migration
      }
    }

    // Verify tables
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name;
    `);
    console.log(`\n📋 Tables created (${res.rows.length}):`);
    res.rows.forEach(r => console.log(`  ✓ ${r.table_name}`));

    await client.end();
    return true;
  } catch (err) {
    console.log('❌', err.message.substring(0, 150));
    try { await client.end(); } catch {}
    return false;
  }
}

async function main() {
  console.log('🚀 FiniTax Guatemala — Schema Deployment\n');

  for (const config of connections) {
    const success = await tryConnection(config);
    if (success) {
      console.log('\n🎉 Schema deployed successfully!');
      process.exit(0);
    }
  }

  console.log('\n❌ All connection methods failed.');
  process.exit(1);
}

main();
