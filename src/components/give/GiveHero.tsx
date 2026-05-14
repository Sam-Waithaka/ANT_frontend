type GiveHeroProps = {
  darkMode: boolean;
};

const GiveHero = ({ darkMode }: GiveHeroProps) => (
  <section className="px-4 pb-8 pt-12 sm:px-6 sm:pb-10 sm:pt-16">
    <div className="mx-auto max-w-5xl">
      <div className="max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-red-200">
          Giving
        </p>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
          Give to A.I.C Njoro Town Church
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-stone-200 sm:text-lg">
          Your giving supports worship, discipleship, mercy ministry, missions, and the work of the church.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href="#mpesa-paybill"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-red-800 px-6 text-sm font-black text-white shadow-lg shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-200 focus:ring-offset-2 focus:ring-offset-[#080808]"
          >
            Give via M-PESA
          </a>
          <p className={`max-w-md text-sm leading-6 ${darkMode ? 'text-stone-400' : 'text-stone-300'}`}>
            M-PESA API integration coming soon. For now, please use the Paybill details below.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default GiveHero;
