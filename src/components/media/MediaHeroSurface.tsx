import type { ReactNode } from 'react';

type MediaHeroSurfaceBaseProps = {
  children: ReactNode;
  className?: string;
  darkMode: boolean;
};

type MediaHeroSurfaceProps = MediaHeroSurfaceBaseProps & ({
  backgroundUrl: string;
  variant?: 'ambient';
} | {
  backgroundUrl?: never;
  variant: 'solid';
});

const MediaHeroSurface = ({
  backgroundUrl,
  children,
  className = '',
  darkMode,
  variant = 'ambient',
}: MediaHeroSurfaceProps) => (
  <section className={`relative overflow-hidden ${
    variant === 'solid'
      ? darkMode ? 'bg-[#171717]' : 'bg-[#ece7de]'
      : darkMode ? 'bg-[#050505]' : 'bg-[#f8f5ef]'
  } ${className}`}>
    {variant === 'ambient' && backgroundUrl ? (
      <div className="absolute inset-0">
        <img src={backgroundUrl} alt="" className={`size-full object-cover ${darkMode ? 'opacity-28' : 'opacity-12'}`} />
        <div
          className={`absolute inset-0 ${
            darkMode
              ? 'bg-[radial-gradient(circle_at_68%_18%,rgba(153,27,27,0.34),transparent_28%),linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.94)_46%,rgba(5,5,5,0.86)_100%)]'
              : 'bg-[radial-gradient(circle_at_68%_18%,rgba(153,27,27,0.11),transparent_28%),linear-gradient(90deg,#f8f5ef_0%,rgba(248,245,239,0.97)_48%,rgba(236,231,222,0.92)_100%)]'
          }`}
        />
      </div>
    ) : null}
    <div className="relative">{children}</div>
  </section>
);

export default MediaHeroSurface;
