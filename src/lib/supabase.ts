
import { createClient } from '@supabase/supabase-js';

// Usar as credenciais do projeto Supabase conectado
const supabaseUrl = "https://pxswvtgkueeombftifgb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4c3d2dGdrdWVlb21iZnRpZmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNDAyODMsImV4cCI6MjA1OTkxNjI4M30.sJGJ840-5jgtHddYENJW00DTkCiaKn2Bd-cjXOotJZo";

// Create a Supabase client with the provided credentials
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: localStorage
  }
});

// Log a warning if using placeholder values
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Authentication and database features will not work.');
}
