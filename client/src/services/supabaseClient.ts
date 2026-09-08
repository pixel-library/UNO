import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hrybntchrqeahisnhtfc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Npsiqk8H6T7zXdhJ6ga83g_eXPUuIGR';

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

export const checkSupabaseConnection = async (): Promise<{ connected: boolean; error?: string }> => {
  if (!isSupabaseConfigured()) {
    return { connected: false, error: 'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables are missing on Vercel.' };
  }
  try {
    const { data, error } = await supabase.from('GameSession').select('count', { count: 'exact', head: true });
    if (error) {
      return { connected: false, error: error.message };
    }
    return { connected: true };
  } catch (err: any) {
    return { connected: false, error: err?.message || 'Failed to connect to Supabase.' };
  }
};

