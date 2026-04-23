const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/api/.env' });

async function inspectSchema() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  
  console.log('🔍 Inspecting users table...');
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('✅ Found user columns:', Object.keys(data[0]).join(', '));
    console.log('Sample data:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('❓ No users found in table.');
  }
}

inspectSchema();
