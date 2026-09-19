import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError } from '../../../../services/apiClient';
import { useAuth } from '../../../../hooks/useAuth';
import { fetchMemorialWriteups, fetchModerationWorkspace, fetchPortalMemorials } from '../api/memorialPortalApi';
import { getMemorialPortalRoutes } from '../config';
import type { ModerationWorkspace, PortalMemorialSummary, PortalWriteupIndex } from '../types';
import { MemorialPortalContext, type MemorialPortalState } from './MemorialPortalStore';

const errorMessage = (error: unknown) => error instanceof Error ? error.message : 'The memorial workspace could not be loaded.';

export const MemorialPortalProvider = ({ children, slug }: { children: ReactNode; slug: string }) => {
  const { accessToken } = useAuth();
  const [memorial, setMemorial] = useState<PortalMemorialSummary | null>(null);
  const [writeups, setWriteups] = useState<PortalWriteupIndex | null>(null);
  const [moderation, setModeration] = useState<ModerationWorkspace | null>(null);
  const [moderationForbidden, setModerationForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWriteups = useCallback(async () => {
    if (!accessToken) return;
    setWriteups(await fetchMemorialWriteups(accessToken, slug));
  }, [accessToken, slug]);

  const refreshModeration = useCallback(async () => {
    if (!accessToken) return;
    try {
      setModeration(await fetchModerationWorkspace(accessToken, slug));
      setModerationForbidden(false);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 403) {
        setModeration(null);
        setModerationForbidden(true);
        return;
      }
      throw requestError;
    }
  }, [accessToken, slug]);

  const refresh = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const discovery = await fetchPortalMemorials(accessToken);
      const discoveredMemorial = discovery.memorials.find((item) => item.slug === slug) ?? null;
      setMemorial(discoveredMemorial);
      if (!discoveredMemorial) {
        setWriteups(null);
        setModeration(null);
        throw new Error('This memorial is not available to your account. Return to Memorials and choose an available page.');
      }
      await Promise.all([refreshWriteups(), refreshModeration()]);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [accessToken, refreshModeration, refreshWriteups, slug]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const processing = moderation?.media.some((item) => item.processing.code === 'pending' || item.processing.code === 'processing') ?? false;
  useEffect(() => {
    if (!processing) return undefined;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      void refreshModeration();
      if (attempts >= 24) window.clearInterval(timer);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [processing, refreshModeration]);

  const value = useMemo<MemorialPortalState>(() => ({
    error,
    loading,
    memorial,
    moderation,
    moderationForbidden,
    refresh,
    refreshModeration,
    refreshWriteups,
    routes: getMemorialPortalRoutes(slug),
    setModeration,
    setWriteups,
    slug,
    writeups,
  }), [error, loading, memorial, moderation, moderationForbidden, refresh, refreshModeration, refreshWriteups, slug, writeups]);

  return <MemorialPortalContext.Provider value={value}>{children}</MemorialPortalContext.Provider>;
};
