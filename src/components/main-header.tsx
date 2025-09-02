import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "@/components/user-nav";
import type { Profile } from "@/lib/types";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";

interface MainHeaderProps {
  profile: Profile | null;
}

export function MainHeader({ profile }: MainHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-4 w-4"/>
            <span className="sr-only">Toggle notifications</span>
        </Button>
        <UserNav profile={profile} />
      </div>
    </header>
  );
}
