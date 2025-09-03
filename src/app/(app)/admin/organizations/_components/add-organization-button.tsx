
'use client'

import { Button } from "@/components/ui/button";
import { Building, PlusCircle } from "lucide-react";
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

export function AddOrganizationButton() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization and assign an initial administrator.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input id="org-name" placeholder="Acme Corporation" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="tech">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                             <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="A brief description of the organization..." />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="admin-name">Admin Full Name</Label>
                    <Input id="admin-name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input id="admin-email" type="email" placeholder="admin@example.com" />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input id="website" placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                     <Label htmlFor="plan">Subscription Plan</Label>
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="trial">Free Trial</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Professional</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline">Cancel</Button>
          <Button type="submit">Save Organization</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
