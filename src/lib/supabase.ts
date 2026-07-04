import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = 
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Helper to check if Supabase is configured and reachable
export async function isSupabaseConnected(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.from('categories').select('id').limit(1);
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}
