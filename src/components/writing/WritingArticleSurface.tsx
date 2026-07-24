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
    ? "border-white/10 bg-[#0d0c0b] text-stone-100 shadow-[0_22px_60px_rgba(0,0,0,0.42)]"
    : "border-[#eaded0]/80 bg-[#fbf3e8]/75 text-zinc-950 shadow-[0_18px_48px_rgba(70,45,20,0.07)]";

export const getWritingArticlePaperClass = (darkMode: boolean) =>
  darkMode
    ? "editor-paper-surface editor-paper-surface-dark border-white/10 bg-[#181512] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),inset_0_0_70px_rgba(0,0,0,0.24),0_16px_38px_rgba(0,0,0,0.36)]"
    : "editor-paper-surface editor-paper-surface-light border-[#e6d8c8]/80 bg-[#fffdf7] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),inset_0_0_64px_rgba(120,72,24,0.032),0_12px_32px_rgba(70,45,20,0.065)]";

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
    className={`overflow-visible rounded-2xl border ${getWritingArticleShellClass(darkMode)} ${className}`}
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