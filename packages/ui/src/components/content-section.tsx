import * as React from "react";

import { Typography } from "@galipette/ui/components/typography";
import { cn } from "@galipette/ui/lib/utils";

type ContentSectionProps = React.ComponentProps<"section"> & {
  title: string;
};

function ContentSection({ title, className, children, ...props }: ContentSectionProps) {
  return (
    <section
      data-slot="content-section"
      className={cn("flex flex-col gap-2 border-t border-border pt-4", className)}
      {...props}
    >
      <Typography variant="h3" as="h3">
        {title}
      </Typography>
      {children}
    </section>
  );
}

export { ContentSection };
