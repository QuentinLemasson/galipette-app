/**
 * Main content area header (trigger, title, top nav links).
 */

import { SidebarTrigger } from "@galipette/ui/components/sidebar";
import { Link } from "@tanstack/react-router";

/**
 * @description Top bar above the routed page outlet inside `SidebarInset`.
 * @returns Header element for the main pane.
 */
export function AppMainHeader() {
  return (
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
  );
}
