import * as React from "react";

import { cn } from "@galipette/ui/lib/utils";

function Article({ className, ...props }: React.ComponentProps<"article">) {
  return (
    <article
      data-slot="article"
      className={cn("flex max-w-3xl flex-col gap-6", className)}
      {...props}
    />
  );
}

export { Article };
