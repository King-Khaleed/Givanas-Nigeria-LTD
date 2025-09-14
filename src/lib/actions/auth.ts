'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server'; // We still need server client for some operations
import { createAdminClient } from '@/lib/supabase/server';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string(),
  organizationName: z.string(),
  phone: z.string().optional(),
  role: z.enum(['staff', 'client']), // Admin creation should be separate
});

export async function signup(values: z.infer<typeof signupSchema>) {
  const supabaseAdmin = createAdminClient();

  const { data: { user }, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
    email: values.email,
    password: values.password,
    email_confirm: true, // Auto-confirm user for simplicity in this project
     user_metadata: {
        full_name: values.fullName,
        organization_name: values.organizationName,
        phone: values.phone,
        role: values.role,
      },
  });

  if (signUpError) {
    return { error: `Error creating user: ${signUpError.message}` };
  }
  if (!user) {
    return { error: 'User not created, cannot proceed with profile.' };
  }
  
  const supabase = createClient();
   const { data: orgData, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: values.organizationName,
      admin_id: user.id, // Assign the new user as the admin of their own org for now
    })
    .select('id')
    .single();

  if (orgError) {
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    return { error: `Error creating organization: ${orgError.message}` };
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      organization_id: orgData.id,
      organization_name: values.organizationName
     })
    .eq('id', user.id);

  if (profileError) {
     await supabaseAdmin.auth.admin.deleteUser(user.id);
     return { error: `Error creating profile: ${profileError.message}` };
  }

  return { success: true };
}


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Note: Login/Logout actions now primarily happen on the client
// but we keep these server actions in case they are needed elsewhere.

export async function login(values: z.infer<typeof loginSchema>) {
  // This function is now less critical as login state is managed client-side.
  // We can't directly manipulate the client-side session from a server action.
  // The client will handle the redirect based on the AuthProvider state change.
  // We just return success/error.
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(values);

  if (error) {
    return { error: 'Invalid email or password.' };
  }

  // The client-side onAuthStateChange will handle the redirect.
  return { success: true };
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    return { error: 'Could not sign out.' };
  }

  // Client-side onAuthStateChange will handle redirect to /login
  return { success: true };
}
