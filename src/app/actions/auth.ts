
'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  organizationName: z.string().min(2),
  role: z.enum(['staff', 'client']),
});

export async function signup(values: z.infer<typeof signupSchema>) {
    const supabase = createClient();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
    });

    if (authError) {
        return { error: authError.message };
    }
    if (!authData.user) {
        return { error: 'User not created in Auth.' };
    }

    // Create organization
    const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: values.organizationName })
        .select()
        .single();
    
    if (orgError) {
        // Potentially handle user cleanup if org creation fails
        return { error: `Failed to create organization: ${orgError.message}` };
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        email: values.email,
        full_name: values.fullName,
        organization_id: orgData.id,
        role: values.role,
    });

    if (profileError) {
         // Potentially handle user/org cleanup
        return { error: `Failed to create profile: ${profileError.message}` };
    }
    
    return { success: true };
}


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient();
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: 'Invalid fields!' };
  }
  
  const { email, password } = validatedFields.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    
    return { success: true, role: profile?.role ?? "client" };
  }
  
  return { success: false, error: "An unknown error occurred." };
}

export async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    return { success: true };
}
