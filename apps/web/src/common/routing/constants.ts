/**
 * Shared route-related constants for the web app shell and feature routes.
 */

/** Authenticated app shell (session required via {@link appRoute} `beforeLoad`). */
export const APP_ROUTE_PREFIX = "/app";

/**
 * Wiki entity detail routes: `/app/wiki/<path>` where `<path>` is the compiled slug
 * without the vault `wiki/` namespace segment.
 */
export const ENTITY_ROUTE_PREFIX = `${APP_ROUTE_PREFIX}/wiki`;

/** Dedicated “not found” page used for unresolved wikilinks (search params carry context). */
export const NOT_FOUND_ROUTE = "/not-found";
