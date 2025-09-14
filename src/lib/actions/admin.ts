'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

const addOrgSchema = z.object({
  name: z.string().min(2, 'Organization name is required.'),
  industry: z.string().optional(),
  description: z.string().optional(),
  adminId: z.string().uuid('An admin user must be selected.'),
});

export async function addOrganization(values: z.infer<typeof addOrgSchema>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Not authorized.' };

  const { error } = await supabase.from('organizations').insert({
    name: values.name,
    industry: values.industry,
    description: values.description,
    admin_id: values.adminId,
  });

  if (error) {
    return { error: `Failed to create organization: ${error.message}` };
  }

  revalidatePath('/admin/organizations');
  return { success: true };
}


const inviteUserSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  organizationId: z.string().optional(),
  role: z.enum(['admin', 'staff', 'client']),
});

export async function inviteUser(values: z.infer<typeof inviteUserSchema>) {
   const supabase = createClient();
   const supabaseAdmin = createAdminClient();

  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) return { error: 'Not authenticated.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', adminUser.id).single();
  if (profile?.role !== 'admin') return { error: 'Not authorized.' };

  const { data: { user: newUser }, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: values.email,
    password: values.password,
    email_confirm: true,
  });

  if (authError || !newUser) {
    return { error: `Failed to create user: ${authError?.message}` };
  }

  let organizationName: string | null = null;
  if (values.organizationId && values.organizationId !== 'none') {
    const { data: org } = await supabase.from('organizations').select('name').eq('id', values.organizationId).single();
    organizationName = org?.name ?? null;
  }

  const { error: profileError } = await supabase.from('profiles').update({
    full_name: values.fullName,
    email: values.email,
    role: values.role,
    organization_name: organizationName,
    organization_id: values.organizationId !== 'none' ? values.organizationId : null,
  }).eq('id', newUser.id);

  if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(newUser.id);
      return { error: `Failed to update user profile: ${profileError.message}` };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'Invitation sent successfully. The user needs to verify their email.' };
}

export async function deleteOrganization(organizationId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Not authorized.' };

  const { error } = await supabase.from('organizations').delete().eq('id', organizationId);
  if (error) {
    return { error: `Failed to delete organization: ${error.message}` };
  }
  revalidatePath('/admin/organizations');
  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Not authorized.' };

  const supabaseAdmin = createAdminClient();
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (authError) {
    console.warn(`Could not delete user from auth: ${authError.message}`);
  }

  const { error: dbError } = await supabase.from('profiles').delete().eq('id', userId);
  if (dbError) {
    return { error: `Failed to delete user from database: ${dbError.message}` };
  }

  revalidatePath('/admin/users');
  return { success: true };
}


const updateOrgSchema = z.object({
  id: z.string(),
  name: z.string().min(2, 'Organization name is required.'),
  industry: z.string().optional(),
  adminId: z.string().uuid('An admin user must be selected.'),
});

export async function updateOrganization(values: z.infer<typeof updateOrgSchema>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Not authorized.' };

  const { error } = await supabase.from('organizations').update({
    name: values.name,
    industry: values.industry,
    admin_id: values.adminId,
  }).eq('id', values.id);

  if (error) {
    return { error: `Failed to update organization: ${error.message}` };
  }

  revalidatePath('/admin/organizations');
  return { success: true };
}

const updateUserSchema = z.object({
  id: z.string(),
  fullName: z.string().min(2, { message: 'Full name is required.' }),
  role: z.enum(['admin', 'staff', 'client']),
  organizationId: z.string().optional(),
});

export async function updateUser(values: z.infer<typeof updateUserSchema>) {
  const supabase = createClient();

  let organizationName: string | null = null;
  if (values.organizationId && values.organizationId !== 'none') {
    const { data: org } = await supabase.from('organizations').select('name').eq('id', values.organizationId).single();
    organizationName = org?.name ?? null;
  }
  
  const { error } = await supabase.from('profiles').update({
    full_name: values.fullName,
    role: values.role,
    organization_id: values.organizationId !== 'none' ? values.organizationId : null,
    organization_name: organizationName,
  }).eq('id', values.id);
  
  if (error) {
    return { error: 'Failed to update user. ' + error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateUserStatus(userId: string, status: 'active' | 'inactive') {
  const supabase = createClient();
  const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
  
  if (error) {
    return { error: 'Failed to update user status. ' + error.message };
  }
  
  revalidatePath('/admin/users');
  return { success: true };
}

const settingsSchema = z.object({
    googleApiKey: z.string().optional(),
});

export async function updateAdminSettings(values: z.infer<typeof settingsSchema>) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated.' };

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return { error: 'Not authorized.' };

    console.log("Admin settings update called with:", values);
    
    revalidatePath('/admin/settings');
    return { success: true, message: "Settings have been updated (simulated)." };
}
