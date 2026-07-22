import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ejkoiqnhylipfpzgrtzf.supabase.co';
const supabaseKey = 'sb_publishable_bD9l6-SlloW7WmlBhBBANQ_EFDRul3Q';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

const cookieStorage = {
  getItem(key: string): string | null {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${encodeURIComponent(key)}=([^;]*)`)
    );
    return match ? decodeURIComponent(match[1]) : null;
  },
  setItem(key: string, value: string): void {
    document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Strict`;
  },
  removeItem(key: string): void {
    document.cookie = `${encodeURIComponent(key)}=; max-age=0; path=/`;
  },
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: cookieStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
