import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

type PortalToastTone = 'error' | 'info' | 'success' | 'warning';

type PortalToastItem = {
  id: number;
  message: string;
  tone: PortalToastTone;
};

type PortalToastInput = {
  durationMs?: number;
  message: string;
  tone?: PortalToastTone;
};

type PortalToastContextValue = {
  dismiss: (id?: number) => void;
  error: (message: string, durationMs?: number) => void;
  info: (message: string, durationMs?: number) => void;
  show: (toast: PortalToastInput) => void;
  success: (message: string, durationMs?: number) => void;
  warning: (message: string, durationMs?: number) => void;
};

const PortalToastContext = createContext<PortalToastContextValue | null>(null);

const readableDuration = (message: string, durationMs?: number) => {
  if (durationMs !== undefined) return durationMs;
  const words = message.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(9000, Math.max(4200, 2200 + words * 260));
};

const noopToast: PortalToastContextValue = {
  dismiss: () => undefined,
  error: () => undefined,
  info: () => undefined,
  show: () => undefined,
  success: () => undefined,
  warning: () => undefined,
};

export const usePortalToast = () => useContext(PortalToastContext) || noopToast;

export const PortalToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<PortalToastItem[]>([]);
  const timers = useRef(new Map<number, number>());
  const nextId = useRef(1);

  const dismiss = useCallback((id?: number) => {
    setToasts((current) => {
      const removed = id === undefined ? current : current.filter((toast) => toast.id === id);
      removed.forEach((toast) => {
        const timer = timers.current.get(toast.id);
        if (timer) window.clearTimeout(timer);
        timers.current.delete(toast.id);
      });
      return id === undefined ? [] : current.filter((toast) => toast.id !== id);
    });
  }, []);

  const show = useCallback(({ durationMs, message, tone = 'info' }: PortalToastInput) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const id = nextId.current;
    nextId.current += 1;
    const toast = { id, message: trimmed, tone };

    setToasts([toast]);
    const timer = window.setTimeout(() => dismiss(id), readableDuration(trimmed, durationMs));
    timers.current.set(id, timer);
  }, [dismiss]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  useEffect(() => {
    if (!toasts.length) return undefined;

    const dismissOnOutsideAction = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[data-portal-toast="true"]')) return;
      dismiss();
    };

    window.addEventListener('pointerdown', dismissOnOutsideAction, { capture: true });
    return () => window.removeEventListener('pointerdown', dismissOnOutsideAction, { capture: true });
  }, [dismiss, toasts.length]);

  const value = useMemo<PortalToastContextValue>(() => ({
    dismiss,
    error: (message, durationMs) => show({ durationMs, message, tone: 'error' }),
    info: (message, durationMs) => show({ durationMs, message, tone: 'info' }),
    show,
    success: (message, durationMs) => show({ durationMs, message, tone: 'success' }),
    warning: (message, durationMs) => show({ durationMs, message, tone: 'warning' }),
  }), [dismiss, show]);

  return (
    <PortalToastContext.Provider value={value}>
      {children}
      <PortalToastViewport dismiss={dismiss} toasts={toasts} />
    </PortalToastContext.Provider>
  );
};

const toneIcon = (tone: PortalToastTone) => {
  if (tone === 'success') return <CheckCircle2 size={17} />;
  if (tone === 'warning' || tone === 'error') return <TriangleAlert size={17} />;
  return <Info size={17} />;
};

const PortalToastViewport = ({ dismiss, toasts }: { dismiss: (id?: number) => void; toasts: PortalToastItem[] }) => {
  const { darkMode } = useTheme();
  if (!toasts.length) return null;

  const shellClass = darkMode
    ? 'border-white/10 bg-zinc-950/95 text-stone-100 shadow-black/40'
    : 'border-[#eaded0] bg-white/95 text-zinc-950 shadow-zinc-900/15';
  const toneClass: Record<PortalToastTone, string> = {
    error: 'text-red-700 dark:text-red-300',
    info: 'text-zinc-700 dark:text-stone-300',
    success: 'text-emerald-700 dark:text-emerald-300',
    warning: 'text-amber-700 dark:text-amber-300',
  };

  return (
    <div aria-live="assertive" className="pointer-events-none fixed inset-x-0 bottom-28 z-50 flex justify-center px-4 sm:bottom-24">
      <div className="grid w-full max-w-2xl gap-3">
        {toasts.map((toast) => (
          <div
            className={
              'pointer-events-auto flex items-start gap-3 rounded-[1.35rem] border px-4 py-3 text-sm font-bold shadow-2xl backdrop-blur-xl ' + shellClass
            }
            data-portal-toast="true"
            key={toast.id}
            role={toast.tone === 'error' || toast.tone === 'warning' ? 'alert' : 'status'}
          >
            <span className={'mt-0.5 shrink-0 ' + toneClass[toast.tone]}>{toneIcon(toast.tone)}</span>
            <p className="min-w-0 flex-1 break-words leading-6 [overflow-wrap:anywhere]">{toast.message}</p>
            <button
              aria-label="Dismiss notification"
              className={darkMode ? 'grid size-7 shrink-0 place-items-center rounded-full text-stone-400 hover:bg-white/10 hover:text-stone-100' : 'grid size-7 shrink-0 place-items-center rounded-full text-[#786f66] hover:bg-red-950/5 hover:text-zinc-950'}
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
