/** Minimal adapter surface used by Better Auth for OAuth account lookup. */
export type OAuthAccountLookup = {
  findAccountByProviderId: (
    providerAccountId: string,
    providerId: string,
  ) => Promise<{ userId: string | number } | null>;
};

export async function isExistingOAuthAccount(
  adapter: OAuthAccountLookup,
  providerId: string,
  providerAccountId: string,
): Promise<boolean> {
  const account = await adapter.findAccountByProviderId(providerAccountId, providerId);
  return account != null;
}
