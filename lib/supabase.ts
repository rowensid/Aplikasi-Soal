
import { createClient } from '@supabase/supabase-js';

// GANTI DENGAN KREDENSIAL SUPABASE ANDA DARI (SETTINGS -> API)
// Jika belum ada, biarkan kosong, app akan fallback ke localStorage (demo mode)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Only create the client if the URL and Key are present to avoid "supabaseUrl is required" error
export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;
