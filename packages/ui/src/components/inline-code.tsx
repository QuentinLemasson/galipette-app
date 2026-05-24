import * as React from "react";

import { cn } from "@galipette/ui/lib/utils";

function InlineCode({ className, ...props }: React.ComponentProps<"code">) {
  return (
    <code
      data-slot="inline-code"
      className={cn("font-mono text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export { InlineCode };
