type ContactIntroProps = {
  darkMode: boolean;
};

const ContactIntro = ({ darkMode }: ContactIntroProps) => (
  <section className="px-4 py-12 sm:px-6 sm:py-16">
    <div className="mx-auto max-w-5xl">
      <div
        className={`border-b pb-8 ${
          darkMode ? 'border-white/10' : 'border-black/10'
        }`}
      >
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">
          Contact us
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-normal sm:text-5xl">
          Contact A.I.C Njoro Town
        </h1>
        <p className={`mt-4 max-w-2xl text-base leading-7 sm:text-lg ${darkMode ? 'text-stone-300' : 'text-zinc-700'}`}>
          Page skeleton prepared for contact details, service times, location, and social links from the core API.
        </p>
      </div>
    </div>
  </section>
);

export default ContactIntro;
