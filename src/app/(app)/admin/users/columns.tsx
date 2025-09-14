
"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { type User, type Org } from "./data"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog"
import { EditUserDialog } from "@/components/admin/edit-user-dialog"
import { useTransition } from "react"
import { updateUserStatus } from "@/lib/actions/admin"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export const getColumns = (organizations: Org[]): ColumnDef<User>[] => {
  // We need to define hooks at the top level of the component function
  // So we create a small wrapper component that can use these hooks
  const UserActions = ({ user }: { user: User }) => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const onStatusChange = (userId: string, newStatus: 'active' | 'inactive') => {
      startTransition(async () => {
        const result = await updateUserStatus(userId, newStatus);
        if (result.error) {
          toast({ variant: "destructive", title: "Error", description: result.error });
        } else {
          toast({ title: "Success", description: "User status updated." });
        }
      });
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
            <span className="sr-only">Open menu</span>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <EditUserDialog user={user} organizations={organizations}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit User</DropdownMenuItem>
          </EditUserDialog>
          <DropdownMenuItem>View Activity</DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.status === 'active' ? (
            <DropdownMenuItem onClick={() => onStatusChange(user.id, 'inactive')}>Deactivate User</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onStatusChange(user.id, 'active')}>Activate User</DropdownMenuItem>
          )}
          <DeleteUserDialog userId={user.id} userFullName={user.fullName}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
              Delete User
            </DropdownMenuItem>
          </DeleteUserDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar} alt={user.fullName} />
              <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.fullName}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role: "admin" | "staff" | "client" = row.getValue("role")
        return (
          <Badge
            variant={role === "admin" ? "default" : role === "staff" ? "secondary" : "outline"}
          >
            {role}
          </Badge>
        )
      },
    },
    {
      accessorKey: "organization",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Organization
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status: "active" | "inactive" = row.getValue("status")
        return (
          <span className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
            {status}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => <UserActions user={row.original} />,
    },
  ]
}
