import {
  apiErrorSchema,
  characterCreateSchema,
  characterPatchSchema,
  characterResponseSchema,
  idPathParamsSchema,
} from "@galipette/shared-schemas";
import { createRoute, z } from "@hono/zod-openapi";

export const listCharactersRoute = createRoute({
  method: "get",
  path: "/characters",
  tags: ["Characters"],
  summary: "List characters",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.array(characterResponseSchema),
        },
      },
    },
  },
});

export const getCharacterRoute = createRoute({
  method: "get",
  path: "/characters/{id}",
  tags: ["Characters"],
  summary: "Get a character",
  request: { params: idPathParamsSchema },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: characterResponseSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: apiErrorSchema } },
    },
  },
});

export const createCharacterRoute = createRoute({
  method: "post",
  path: "/characters",
  tags: ["Characters"],
  summary: "Create a character",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: characterCreateSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: { "application/json": { schema: characterResponseSchema } },
    },
  },
});

export const patchCharacterRoute = createRoute({
  method: "patch",
  path: "/characters/{id}",
  tags: ["Characters"],
  summary: "Update a character",
  request: {
    params: idPathParamsSchema,
    body: {
      required: true,
      content: { "application/json": { schema: characterPatchSchema } },
    },
  },
  responses: {
    200: {
      description: "OK",
      content: { "application/json": { schema: characterResponseSchema } },
    },
    400: {
      description: "Empty patch",
      content: { "application/json": { schema: apiErrorSchema } },
    },
    404: {
      description: "Not found",
      content: { "application/json": { schema: apiErrorSchema } },
    },
  },
});

export const deleteCharacterRoute = createRoute({
  method: "delete",
  path: "/characters/{id}",
  tags: ["Characters"],
  summary: "Delete a character",
  request: { params: idPathParamsSchema },
  responses: {
    204: { description: "Deleted" },
    404: {
      description: "Not found",
      content: { "application/json": { schema: apiErrorSchema } },
    },
  },
});
