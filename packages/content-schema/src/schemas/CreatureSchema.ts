/**
 * Validation schema for creature entities (shell plus empty `data` by default).
 */

import { createEntitySchema } from "./EntitySchema.js";

/** Zod schema instance registered under the `creature` type key. */
export const creatureSchema = createEntitySchema("creature");
