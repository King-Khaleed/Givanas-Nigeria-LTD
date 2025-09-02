
'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: 'admin' | 'staff' | 'client') {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    // Check if current user is admin
    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') {
        throw new Error("You are not authorized to perform this action.")
    }

    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/admin/users')
}

export async function toggleUserActive(userId: string, isActive: boolean) {
    const supabase = createClient()
     const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Not authenticated")

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (adminProfile?.role !== 'admin') {
        throw new Error("You are not authorized to perform this action.")
    }

    const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/admin/users')
}
