import * as React from "react";

import { cn } from "@galipette/ui/lib/utils";

function Prose({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="prose"
      className={cn(
        "text-base leading-relaxed text-foreground",
        "[&_h1]:mb-2 [&_h1]:text-[1.75rem] [&_h1]:font-bold [&_h1]:tracking-tight",
        "[&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold",
        "[&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold",
        "[&_p]:mb-3 [&_p]:whitespace-pre-wrap [&_p:last-child]:mb-0",
        className,
      )}
      {...props}
    />
  );
}

function ProseParagraph({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="prose-paragraph"
      className={cn("mb-3 whitespace-pre-wrap last:mb-0", className)}
      {...props}
    />
  );
}

function ProseBreak({ className, ...props }: React.ComponentProps<"br">) {
  return <br data-slot="prose-break" className={className} {...props} />;
}

function ProseHr({ className, ...props }: React.ComponentProps<"hr">) {
  return (
    <hr
      data-slot="prose-hr"
      className={cn("my-5 border-0 border-t border-border", className)}
      {...props}
    />
  );
}

export { Prose, ProseBreak, ProseHr, ProseParagraph };
