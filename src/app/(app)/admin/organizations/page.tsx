'use client';

import PageHeader from "@/components/shared/page-header";
import { OrganizationsTable } from "@/components/admin/organizations-table";
import { AddOrganization } from "@/components/admin/add-organization";
import type { Organization } from './data';
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

async function getOrganizations(): Promise<Organization[]> {
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      industry,
      created_at,
      admin_id,
      admin:profiles!admin_id (
        full_name,
        email
      )
    `);

  if (error) {
    console.error("Error fetching organizations:", error.message);
    return [];
  }

  // Map the data to match the expected table structure
  return organizations.map((org: any) => ({
    id: org.id,
    name: org.name,
    industry: org.industry ?? 'N/A',
    admin: {
      name: org.admin?.full_name ?? 'N/A',
      email: org.admin?.email ?? 'N/A',
      avatar: `https://picsum.photos/seed/${org.id.substring(0, 5)}/40/40`,
    },
    adminId: org.admin_id,
    totalRecords: 0, // This would need another query to calculate
    lastActivity: new Date(org.created_at).toLocaleDateString(),
    status: 'active' as const,
  }));
}

export default function OrganizationsPage() {
  const [data, setData] = useState<Organization[]>([]);
  const [users, setUsers] = useState<{ id: string; full_name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const orgData = await getOrganizations();
      setData(orgData);
      
      const { data: usersData } = await supabase.from('profiles').select('id, full_name').eq('role', 'admin');
      setUsers(usersData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div>
      <PageHeader title="Organizations" description="Manage all organizations on the platform.">
        <AddOrganization users={users || []} />
      </PageHeader>
      <OrganizationsTable data={data} allAdmins={users || []} />
    </div>
  );
}
