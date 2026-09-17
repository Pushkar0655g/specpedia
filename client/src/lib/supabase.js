import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://dnsaundkonfquugtocne.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7rGXkjvk-GBy3EOp2iowTQ_OZ6SDylR';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

let activeSession = null;

// Immediately initialize active session from storage if available
supabase.auth.getSession().then(({ data: { session } }) => {
  activeSession = session;
});

// Keep activeSession updated on all auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  activeSession = session;
});

/**
 * Returns the current active session access token, or null if unauthenticated.
 */
export async function getAccessToken() {
  if (activeSession?.access_token) {
    return activeSession.access_token;
  }
  const { data } = await supabase.auth.getSession();
  activeSession = data.session;
  return data.session?.access_token || null;
}

/**
 * Sends a magic link OTP to the given email address.
 */
export async function signInWithOtp(email) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  });
}

/**
 * Signs the current user out of their Supabase session.
 */
export async function signOut() {
  activeSession = null;
  return supabase.auth.signOut();
}

export default supabase;
