import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type WritingStudioEditorLayoutProps = {
  center: ReactNode;
  floatingActions?: ReactNode;
  leftPanel?: ReactNode;
  mobilePanel?: ReactNode;
  publishingPanel?: ReactNode;
  rightPanel?: ReactNode;
};

const WritingStudioEditorLayout = ({
  center,
  floatingActions,
  leftPanel,
  mobilePanel,
  publishingPanel,
  rightPanel,
}: WritingStudioEditorLayoutProps) => {
  const [floatingActionLift, setFloatingActionLift] = useState(0);

  useEffect(() => {
    if (!floatingActions) return undefined;

    const footer = document.querySelector('[data-site-footer="true"]');
    const baseOffset = 16;
    const footerGap = 16;

    if (!footer) {
      setFloatingActionLift(0);
      return undefined;
    }

    let frame = 0;
    const updateFloatingActionOffset = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = footer.getBoundingClientRect();
        const nextLift = rect.bottom > 0 ? Math.max(0, window.innerHeight - baseOffset - rect.top + footerGap) : 0;
        setFloatingActionLift((current) => Math.abs(current - nextLift) < 3 ? current : Math.ceil(nextLift));
      });
    };

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(updateFloatingActionOffset, {
        root: null,
        threshold: [0, 0.05, 0.1, 0.25, 0.5, 1],
      });
      observer.observe(footer);
    }

    updateFloatingActionOffset();
    window.addEventListener('scroll', updateFloatingActionOffset, { passive: true });
    window.addEventListener('resize', updateFloatingActionOffset);

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', updateFloatingActionOffset);
      window.removeEventListener('resize', updateFloatingActionOffset);
    };
  }, [floatingActions]);

  return (
    <>
      <div className={`grid gap-6 pb-28 lg:gap-8 ${publishingPanel ? 'xl:grid-cols-[17rem_minmax(0,1fr)_17rem_23rem]' : 'xl:grid-cols-[17rem_minmax(0,1fr)_17rem]'}`}>
        {leftPanel ? <div className="hidden xl:block">{leftPanel}</div> : null}
        <section className="min-w-0">{center}</section>
        {rightPanel ? <div className="hidden xl:block">{rightPanel}</div> : null}
        {mobilePanel ? <div className="xl:hidden">{mobilePanel}</div> : null}
        {publishingPanel ? <div className="hidden xl:block">{publishingPanel}</div> : null}
      </div>

      {floatingActions ? (
        <div
          className="pointer-events-none fixed inset-x-0 bottom-4 z-30 px-4 transition-transform duration-200 ease-out will-change-transform"
          style={{ transform: `translate3d(0, -${floatingActionLift}px, 0)` }}
        >
          {floatingActions}
        </div>
      ) : null}
    </>
  );
};

export default WritingStudioEditorLayout;
