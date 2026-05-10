/**
 * Shell layout: top bar, sidebar with navigation, main outlet.
 */

import { Link, Outlet } from "@tanstack/react-router";
import { NavigationTree } from "./NavigationTree";

/**
 * @description Renders the application chrome (header + sidebar) and an
 *   `<Outlet>` for the active child route.
 * @returns Layout element wrapping the current page.
 */
export function AppLayout() {
  return (
    <div className="app-layout">
      <header className="app-layout__header">
        <Link to="/" className="app-layout__brand">
          Galipette App
        </Link>
        <span className="app-layout__subtitle">Compiled content explorer</span>
      </header>

      <div className="app-layout__body">
        <aside className="app-layout__sidebar">
          <NavigationTree />
        </aside>

        <main className="app-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
