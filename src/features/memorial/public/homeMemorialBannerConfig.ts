import {
  ELDER_GEOFFREY_MEMORIAL_API_SLUG,
  createMemorialPublicRoute,
} from "../../../api/memorialPublic";

export const HOME_MEMORIAL_BANNER_ENABLED = true;
export const HOME_MEMORIAL_BANNER_API_SLUG = ELDER_GEOFFREY_MEMORIAL_API_SLUG;
export const HOME_MEMORIAL_BANNER_ROUTE = createMemorialPublicRoute(HOME_MEMORIAL_BANNER_API_SLUG);