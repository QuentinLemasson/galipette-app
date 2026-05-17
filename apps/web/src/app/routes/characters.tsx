/**
 * Character roster + sheet routes (backed by `apps/api`).
 */

import { createRoute } from "@tanstack/react-router";

import { CharacterListPage } from "../../features/character/pages/CharacterListPage";
import { CharacterSheetRoutePage } from "../../features/character/pages/CharacterSheetRoutePage";

import { appRoute } from "./app";

/** `/characters/:characterId` — register before the static `/characters` path. */
export const characterSheetRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "characters/$characterId",
  component: CharacterSheetRoutePage,
});

/** `/characters` — list from API. */
export const characterListRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "characters",
  component: CharacterListPage,
});
