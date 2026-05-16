import { useEffect, useRef, useState } from 'react';

const getWindowScrollTop = () => window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

const getEventScrollTop = (target?: EventTarget | null) => {
  if (target instanceof HTMLElement) return target.scrollTop;
  if (target instanceof Document || target instanceof Window) return getWindowScrollTop();
  return getWindowScrollTop();
};

type CompactHeaderOptions = {
  collapseAfter?: number;
  expandBefore?: number;
  observeNestedScroll?: boolean;
};

export const getNextCompactHeaderState = ({
  collapseAfter,
  current,
  expandBefore,
  scrollTop,
}: {
  collapseAfter: number;
  current: boolean;
  expandBefore: number;
  scrollTop: number;
}) => {
  if (!current && scrollTop >= collapseAfter) return true;
  if (current && scrollTop <= expandBefore) return false;
  return current;
};

export const useCompactHeader = (
  enabled = true,
  {
    collapseAfter = 96,
    expandBefore = 24,
    observeNestedScroll = false,
  }: CompactHeaderOptions = {},
) => {
  const [compact, setCompact] = useState(false);
  const compactRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const nextScrollTopRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      compactRef.current = false;
      setCompact(false);
      return;
    }

    const updateCompactState = () => {
      frameRef.current = null;
      const nextCompact = getNextCompactHeaderState({
        collapseAfter,
        current: compactRef.current,
        expandBefore,
        scrollTop: nextScrollTopRef.current,
      });

      if (nextCompact !== compactRef.current) {
        compactRef.current = nextCompact;
        setCompact(nextCompact);
      }
    };

    const scheduleUpdate = (event?: Event) => {
      nextScrollTopRef.current = observeNestedScroll ? getEventScrollTop(event?.target) : getWindowScrollTop();

      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(updateCompactState);
      }
    };

    nextScrollTopRef.current = getWindowScrollTop();
    updateCompactState();
    window.addEventListener('scroll', scheduleUpdate, { capture: observeNestedScroll, passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('scroll', scheduleUpdate, { capture: observeNestedScroll });
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, [collapseAfter, enabled, expandBefore, observeNestedScroll]);

  return compact;
};
