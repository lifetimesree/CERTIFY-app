import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjfhfmpuzxdfxkbomlaa.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZmhmbXB1enhkZnhrYm9tbGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDM1NDc2MywiZXhwIjoyMTA1OTMwNzYzfQ.GeuROcmIql3pnw_c5U2akvGoXPoPtbXeTaCVFt_99lE';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function wipe() {
  console.log("Wiping all certificates...");
  const { error } = await supabaseAdmin.from('certificates').delete().neq('id', 'dummy');
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Successfully wiped all certificates from the database!");
  }
}
wipe();
