const { createClient } = require('@supabase/supabase-js')

// Uses Supabase JS client over HTTPS (REST API)
// Connection pooling is handled automatically
// by Supabase internals — no pooler config needed
const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

module.exports = supabase
