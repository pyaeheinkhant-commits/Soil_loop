/**
 * Optional Supabase adapter. The demo store in store.ts is the default so
 * judges can walk the loop with no project keys. Wire this client after
 * `npm i @supabase/supabase-js` and filling .env.local.
 */
export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
