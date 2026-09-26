// run with: npx tsx create_user.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjfhfmpuzxdfxkbomlaa.supabase.co';
// WARNING: Put your SERVICE_ROLE key here (Found in Supabase Dashboard -> Project Settings -> API)
// DO NOT use the anon key. Use the secret `service_role` key.
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZmhmbXB1enhkZnhrYm9tbGFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDM1NDc2MywiZXhwIjoyMTA1OTMwNzYzfQ.GeuROcmIql3pnw_c5U2akvGoXPoPtbXeTaCVFt_99lE';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUsers() {
  console.log("Creating Admin User...");
  const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin@hackathon.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'admin' }
  });

  if (adminError) {
    console.error("Admin error:", adminError.message);
  } else {
    console.log("✅ Admin created! (admin@hackathon.com / password123)");
  }

  console.log("Creating Student User...");
  const { data: studentData, error: studentError } = await supabaseAdmin.auth.admin.createUser({
    email: 'student@hackathon.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { role: 'student' }
  });

  if (studentError) {
    console.error("Student error:", studentError.message);
  } else {
    console.log("✅ Student created! (student@hackathon.com / password123)");
  }
}

createUsers();
