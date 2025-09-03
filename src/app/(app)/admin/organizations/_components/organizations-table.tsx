
'use client'

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Building, Settings, Users, FileSearch, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Organization = {
  id: string;
  name: string;
  industry: string;
  admin: string;
  users: number;
  files: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'trial' | 'suspended';
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
}

const getInitials = (name: string) => {
    if (!name) return "";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

const StatusBadge = ({ status }: { status: Organization['status'] }) => {
    const variant = {
        active: 'bg-green-100 text-green-800 border-green-200',
        inactive: 'bg-gray-100 text-gray-800 border-gray-200',
        trial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        suspended: 'bg-red-100 text-red-800 border-red-200',
    }[status];
    return <Badge className={`capitalize ${variant}`}>{status}</Badge>
}

const PlanBadge = ({ plan }: { plan: Organization['plan'] }) => {
    const variant = {
        free: 'bg-gray-100 text-gray-800',
        basic: 'bg-blue-100 text-blue-800',
        professional: 'bg-purple-100 text-purple-800',
        enterprise: 'bg-yellow-500 text-white',
    }[plan];
    return <Badge className={`capitalize ${variant}`}>{plan}</Badge>
}

export function OrganizationsTable({ organizations }: { organizations: Organization[] }) {

  return (
    <div className="w-full">
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead padding="checkbox">
                            <Checkbox />
                        </TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Files</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {organizations.map((org) => (
                        <TableRow key={org.id} className="hover:bg-muted/50">
                            <TableCell padding="checkbox">
                                <Checkbox />
                            </TableCell>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={`https://avatar.vercel.sh/${org.name}.png`} />
                                        <AvatarFallback>{getInitials(org.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-bold">{org.name}</div>
                                        <div className="text-xs text-muted-foreground">{org.industry}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{org.admin}</TableCell>
                            <TableCell>{org.users}</TableCell>
                            <TableCell>{org.files}</TableCell>
                            <TableCell>{org.lastActivity}</TableCell>
                            <TableCell><StatusBadge status={org.status} /></TableCell>
                            <TableCell><PlanBadge plan={org.plan} /></TableCell>
                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>
                                            <FileSearch className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Users className="mr-2 h-4 w-4" /> View Users
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Settings className="mr-2 h-4 w-4" /> Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Ban className="mr-2 h-4 w-4" /> Suspend
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">
                                             <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm">Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
        </div>
    </div>
  );
}
