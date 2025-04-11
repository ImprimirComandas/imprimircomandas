
import { createClient } from '@supabase/supabase-js';

// Check for environment variables or use demo values for development
// These demo values will create a client that can't actually connect to Supabase
// but will prevent the app from crashing during development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key-to-prevent-client-creation-error';

// Create a Supabase client with the provided credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log a warning if using placeholder values
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Missing Supabase environment variables. Authentication and database features will not work. Please connect your project to Supabase to enable these features.');
}
