import type { ReactNode } from 'react';

type LandingSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export const landingSectionShell = 'px-4 py-16 sm:px-6 sm:py-20 lg:py-24';
export const landingContainer = 'mx-auto max-w-6xl';

const LandingSection = ({ children, className = '', id }: LandingSectionProps) => (
  <section id={id} className={`${landingSectionShell} ${className}`}>
    <div className={landingContainer}>{children}</div>
  </section>
);

export default LandingSection;
