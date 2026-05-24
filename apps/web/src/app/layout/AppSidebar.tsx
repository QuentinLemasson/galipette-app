/**
 * Application sidebar shell and navigation content.
 */

import { Sidebar, SidebarContent } from "@galipette/ui/components/sidebar";

import { WikiFileTree } from "../../features/wiki/components/WikiFileTree";

import { AppSidebarHeader } from "./AppSidebarHeader";

/**
 * @description Collapsible sidebar with branding and the compiled vault file tree.
 * @returns Sidebar element for use inside `SidebarProvider`.
 */
export function AppSidebar() {
  return (
    <Sidebar>
      <AppSidebarHeader />
      <SidebarContent>
        <WikiFileTree />
      </SidebarContent>
    </Sidebar>
  );
}
