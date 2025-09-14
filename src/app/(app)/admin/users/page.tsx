'use client';

import PageHeader from "@/components/shared/page-header";
import { UsersTable } from "@/components/admin/users-table";
import { formatDistanceToNow } from "date-fns";
import { InviteUser } from "@/components/admin/invite-user";
import type { User, Org } from "./data";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";

async function getUsers(): Promise<User[]> {
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`*`);

    if (error) {
        console.error('Error fetching users:', error.message);
        return [];
    }
    
    return profiles.map((user: any) => ({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        avatar: `https://picsum.photos/seed/${user.id.substring(0, 5)}/40/40`,
        role: user.role,
        organization: user.organization_name ?? 'N/A',
        organizationId: user.organization_id,
        lastLogin: user.updated_at ? formatDistanceToNow(new Date(user.updated_at), { addSuffix: true }) : 'Never',
        status: user.status as 'active' | 'inactive' ?? 'active',
    }));
}

async function getOrganizations(): Promise<Org[]> {
    const { data: organizations, error } = await supabase.from('organizations').select('id, name');
    if (error) {
        console.error('Error fetching organizations:', error.message);
        return [];
    }
    return organizations;
}

export default function UsersPage() {
  const [usersData, setUsersData] = useState<User[]>([]);
  const [organizationsData, setOrganizationsData] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [users, orgs] = await Promise.all([getUsers(), getOrganizations()]);
      setUsersData(users);
      setOrganizationsData(orgs);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Users Management" description="View, manage, and invite users.">
        <InviteUser organizations={organizationsData} />
      </PageHeader>
      <UsersTable data={usersData} organizations={organizationsData} />
    </div>
  );
}
