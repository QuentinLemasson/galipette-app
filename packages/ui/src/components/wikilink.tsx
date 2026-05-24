import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@galipette/ui/lib/utils";

const wikilinkVariants = cva("underline underline-offset-2", {
  variants: {
    variant: {
      internal: "font-medium text-primary hover:text-foreground",
      external: "text-primary hover:text-foreground",
      broken:
        "cursor-pointer font-medium text-amber-700 decoration-wavy underline-offset-[3px] hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400",
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
