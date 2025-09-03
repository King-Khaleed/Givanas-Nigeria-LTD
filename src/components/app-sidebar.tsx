"use client";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import {
  Home,
  Building2,
  Users,
  FileText,
  BarChart,
  Settings,
  ShieldCheck,
  UploadCloud,
  FileSearch,
  Book,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import type { Profile } from "@/lib/types";

interface AppSidebarProps {
  profile: Profile | null;
}

const adminNav = [
  { href: "/admin", icon: Home, label: "Dashboard" },
  { href: "/admin/organizations", icon: Building2, label: "Organizations" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/reports", icon: FileText, label: "Reports" },
  { href: "/admin/analytics", icon: BarChart, label: "Analytics" },
];

const userNav = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/upload", icon: UploadCloud, label: "Upload" },
  { href: "/dashboard/records", icon: Book, label: "Records" },
  { href: "/dashboard/analysis", icon: FileSearch, label: "Analysis" },
  { href: "/dashboard/reports", icon: FileText, label: "Reports" },
];

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname();
  const isAdmin = profile?.role === "admin";
  const navItems = isAdmin ? adminNav : userNav;

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold font-headline">Givanas Nigeria LTD</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-0">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Button asChild variant={pathname.startsWith(item.href) ? "secondary" : "ghost"} className="w-full justify-start">
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Button asChild variant="ghost" className="w-full justify-start">
                        <Link href="/profile">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                    </Button>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
