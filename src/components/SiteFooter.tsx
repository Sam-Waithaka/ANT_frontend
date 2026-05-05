import { Facebook, Instagram, Youtube } from 'lucide-react';
import { assetPaths } from '../constants/assets';

type SiteFooterProps = {
  darkMode: boolean;
};

const SiteFooter = ({ darkMode }: SiteFooterProps) => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/aicnjorotownchurch?igsh=Mjk3cTNjczZ3Z2dr',
      icon: <Instagram size={17} />,
    },
    {
      label: 'TikTok',
      href: 'https://www.tiktok.com/@aicnjorotownchurch',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[17px] fill-current">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.77h-3.4v13.67a2.9 2.9 0 1 1-2-2.76V9.39a6.32 6.32 0 1 0 5.43 6.25V8.7a8.16 8.16 0 0 0 4.77 1.52V6.69h-1.03Z" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: 'https://www.facebook.com/AICNjoro/',
      icon: <Facebook size={17} />,
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@aicnjorotownchurch',
      icon: <Youtube size={17} />,
    },
  ];

  return (
    <footer
      className={`border-t px-4 py-8 text-sm sm:px-6 ${
        darkMode
          ? 'border-white/10 bg-[#050505] text-stone-400'
          : 'border-black/10 bg-[#f8f5ef] text-zinc-600'
      }`}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:grid md:grid-cols-[1fr_auto] md:items-center">
          <div
            className={`order-1 rounded-3xl border p-5 md:order-2 ${
              darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white/60'
            }`}
          >
            <p
              className={`text-center text-xs font-black uppercase tracking-[0.18em] md:text-left ${
                darkMode ? 'text-red-200' : 'text-red-900'
              }`}
            >
              Connect with us
            </p>

            <div className="mt-4 flex items-center justify-center gap-2.5 md:justify-start">
              {socialLinks.map(({ href, icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit AIC Njoro Town on ${label}`}
                  title={label}
                  className={`inline-flex size-11 items-center justify-center rounded-full border transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 ${
                    darkMode
                      ? 'border-white/10 bg-white/10 text-stone-100 hover:bg-white/15 focus:ring-offset-black'
                      : 'border-black/10 bg-white text-zinc-700 shadow-sm hover:bg-[#fffaf0] focus:ring-offset-[#f8f5ef]'
                  }`}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          <div className="order-2 md:order-1">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              <a
                href="https://media-crew.aicnjorotown.org"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit AIC Njoro Town Media Crew"
                className={`inline-flex h-16 w-24 shrink-0 items-center justify-center rounded-2xl border transition hover:-translate-y-0.5 ${
                  darkMode
                    ? 'border-white/10 bg-white text-zinc-950'
                    : 'border-black/10 bg-white shadow-sm'
                }`}
              >
                <img
                  src={assetPaths.mediaCrewLogoBlack}
                  alt="AIC Njoro Town Media Crew"
                  className="h-10 w-auto object-contain"
                />
              </a>

              <div>
                <p
                  className={`text-xs font-black uppercase tracking-[0.18em] ${
                    darkMode ? 'text-red-200' : 'text-red-900'
                  }`}
                >
                  A.N.T Media Crew
                </p>

                <p className="mt-2 max-w-xl leading-6">
                  Serving AIC Njoro Town through media, worship support, livestreams,
                  sermon archives, and digital communication. To God be the Glory. Amen.
                </p>

                <p className="mt-3 text-xs">
                  &copy; 2020 - {currentYear} A.N.T Media Crew. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;