import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { portalSurface } from '../../../../components/portal/portalSurface';
import type { ModerationObject } from '../types';
import { approvalLabel } from '../utils/presentation';

export const MemorialCard = ({ children, className = '', darkMode }: { children: ReactNode; className?: string; darkMode: boolean }) => (
  <section className={`rounded-3xl border p-5 shadow-lg sm:p-6 ${portalSurface.panel(darkMode)} ${className}`}>{children}</section>
);

export const MemorialField = ({ label, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) => {
  const darkMode = document.documentElement.classList.contains('dark');
  return (
    <label className="grid gap-2 text-sm font-bold">
      <span>{label}</span>
      <input {...props} className={`min-h-12 rounded-2xl border px-4 py-3 outline-none focus:ring-4 focus:ring-red-800/20 ${portalSurface.input(darkMode)} ${props.className ?? ''}`} />
      {hint ? <span className={`text-xs font-normal ${portalSurface.softMutedText(darkMode)}`}>{hint}</span> : null}
    </label>
  );
};

export const MemorialTextarea = ({ label, hint, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) => {
  const darkMode = document.documentElement.classList.contains('dark');
  return (
    <label className="grid gap-2 text-sm font-bold">
      <span>{label}</span>
      <textarea {...props} className={`min-h-28 rounded-2xl border px-4 py-3 outline-none focus:ring-4 focus:ring-red-800/20 ${portalSurface.input(darkMode)} ${props.className ?? ''}`} />
      {hint ? <span className={`text-xs font-normal ${portalSurface.softMutedText(darkMode)}`}>{hint}</span> : null}
    </label>
  );
};

export const MemorialButton = ({ children, tone = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'secondary' | 'danger' }) => {
  const tones = {
    danger: 'border border-red-800/30 bg-transparent text-red-800 hover:bg-red-800/10 dark:text-red-200',
    primary: 'bg-red-800 text-white hover:bg-red-700',
    secondary: 'border border-[#d8cbbd] bg-white text-zinc-900 hover:bg-[#fffaf0] dark:border-white/10 dark:bg-white/5 dark:text-stone-100 dark:hover:bg-white/10',
  };
  return <button {...props} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-black transition focus:outline-none focus:ring-2 focus:ring-red-700 disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${props.className ?? ''}`}>{children}</button>;
};

export const ApprovalBadge = ({ item }: { item: ModerationObject }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${item.is_approved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200'}`}>
    {approvalLabel(item)}
  </span>
);

export const MemorialError = ({ children }: { children: ReactNode }) => (
  <div className="rounded-2xl border border-red-800/20 bg-red-50 p-4 text-sm font-bold text-red-900 dark:bg-red-950/30 dark:text-red-100" role="alert">{children}</div>
);

