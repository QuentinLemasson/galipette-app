/**
 * Shell layout: shadcn sidebar, header with avatar, main outlet.
 */

import { SidebarInset, SidebarProvider } from "@galipette/ui/components/sidebar";
import { Outlet } from "@tanstack/react-router";

import { AppMainHeader } from "./AppMainHeader";
import { AppSidebar } from "./AppSidebar";

/**
 * @description Renders the application chrome (collapsible sidebar + header) and an
 *   `<Outlet>` for the active child route.
 * @returns Layout element wrapping the current page.
 */
export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <AppMainHeader />

        <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
