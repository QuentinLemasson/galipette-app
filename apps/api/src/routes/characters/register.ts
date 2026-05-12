import type { OpenAPIHono } from "@hono/zod-openapi";
import {
  createCharacterRoute,
  deleteCharacterRoute,
  getCharacterRoute,
  listCharactersRoute,
  patchCharacterRoute,
} from "./definitions.js";
import {
  createCharacter,
  deleteCharacter,
  getCharacter,
  listCharacters,
  patchCharacter,
} from "./handlers.js";

export function registerCharacterRoutes(app: OpenAPIHono) {
  app.openapi(listCharactersRoute, listCharacters);
  app.openapi(getCharacterRoute, getCharacter);
  app.openapi(createCharacterRoute, createCharacter);
  app.openapi(patchCharacterRoute, patchCharacter);
  app.openapi(deleteCharacterRoute, deleteCharacter);
}
