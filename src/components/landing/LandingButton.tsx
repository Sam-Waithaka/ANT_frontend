import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

type LandingButtonProps = {
  children: string;
  darkMode: boolean;
  to: string;
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
    : 'border border-black/10 bg-white/80 text-zinc-900 shadow-lg shadow-zinc-900/10 hover:bg-white focus:ring-offset-[#f8f5ef]';
};

const LandingButton = ({ children, darkMode, to, variant = 'primary' }: LandingButtonProps) => {
  const Icon = variant === 'primary' ? ArrowRight : BookOpen;

  return (
    <Link to={to} className={`${baseClass} ${variantClass(variant, darkMode)}`}>
      {variant === 'secondary' ? <Icon size={18} aria-hidden="true" /> : null}
      {children}
      {variant === 'primary' ? <Icon size={18} aria-hidden="true" /> : null}
    </Link>
  );
};

export default LandingButton;
