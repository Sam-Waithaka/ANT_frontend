export const memorialQueryKeys = (slug: string) => ({
  assets: ['memorial', slug, 'assets'] as const,
  moderation: ['memorial', slug, 'moderation'] as const,
  writeups: ['memorial', slug, 'writeups'] as const,
});
