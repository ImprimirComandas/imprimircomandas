
import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to empty strings to prevent errors
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a Supabase client with the provided credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log a warning instead of throwing an error
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Authentication and database features will not work.');
}
