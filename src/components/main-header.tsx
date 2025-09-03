
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import type { Profile } from "@/lib/types";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from "./ui/breadcrumb";

interface MainHeaderProps {
  profile: Profile | null;
}

export function MainHeader({ profile }: MainHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>

      <div className="hidden md:flex">
         <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
      </div>
     
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
         <div className="ml-auto flex-1 sm:flex-initial">
             {/* Search can go here */}
        </div>
        <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="h-5 w-5"/>
            <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="sr-only">Toggle notifications</span>
        </Button>
        <UserNav profile={profile} />
      </div>
    </header>
  );
}
