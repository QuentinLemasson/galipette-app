/**
 * Validation schema for affliction entities (shell plus empty `data` by default).
 */

import { createEntitySchema } from "./EntitySchema.js";

/** Zod schema instance registered under the `affliction` type key. */
export const afflictionSchema = createEntitySchema("affliction");
