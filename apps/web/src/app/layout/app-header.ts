/**
 * Shared shell header sizing for the main pane and sidebar branding row.
 */

/** Tailwind height token used by both {@link AppMainHeader} and {@link AppSidebarHeader}. */
export const APP_HEADER_HEIGHT_CLASS = "h-14";

/** Base flex row shared by app chrome headers (height + vertical alignment). */
export const appShellHeaderRowClassName = `flex ${APP_HEADER_HEIGHT_CLASS} shrink-0 items-center`;
