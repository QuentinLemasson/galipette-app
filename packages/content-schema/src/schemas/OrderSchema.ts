/**
 * Validation schema for order entities (shell plus empty `data` by default).
 */

import { createEntitySchema } from "./EntitySchema.js";

/** Zod schema instance registered under the `order` type key. */
export const orderSchema = createEntitySchema("order");
