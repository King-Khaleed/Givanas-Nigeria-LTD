
'use client'

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function InviteUserButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Invite New User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <DialogDescription>
            Send an invitation to a new user to join an organization on the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Full Name
            </Label>
            <Input id="name" placeholder="John Doe" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" placeholder="john@example.com" className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
             <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="organization" className="text-right">
              Organization
            </Label>
             <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select an organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acme">Acme Corp</SelectItem>
                <SelectItem value="techstart">TechStart Inc</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="message" className="text-right pt-2">
              Message
            </Label>
            <Textarea id="message" placeholder="Optional: Include a custom welcome message." className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Send Invitation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
