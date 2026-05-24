import { cva } from "class-variance-authority";

const treeNavLinkVariants = cva(
  "block truncate text-inherit no-underline hover:underline",
  {
    variants: {
      active: {
        true: "font-medium text-sidebar-primary no-underline",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export { treeNavLinkVariants };
