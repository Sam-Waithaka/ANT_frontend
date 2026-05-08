const FALLBACK_SITE_BASE_URL = 'https://aicnjoro.org';
const FALLBACK_API_BASE_URL = 'https://api.aicnjoro.org';

const trimTrailingSlash = (value: string) => value.trim().replace(/\/+$/, '');

const getEnvValue = (key: string) => {
  const env = import.meta.env as ImportMeta['env'] & Record<string, string | undefined>;
  return env[key];
};

export const getSiteBaseUrl = () => {
  const configuredUrl = getEnvValue('VITE_SITE_BASE_URL');

  if (configuredUrl?.trim()) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return FALLBACK_SITE_BASE_URL;
};

export const getApiBaseUrl = () => {
  const configuredUrl = getEnvValue('VITE_API_BASE_URL');

  if (configuredUrl !== undefined) {
    return trimTrailingSlash(configuredUrl);
  }

  return import.meta.env.DEV ? '' : FALLBACK_API_BASE_URL;
};
