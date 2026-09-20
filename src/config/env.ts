const FALLBACK_SITE_BASE_URL = 'https://aicnjoro.org';
const FALLBACK_API_BASE_URL = 'https://api.aicnjoro.org';

const trimTrailingSlash = (value: string) => value.trim().replace(/\/+$/, '');

const normalizeConfiguredBaseUrl = (value: string | undefined) => {
  if (!value?.trim()) {
    return undefined;
  }

  const normalizedUrl = trimTrailingSlash(value);
  return normalizedUrl || undefined;
};

const getEnvValue = (key: string) => {
  const env = import.meta.env as ImportMeta['env'] & Record<string, string | undefined>;
  return env[key];
};

export const getSiteBaseUrl = () => {
  const configuredUrl = normalizeConfiguredBaseUrl(getEnvValue('VITE_SITE_BASE_URL'));

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return FALLBACK_SITE_BASE_URL;
};

export const getApiBaseUrl = () => {
  const configuredUrl = normalizeConfiguredBaseUrl(getEnvValue('VITE_API_BASE_URL'));

  if (import.meta.env.DEV) {
    return '';
  }

  if (configuredUrl) {
    return configuredUrl;
  }

  return FALLBACK_API_BASE_URL;
};
