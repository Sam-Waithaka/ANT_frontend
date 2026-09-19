import { useContext } from 'react';
import { MemorialPortalContext } from './MemorialPortalStore';

export const useMemorialPortal = () => {
  const context = useContext(MemorialPortalContext);
  if (!context) throw new Error('useMemorialPortal must be used inside MemorialPortalProvider.');
  return context;
};

