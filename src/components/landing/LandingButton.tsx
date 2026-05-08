import { ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

type LandingButtonProps = {
  children: string;
  to: string;
  variant?: 'primary' | 'secondary';
};

const baseClass =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2';

const variantClasses = {
  primary: 'bg-red-800 text-white shadow-lg shadow-red-950/20 hover:bg-red-700 focus:ring-offset-[#080808]',
  secondary:
    'border border-white/15 bg-white/10 text-stone-100 hover:bg-white/15 focus:ring-offset-[#080808]',
};

const LandingButton = ({ children, to, variant = 'primary' }: LandingButtonProps) => {
  const Icon = variant === 'primary' ? ArrowRight : BookOpen;

  return (
    <Link to={to} className={`${baseClass} ${variantClasses[variant]}`}>
      {variant === 'secondary' ? <Icon size={18} aria-hidden="true" /> : null}
      {children}
      {variant === 'primary' ? <Icon size={18} aria-hidden="true" /> : null}
    </Link>
  );
};

export default LandingButton;
