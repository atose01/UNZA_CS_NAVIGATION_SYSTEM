import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-provisioning-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type AccountType = 'student' | 'lecturer' | 'developer';

type ProvisionBody = {
  account_type?: AccountType;
  computer_id?: string;
  email?: string;
  full_name?: string;
  password?: string;
  phone?: string;
  department?: string;
  academic_title?: string;
  specialization?: string;
  office_room_id?: string;
  lecturer_id?: string;
  email_confirmed?: boolean;
};

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function generateTemporaryPassword() {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return `Unza-${Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, 20)}!`;
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return response({ error: 'Method not allowed.' }, 405);

  const setupToken = request.headers.get('x-provisioning-token');
  if (!setupToken || setupToken !== Deno.env.get('ACCOUNT_PROVISIONING_TOKEN')) {
    return response({ error: 'Unauthorized.' }, 401);
  }

  try {
    const body = (await request.json()) as ProvisionBody;
    const accountType = body.account_type;
    const fullName = body.full_name?.trim();
    const computerId = body.computer_id?.trim() || null;

    if (!accountType || !fullName) return response({ error: 'account_type and full_name are required.' }, 400);
    if (computerId && !/^\d{10}$/.test(computerId)) return response({ error: 'computer_id must contain exactly 10 digits.' }, 400);

    const suppliedEmail = body.email?.trim().toLowerCase() || '';
    if (accountType === 'lecturer' && (!suppliedEmail || !suppliedEmail.endsWith('@cs.unza.zm'))) {
      return response({ error: 'Lecturer provisioning requires the confirmed @cs.unza.zm email address.' }, 400);
    }
    if (suppliedEmail && !validEmail(suppliedEmail)) return response({ error: 'A valid email address is required.' }, 400);
    if (accountType !== 'student' && !suppliedEmail) return response({ error: 'Staff accounts require an email address.' }, 400);

    const url = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceRoleKey) throw new Error('Supabase function secrets are not configured.');

    const email = suppliedEmail || `${computerId}@student.accounts.unza.zm`;
    const password = body.password?.trim() || generateTemporaryPassword();
    if (password.length < 8) return response({ error: 'Temporary passwords must be at least 8 characters long.' }, 400);

    const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersError) throw usersError;

    const existingUser = usersData.users.find((user) => user.email?.toLowerCase() === email);
    const authPayload = {
      email,
      password,
      user_metadata: {
        full_name: fullName,
        ...(computerId ? { computer_id: computerId } : {}),
        password_change_required: true,
      },
    };
    const userResult = existingUser
      ? await admin.auth.admin.updateUserById(existingUser.id, {
          ...authPayload,
          ...(body.email_confirmed === true ? { email_confirm: true } : {}),
        })
      : await admin.auth.admin.createUser({ ...authPayload, email_confirm: Boolean(body.email_confirmed) });
    if (userResult.error || !userResult.data.user) throw userResult.error || new Error('Auth user was not created.');

    const role = accountType === 'lecturer' ? 'lecturer_admin' : accountType === 'developer' ? 'developer_admin' : 'student';
    const { error: profileError } = await admin.from('profiles').upsert({
      id: userResult.data.user.id,
      computer_id: computerId,
      email,
      full_name: fullName,
      role,
      password_change_required: true,
      department: body.department?.trim() || (accountType === 'student' ? null : 'Computer Science'),
    }, { onConflict: 'id' });
    if (profileError) throw profileError;

    let lecturerId: string | null = null;
    if (accountType === 'lecturer') {
      lecturerId = body.lecturer_id || null;
      if (!lecturerId) {
        const { data: existingLecturer, error: lecturerLookupError } = await admin
          .from('lecturers')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (lecturerLookupError) throw lecturerLookupError;
        lecturerId = existingLecturer?.id || crypto.randomUUID();
      }

      const { error: lecturerError } = await admin.from('lecturers').upsert({
        id: lecturerId,
        user_id: userResult.data.user.id,
        full_name: fullName,
        academic_title: body.academic_title?.trim() || 'Lecturer',
        department: body.department?.trim() || 'Computer Science',
        specialization: body.specialization?.trim() || null,
        email,
        email_verified: Boolean(body.email_confirmed),
        phone: body.phone?.trim() || null,
        office_room_id: body.office_room_id?.trim() || null,
        status: 'active',
      }, { onConflict: 'id' });
      if (lecturerError) throw lecturerError;
    }

    return response({
      account_type: accountType,
      user_id: userResult.data.user.id,
      lecturer_id: lecturerId,
      email,
      computer_id: computerId,
      email_confirmed: Boolean(body.email_confirmed),
      temporary_password: password,
      password_change_required: true,
      warning: 'Store this temporary password securely. It is returned only in this protected provisioning response.',
    });
  } catch (error) {
    console.error('Account provisioning failed:', error);
    return response({ error: 'Unable to provision account.' }, 500);
  }
});
