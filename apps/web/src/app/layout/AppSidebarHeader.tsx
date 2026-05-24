/**
 * Sidebar branding header (avatar + app title).
 */

import { Avatar, AvatarFallback, AvatarImage } from "@galipette/ui/components/avatar";
import { SidebarHeader } from "@galipette/ui/components/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@galipette/ui/components/tooltip";
import { cn } from "@galipette/ui/lib/utils";

import { useSession } from "../auth/useSession.hook";
import { userInitials } from "../auth/user-display";

import { appShellHeaderRowClassName } from "./app-header";

/**
 * @description Renders the signed-in user at the top of the app sidebar (Discord avatar + name).
 * @returns Sidebar header element.
 */
export function AppSidebarHeader() {
  const { data: session, isPending } = useSession();
  const user = session?.user;
  const displayName = user?.name ?? "Galipette";
  const subtitle = user ? "Signed in" : "Explorer";
  const initials = userInitials(displayName);

  const avatar = (
    <Avatar className="size-8 shrink-0">
      {user?.image ? <AvatarImage src={user.image} alt={displayName} /> : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );

  return (
    <SidebarHeader
      className={cn(
        appShellHeaderRowClassName,
        "flex flex-row items-center justify-start",
        "gap-2 border-b border-sidebar-border px-3 py-0",
        "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
      )}
    >
      {user ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex shrink-0">{avatar}</span>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            {displayName}
          </TooltipContent>
        </Tooltip>
      ) : (
        avatar
      )}
      <div
        className={cn(
          "min-w-0 flex-1",
          "group-data-[collapsible=icon]:hidden",
          isPending && "animate-pulse",
        )}
      >
        <p className="truncate text-sm font-semibold text-sidebar-foreground">{displayName}</p>
        <p className="truncate text-xs text-sidebar-foreground/70">{subtitle}</p>
      </div>
    </SidebarHeader>
  );
}
