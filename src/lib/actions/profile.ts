'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const updateProfileSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name is required.' }),
  phone: z.string().optional(),
});

export async function updateProfile(values: z.infer<typeof updateProfileSchema>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'You must be logged in to update your profile.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: values.fullName,
      phone: values.phone,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: 'Failed to update profile. ' + error.message };
  }

  revalidatePath('/profile');
  return { success: true };
}
