import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { supabaseAdmin } from './supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Read SQL schema file
    const schemaPath = join(__dirname, '../../database-schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('📋 Executing SQL schema...');
    console.log('Note: You need to run this SQL manually in Supabase SQL Editor:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Copy and paste the content from database-schema.sql');
    console.log('5. Run the query');
    console.log('\n✅ After running the SQL, your database will be ready!');

    // Test connection
    const { data, error } = await supabaseAdmin
      .from('events_categories')
      .select('count');

    if (error) {
      console.error('❌ Error testing database connection:', error.message);
      console.log('\nPlease run the SQL schema manually first.');
    } else {
      console.log('\n✅ Database connection successful!');
    }

  } catch (error) {
    console.error('❌ Setup error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
