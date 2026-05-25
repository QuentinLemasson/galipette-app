/**
 * @fileoverview
 * Create an invite link for a new user.
 * @example
 * ```bash
 * npx tsx scripts/create-invite-link.ts 1
 * ```
 * @param expiresAt - Numbers of days until the invite token will expire.
 * @returns The invite token and URL.
 */

/** Load DATABASE_URL (same paths as the API — see apps/api/src/env.ts). */
import "../apps/api/src/env.js";

const { createInviteToken } = await import("../apps/api/src/repositories/invite-tokens.js");

const expiresAt = parseInt(process.argv[2]) || 1;
const invite = await createInviteToken(expiresAt);
console.log("");
console.log("Invite token:");
console.log(invite.token);

console.log("");
console.log("Invite URL:");
console.log(`http://localhost:5173/login?invite=${invite.token}`);
console.log(`https://galipette-app.up.railway.app/login?invite=${invite.token}`);
console.log("");
