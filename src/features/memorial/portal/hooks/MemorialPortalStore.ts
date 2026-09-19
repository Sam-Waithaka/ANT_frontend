import { createContext } from 'react';
import type { ModerationWorkspace, PortalMemorialSummary, PortalWriteupIndex } from '../types';
import type { getMemorialPortalRoutes } from '../config';

export type MemorialPortalState = {
  error: string | null;
  loading: boolean;
  memorial: PortalMemorialSummary | null;
  moderation: ModerationWorkspace | null;
  moderationForbidden: boolean;
  refresh: () => Promise<void>;
  refreshModeration: () => Promise<void>;
  refreshWriteups: () => Promise<void>;
  routes: ReturnType<typeof getMemorialPortalRoutes>;
  setModeration: (workspace: ModerationWorkspace | null) => void;
  setWriteups: (writeups: PortalWriteupIndex | null) => void;
  slug: string;
  writeups: PortalWriteupIndex | null;
};

export const MemorialPortalContext = createContext<MemorialPortalState | null>(null);
