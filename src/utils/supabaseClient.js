import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('bunny_supabase_url') || '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('bunny_supabase_key') || '';
  
  const isPlaceholder = url.includes('your-project-id') || key.includes('your-anon-key') || url.includes('xyzcompany');
  const isConfigured = Boolean(url && key && url.startsWith('https://') && url.includes('supabase') && !isPlaceholder);
  
  return { url, key, isConfigured };
};

const initialConfig = getSupabaseConfig();
export const isSupabaseConfigured = initialConfig.isConfigured;

let clientInstance = null;
let currentUrl = null;
let currentKey = null;

export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (clientInstance && currentUrl === url && currentKey === key) {
    return clientInstance;
  }

  try {
    currentUrl = url;
    currentKey = key;
    clientInstance = createClient(url, key);
    return clientInstance;
  } catch (e) {
    console.error('Supabase client creation error:', e);
    return null;
  }
};

export const supabase = initialConfig.isConfigured 
  ? createClient(initialConfig.url, initialConfig.key) 
  : null;

export const saveSupabaseConfig = (url, key) => {
  if (url) localStorage.setItem('bunny_supabase_url', url.trim());
  else localStorage.removeItem('bunny_supabase_url');

  if (key) localStorage.setItem('bunny_supabase_key', key.trim());
  else localStorage.removeItem('bunny_supabase_key');

  clientInstance = null;
  currentUrl = null;
  currentKey = null;
};
