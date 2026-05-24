/**
 * Shell layout: shadcn sidebar, header with avatar, main outlet.
 */

import { Avatar, AvatarFallback, AvatarImage } from "@galipette/ui/components/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@galipette/ui/components/sidebar";
import { Link, Outlet } from "@tanstack/react-router";

import { NavigationTree } from "../../features/wiki/components/NavigationTree";

/**
 * @description Renders the application chrome (collapsible sidebar + header) and an
 *   `<Outlet>` for the active child route.
 * @returns Layout element wrapping the current page.
 */
export function AppLayout() {
  return (
    <SidebarProvider>
      <Sidebar>
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
        <SidebarContent>
          <NavigationTree />
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
          <SidebarTrigger />
          <Link
            to="/app/home"
            className="text-sm font-semibold text-foreground no-underline hover:underline"
          >
            Galipette App
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Compiled content explorer
          </span>
          <nav className="ml-auto flex items-center gap-3">
            <Link
              to="/app/characters"
              className="text-sm font-medium text-primary no-underline hover:underline"
            >
              Characters
            </Link>
          </nav>
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
