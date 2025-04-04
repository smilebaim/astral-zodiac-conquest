import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Error: Supabase environment variables are not set');
  process.exit(1);
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function createUser() {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'maintenance.web@gmail.com',
      password: 'Bismillah23'
    });

    if (error) throw error;
    console.log('User created successfully:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createUser();