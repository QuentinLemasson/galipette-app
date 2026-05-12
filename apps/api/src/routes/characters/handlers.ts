import type { RouteHandler } from "@hono/zod-openapi";
import * as charactersRepo from "../../repositories/characters.js";
import { serializeCharacter } from "../../lib/serialize-character.js";
import {
  createCharacterRoute,
  deleteCharacterRoute,
  getCharacterRoute,
  listCharactersRoute,
  patchCharacterRoute,
} from "./definitions.js";

export const listCharacters: RouteHandler<typeof listCharactersRoute> = async (
  c,
) => {
  const rows = await charactersRepo.listCharactersWithSheet();
  return c.json(rows.map(serializeCharacter), 200);
};

export const getCharacter: RouteHandler<typeof getCharacterRoute> = async (
  c,
) => {
  const { id } = c.req.valid("param");
  const row = await charactersRepo.findCharacterWithSheetById(id);
  if (!row) {
    return c.json({ error: "Character not found" }, 404);
  }
  return c.json(serializeCharacter(row), 200);
};

export const createCharacter: RouteHandler<
  typeof createCharacterRoute
> = async (c) => {
  const body = c.req.valid("json");
  const row = await charactersRepo.createCharacterWithSheet(body);
  return c.json(serializeCharacter(row), 201);
};

export const patchCharacter: RouteHandler<
  typeof patchCharacterRoute
> = async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");
  const result = await charactersRepo.patchCharacterWithSheet(id, body);
  if (result.kind === "empty_patch") {
    return c.json({ error: "No fields to update" }, 400);
  }
  if (result.kind === "not_found") {
    return c.json({ error: "Character not found" }, 404);
  }
  return c.json(serializeCharacter(result.row), 200);
};

export const deleteCharacter: RouteHandler<
  typeof deleteCharacterRoute
> = async (c) => {
  const { id } = c.req.valid("param");
  const outcome = await charactersRepo.deleteCharacterById(id);
  if (outcome === "not_found") {
    return c.json({ error: "Character not found" }, 404);
  }
  return c.newResponse(null, 204);
};
