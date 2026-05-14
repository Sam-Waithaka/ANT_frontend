import { BookOpen } from 'lucide-react';

const MediaCallout = () => (
  <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
    <div className="grid gap-6 rounded-2xl border border-red-300/20 bg-red-950/55 p-6 shadow-2xl shadow-red-950/25 md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
      <div className="grid size-16 place-items-center rounded-full border border-white/20 bg-white/10 text-white">
        <BookOpen size={30} />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold tracking-normal text-white">Stay nourished by God&apos;s Word</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-red-50/80">
          Join us this Sunday for worship, fellowship, and life-giving messages from God&apos;s Word.
        </p>
      </div>
      <a href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-red-900 transition hover:-translate-y-0.5">
        Join us this Sunday
      </a>
    </div>
  </section>
);

export default MediaCallout;
