
"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    organizationName: z.string().min(2),
    phone: z.string().optional(),
    role: z.enum(["staff", "client"]),
});


export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient();
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  
  if (data.user) {
    const { data: profile } = await supabase.from('profiles').select('role, organization_id').eq('id', data.user.id).single();
    
    if (profile?.organization_id) {
        await supabase.from('activities').insert({
            user_id: data.user.id,
            organization_id: profile.organization_id,
            action: 'User logged in'
        });
    }

    return { success: true, role: profile?.role ?? 'client' };
  }

  return { success: true, role: 'client' };
}

export async function signup(values: z.infer<typeof signupSchema>) {
    const origin = headers().get('origin');
    const supabase = createClient();
    const validatedFields = signupSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, fullName, organizationName, phone, role } = validatedFields.data;
    
    // Note: The on_auth_user_created trigger now handles profile creation.
    // We just need to pass the metadata.
    const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: fullName,
                organization_name: organizationName,
                phone: phone,
                role: role,
            }
        },
    });

    if (signUpError) {
        return { error: signUpError.message };
    }
    
    if (data.user) {
      // The trigger will create the profile and org, but we need to log the activity.
      // We can't know the org_id here, so this will be a more general activity log.
      // A better approach might be a trigger on profile creation itself.
    }

    return { success: true };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return { success: true };
}
