import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@galipette/ui/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-bold tracking-tight text-foreground",
      h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight text-foreground first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight text-foreground",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight text-foreground",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight text-foreground",
      h6: "scroll-m-20 text-base font-semibold tracking-tight text-foreground",
      body: "text-base leading-relaxed text-foreground",
      muted: "text-sm text-muted-foreground",
      overline:
        "text-xs font-semibold uppercase tracking-wider text-primary",
      mono: "font-mono text-xs text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

const variantTagMap = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body: "p",
  muted: "p",
  overline: "span",
  mono: "span",
} as const;

type TypographyProps = React.ComponentProps<"p"> &
  VariantProps<typeof typographyVariants> & {
    as?: keyof typeof variantTagMap;
  };

function Typography({ className, variant = "body", as, ...props }: TypographyProps) {
  const resolvedVariant = variant ?? "body";
  const Tag = (as ?? variantTagMap[resolvedVariant]) as React.ElementType;

  return (
    <Tag
      data-slot="typography"
      data-variant={resolvedVariant}
      className={cn(typographyVariants({ variant: resolvedVariant }), className)}
      {...props}
    />
  );
}

export { Typography, typographyVariants };
