import * as React from "react";

import { cn } from "@galipette/ui/lib/utils";

function CodeBlock({ className, ...props }: React.ComponentProps<"pre">) {
  return (
    <pre
      data-slot="code-block"
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { CodeBlock };
