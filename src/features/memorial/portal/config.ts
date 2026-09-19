export const MEMORIAL_PORTAL_ROOT = '/portal/memorials';
export const MEMORIAL_DISCOVERY_API = '/v1/memorials/portal/';

export const memorialApiRoot = (slug: string) =>
  `/v1/memorials/portal/${encodeURIComponent(slug)}`;

export const getMemorialPortalRoutes = (slug: string) => {
  const root = `${MEMORIAL_PORTAL_ROOT}/${encodeURIComponent(slug)}`;
  return {
    arrangements: `${root}/arrangements`,
    media: `${root}/media`,
    overview: `${root}/overview`,
    page: `${root}/page`,
    review: `${root}/review`,
    root,
    timeline: `${root}/timeline`,
    tributes: `${root}/tributes`,
    writing: `${root}/writing`,
  } as const;
};
