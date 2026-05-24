/**
 * Sidebar branding header (avatar + app title).
 */

import { Avatar, AvatarFallback, AvatarImage } from "@galipette/ui/components/avatar";
import { SidebarHeader } from "@galipette/ui/components/sidebar";

/**
 * @description Renders the Galipette identity block at the top of the app sidebar.
 * @returns Sidebar header element.
 */
export function AppSidebarHeader() {
  return (
    <SidebarHeader className="flex flex-row items-center gap-2 border-b border-sidebar-border p-3">
      <Avatar>
        <AvatarImage src="/vite.svg" alt="Galipette" />
        <AvatarFallback>GP</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-sidebar-foreground">Galipette</p>
        <p className="truncate text-xs text-sidebar-foreground/70">Explorer</p>
      </div>
    </SidebarHeader>
  );
}
