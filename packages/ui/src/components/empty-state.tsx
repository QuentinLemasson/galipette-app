import * as React from "react";

import { cn } from "@galipette/ui/lib/utils";

function EmptyState({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-state"
      className={cn("text-sm italic text-muted-foreground", className)}
      {...props}
    />
  );
}

export { EmptyState };
