const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error("CRITICAL: Missing Supabase URL or Service Key.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
