import { createClient } from '@supabase/supabase-js';

// Supabase URL and Anon Key are needed for the client-side, but for the Next.js API routes,
// we should use the Service Role Key for secure, server-side access.
// However, since the frontend is sending the Anon Key, we will use the Anon Key here
// for simplicity, assuming RLS is correctly set up on the Supabase side.

// For server-side Next.js API routes, we typically use the Service Role Key
// and a different client setup, but to match the frontend's expectation of
// unauthenticated access (via Anon Key), we'll use the provided Anon Key here.

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to create a Supabase client for server-side use
// This is the correct way to handle it in Next.js API routes
export const createServerSupabaseClient = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // This should be a secret

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase URL or Service Role Key environment variables for server client.');
  }

  return createClient(url, serviceRoleKey);
};
