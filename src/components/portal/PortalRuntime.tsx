import type { ReactNode } from 'react';
import { PortalToastProvider } from './PortalToast';

const PortalRuntime = ({ children }: { children: ReactNode }) => (
  <PortalToastProvider>{children}</PortalToastProvider>
);

export default PortalRuntime;
