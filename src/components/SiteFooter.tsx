type SiteFooterProps = {
  darkMode: boolean;
};

const SiteFooter = ({ darkMode }: SiteFooterProps) => (
  <footer
    className={`border-t px-4 py-8 text-center text-sm sm:px-6 ${
      darkMode ? 'border-white/10 text-stone-400' : 'border-black/10 text-zinc-600'
    }`}
  >
    <p>© 2020 - 2026 ANT Media Crew. All rights reserved.</p>
    <p className="mt-1">Full Website coming soon.</p>
  </footer>
);

export default SiteFooter;
