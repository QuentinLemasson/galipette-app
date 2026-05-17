import { randomBytes } from "node:crypto";

/**
 * Create a random token.
 * @returns A random token.
 */
export const createToken = () => {
  return randomBytes(32).toString("hex");
};
