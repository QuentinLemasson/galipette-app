/**
 * Validation schema for rule entities (shell plus empty `data` by default).
 */

import { createEntitySchema } from "./EntitySchema.js";

/** Zod schema instance registered under the `rule` type key. */
export const ruleSchema = createEntitySchema("rule");
