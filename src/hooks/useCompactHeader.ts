import { useEffect, useState } from 'react';

const getScrollTop = (target?: EventTarget | null) => {
  if (target instanceof Document) {
    return window.scrollY || target.documentElement.scrollTop || target.body.scrollTop || 0;
  }

  if (target instanceof Window) {
    return target.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
  }

  if (target instanceof HTMLElement) {
    return target.scrollTop;
  }

  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
};

export const useCompactHeader = (enabled = true, threshold = 24) => {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setCompact(false);
      return;
    }

    const updateCompactState = (event?: Event) => {
      setCompact(getScrollTop(event?.target) > threshold);
    };

    updateCompactState();
    window.addEventListener('scroll', updateCompactState, true);
    return () => window.removeEventListener('scroll', updateCompactState, true);
  }, [enabled, threshold]);

  return compact;
};
