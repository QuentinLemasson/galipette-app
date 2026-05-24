import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@galipette/ui/lib/utils";

const wikilinkVariants = cva("underline underline-offset-2 transition-colors", {
  variants: {
    variant: {
      internal:
        "font-medium text-wiki-accent decoration-wiki-accent/40 hover:text-wiki-accent/80 hover:decoration-wiki-accent",
      external: "text-wiki-accent decoration-wiki-accent/40 hover:text-wiki-accent/80",
      broken:
        "cursor-pointer font-medium text-wiki-broken decoration-wavy decoration-wiki-broken/60 underline-offset-[3px] hover:text-wiki-broken/80",
    },
  },
  defaultVariants: {
    variant: "internal",
  },
});

type WikilinkProps = React.ComponentProps<"a"> &
  VariantProps<typeof wikilinkVariants> & {
    asChild?: boolean;
  };

function Wikilink({
  className,
  variant = "internal",
  asChild = false,
  ...props
}: WikilinkProps) {
  const Comp = asChild ? Slot.Root : "a";

  return (
    <Comp
      data-slot="wikilink"
      data-variant={variant}
      className={cn(wikilinkVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Wikilink, wikilinkVariants };
