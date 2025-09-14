import {
  Home,
  Users,
  Building,
  FileText,
  BarChart2,
  Settings,
  Upload,
  Database,
  FileCheck2,
} from 'lucide-react';

export type NavLink = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: ('staff' | 'client')[];
};

export const ADMIN_NAV_LINKS: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/organizations', label: 'Organizations', icon: Building },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export const USER_NAV_LINKS: NavLink[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, roles: ['staff', 'client'] },
  { href: '/dashboard/upload', label: 'Upload', icon: Upload, roles: ['staff'] },
  { href: '/dashboard/records', label: 'Records', icon: Database, roles: ['staff', 'client'] },
  { href: '/dashboard/analysis', label: 'Analysis', icon: FileCheck2, roles: ['staff', 'client'] },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText, roles: ['staff', 'client'] },
];
