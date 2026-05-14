import { ArrowRight, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type LandingButtonProps = {
  children: ReactNode;
  darkMode: boolean;
  icon?: LucideIcon | null;
  iconPosition?: 'before' | 'after';
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary';
};

const baseClass =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2';

const variantClass = (variant: Required<LandingButtonProps>['variant'], darkMode: boolean) => {
  if (variant === 'primary') {
    return `bg-red-800 text-white shadow-lg shadow-red-950/20 hover:bg-red-700 ${
      darkMode ? 'focus:ring-offset-[#080808]' : 'focus:ring-offset-[#f8f5ef]'
    }`;
  }

  return darkMode
    ? 'border border-white/15 bg-white/10 text-stone-100 hover:bg-white/15 focus:ring-offset-[#080808]'
    : 'border border-white/55 bg-white/10 text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_16px_34px_rgba(24,24,27,0.10)] hover:bg-white/20 focus:ring-offset-[#f8f5ef]';
};

const LandingButton = ({ children, darkMode, icon, iconPosition, onClick, to, variant = 'primary' }: LandingButtonProps) => {
  const Icon = icon === null ? null : icon || (variant === 'primary' ? ArrowRight : BookOpen);
  const resolvedIconPosition = iconPosition || (variant === 'primary' ? 'after' : 'before');
  const content = (
    <>
      {resolvedIconPosition === 'before' && Icon ? <Icon size={18} aria-hidden="true" /> : null}
      {children}
      {resolvedIconPosition === 'after' && Icon ? <Icon size={18} aria-hidden="true" /> : null}
    </>
  );
  const className = `${baseClass} ${variantClass(variant, darkMode)}`;

  if (!to) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to} className={className}>
      {content}
    </Link>
  );
};

export default LandingButton;
