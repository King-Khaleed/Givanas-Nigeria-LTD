'use server';

import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const updatePasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

export async function updateUserPassword(
  values: z.infer<typeof updatePasswordSchema>
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated.' };
  }

  const { error } = await supabase.auth.updateUser({
    password: values.newPassword,
  });

  if (error) {
    return { error: `Failed to update password: ${error.message}` };
  }

  return { success: true, message: 'Password updated successfully.' };
}
