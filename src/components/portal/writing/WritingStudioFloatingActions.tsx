import type { ReactNode } from 'react';
import { useTheme } from '../../../hooks/useTheme';

export type WritingStudioFloatingActionVariant = 'accent' | 'primary' | 'secondary';

export type WritingStudioFloatingAction = {
  ariaLabel: string;
  disabled?: boolean;
  icon?: ReactNode;
  label: ReactNode;
  onClick: () => void;
  variant?: WritingStudioFloatingActionVariant;
};

type WritingStudioFloatingActionsProps = {
  actions: WritingStudioFloatingAction[];
};

const buttonClass = (darkMode: boolean, variant: WritingStudioFloatingActionVariant) => {
  if (variant === 'primary') {
    return 'bg-red-800 px-5 text-white shadow-lg shadow-red-950/20 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50';
  }

  if (variant === 'accent') {
    return darkMode
      ? 'border border-white/15 bg-white/10 px-4 text-stone-100 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40'
      : 'border border-red-900/25 bg-white/80 px-4 text-red-800 hover:bg-red-950/5 disabled:cursor-not-allowed disabled:opacity-40';
  }

  return darkMode
    ? 'border border-white/15 bg-white/10 px-4 text-stone-100 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40'
    : 'border border-[#eaded0] bg-white/70 px-4 text-zinc-700 hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40';
};

const WritingStudioFloatingActions = ({ actions }: WritingStudioFloatingActionsProps) => {
  const { darkMode } = useTheme();

  if (!actions.length) return null;

  return (
    <div className={'pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-2 rounded-[2rem] border p-2 shadow-2xl backdrop-blur-xl ' + (darkMode ? 'border-white/10 bg-zinc-950/90 shadow-black/40' : 'border-[#eaded0] bg-white/80 shadow-zinc-900/15')}>
      {actions.map((action) => (
        <button
          aria-label={action.ariaLabel}
          className={'inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-sm font-bold transition ' + buttonClass(darkMode, action.variant || 'secondary')}
          disabled={action.disabled}
          key={action.ariaLabel}
          onClick={action.onClick}
          type="button"
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default WritingStudioFloatingActions;
