import { createClient } from '@supabase/supabase-js';

// Retrieve keys from Vite environment variables (prefixed with VITE_ to be exposed to client-side code)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Provide fallback warning if keys are not defined yet, avoiding compiler or runtime crashes
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase configuration keys are missing! ' +
    'Please copy .env.example to .env and populate your target keys. ' +
    'Falling back to local storage Zustand sandboxing.'
  );
}

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export default supabase;
