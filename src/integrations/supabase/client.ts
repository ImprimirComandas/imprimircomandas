// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pxswvtgkueeombftifgb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4c3d2dGdrdWVlb21iZnRpZmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNDAyODMsImV4cCI6MjA1OTkxNjI4M30.sJGJ840-5jgtHddYENJW00DTkCiaKn2Bd-cjXOotJZo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);