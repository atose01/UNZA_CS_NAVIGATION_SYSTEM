import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type ResetBody = { identifier?: string; redirect_to?: string };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const genericResponse = () => new Response(JSON.stringify({ message: 'If the account exists, password reset instructions have been sent.' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

  if (request.method !== 'POST') return genericResponse();

  try {
    const body = (await request.json()) as ResetBody;
    const identifier = body.identifier?.trim();
    if (!identifier) return genericResponse();

    const url = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!url || !serviceRoleKey || !anonKey) throw new Error('Supabase function secrets are not configured.');

    let email = identifier.includes('@') ? identifier : '';
    const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });

    if (!email) {
      const { data: profile } = await admin
        .from('profiles')
        .select('id')
        .ilike('computer_id', identifier)
        .maybeSingle();
      if (profile) {
        const { data: userData } = await admin.auth.admin.getUserById(profile.id);
        email = userData.user?.email || '';
      }
    }

    if (email) {
      const authClient = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
      await authClient.auth.resetPasswordForEmail(email, {
        redirectTo: body.redirect_to || undefined,
      });
    }
  } catch {
    // Deliberately return the same response for unknown identifiers and failures.
  }

  return genericResponse();
});

