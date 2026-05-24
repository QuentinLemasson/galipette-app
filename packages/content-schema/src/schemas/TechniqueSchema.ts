/**
 * Validation schema for technique entities (shell plus empty `data` by default).
 */

import { createEntitySchema } from "./EntitySchema.js";

/** Zod schema instance registered under the `technique` type key. */
export const techniqueSchema = createEntitySchema("technique");
