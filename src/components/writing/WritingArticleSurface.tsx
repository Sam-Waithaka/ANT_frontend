import type { ReactNode } from "react";

type WritingArticleSurfaceProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  darkMode: boolean;
  footer?: ReactNode;
  labelledBy?: string;
};

export const getWritingArticleShellClass = (darkMode: boolean) =>
  darkMode
    ? "border-white/10 bg-[#0f0e0d] text-stone-100 shadow-[0_28px_80px_rgba(0,0,0,0.58)]"
    : "border-[#eaded0] bg-[#fbf3e8] text-zinc-950 shadow-[0_24px_70px_rgba(70,45,20,0.10)]";

export const getWritingArticlePaperClass = (darkMode: boolean) =>
  darkMode
    ? "editor-paper-surface editor-paper-surface-dark border-white/15 bg-[#181512] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_90px_rgba(0,0,0,0.32),0_22px_55px_rgba(0,0,0,0.55)]"
    : "editor-paper-surface editor-paper-surface-light border-[#e6d8c8] bg-[#fffdf7] shadow-[inset_0_1px_0_rgba(255,255,255,0.75),inset_0_0_80px_rgba(120,72,24,0.045),0_18px_45px_rgba(70,45,20,0.10)]";

const WritingArticleSurface = ({
  ariaLabel,
  children,
  className = "",
  contentClassName = "",
  darkMode,
  footer,
  labelledBy,
}: WritingArticleSurfaceProps) => (
  <section
    aria-label={ariaLabel}
    aria-labelledby={labelledBy}
    className={`overflow-visible rounded-2xl border shadow-lg ${getWritingArticleShellClass(darkMode)} ${className}`}
  >
    <div
      className={`relative m-3 min-h-[55vh] rounded-[1.5rem] border px-5 py-6 sm:m-4 sm:px-8 sm:py-8 lg:min-h-96 ${getWritingArticlePaperClass(darkMode)} ${contentClassName}`}
    >
      {children}
    </div>
    {footer}
  </section>
);

export default WritingArticleSurface;