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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signup(values: z.infer<typeof signupSchema>) {
    const origin = headers().get('origin');
    const supabase = createClient();
    const validatedFields = signupSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { email, password, fullName, organizationName, phone, role } = validatedFields.data;
    
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

    if(data.user) {
        // The user is created in auth.users, but we need to create the profile in public.profiles
        const { error: profileError } = await supabase.from('profiles').insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            organization_name: organizationName,
            phone: phone,
            role: role,
        })
        if (profileError) {
            // If profile creation fails, we should ideally delete the user from auth.users
            // This requires admin privileges. For now, we'll just log the error.
            console.error("Failed to create profile:", profileError.message);
            return { error: `User created, but profile setup failed. ${profileError.message}` };
        }
    }

    return { success: true };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
