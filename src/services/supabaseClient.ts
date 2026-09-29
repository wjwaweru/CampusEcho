import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = import.meta.env.VITE_SUPABASE_URL || '';
const DEFAULT_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Allow runtime override via localStorage for demo/testing
export function getSavedSupabaseConfig(): { url: string; key: string } {
  const localUrl = localStorage.getItem('campusecho_sb_url');
  const localKey = localStorage.getItem('campusecho_sb_key');
  return {
    url: localUrl || DEFAULT_URL,
    key: localKey || DEFAULT_KEY,
  };
}

export function saveSupabaseConfig(url: string, key: string) {
  if (url && key) {
    localStorage.setItem('campusecho_sb_url', url.trim());
    localStorage.setItem('campusecho_sb_key', key.trim());
  } else {
    localStorage.removeItem('campusecho_sb_url');
    localStorage.removeItem('campusecho_sb_key');
  }
}

let cachedClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, key } = getSavedSupabaseConfig();
  if (!url || !key || url.includes('your-project.supabase.co')) {
    return null;
  }

  try {
    if (!cachedClient) {
      cachedClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    }
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return null;
  }
}

export function isSupabaseConnected(): boolean {
  return getSupabase() !== null;
}
