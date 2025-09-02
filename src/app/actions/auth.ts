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
    return { error: "Invalid fields!" };
  }

  const { email, password } = validatedFields.data;

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }
  
  if (data.user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role === 'admin') {
      return { success: true, redirectTo: '/admin' };
    }
  }


  return { success: true, redirectTo: '/dashboard' };
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
    const { error: signUpError } = await supabase.auth.signUp({
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

    return { success: true };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
