import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  FileText,
  MapPin,
  Play,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';

import SiteFooter from '../../../components/navigation/SiteFooter';
import SiteHeader from '../../../components/navigation/SiteHeader';
import WritingContentRenderer from '../../../components/writing/WritingContentRenderer';
import { useTheme } from '../../../hooks/useTheme';
import { ApiError } from '../../../services/apiClient';
import { fetchPublicMemorial, isPublicMemorialUnavailable } from './api/publicMemorialApi';
import { getPublicMemorialPreview } from './previewMemorial';
import type {
  PublicMemorial,
  PublicMemorialArrangementsSection,
  PublicMemorialClosingHopeSection,
  PublicMemorialGallerySection,
  PublicMemorialHeroSection,
  PublicMemorialImage,
  PublicMemorialImageStorySection,
  PublicMemorialMilestone,
  PublicMemorialRecording,
  PublicMemorialRecordingsSection,
  PublicMemorialRichText,
  PublicMemorialStatementSection,
  PublicMemorialTimelineSection,
  PublicMemorialTribute,
  PublicMemorialTributeSection,
} from './types';

const sectionOrder = [
  ['lcc_statement', 'church-statement', 'Church statement'],
  ['life_and_service', 'life-service', 'Life & service'],
  ['ministry_tributes', 'ministry-tributes', 'Ministry tributes'],
  ['personal_reflections', 'memories', 'Memories'],
  ['leadership_timeline', 'leadership', 'Leadership'],
  ['gallery', 'photos', 'Photos'],
  ['recordings', 'recordings', 'Recordings'],
  ['arrangements', 'arrangements', 'Arrangements'],
  ['family', 'family', 'Family'],
  ['closing_hope', 'hope', 'Our hope'],
] as const;

const richTextHasContent = (richText?: PublicMemorialRichText | null) => {
  if (!richText) return false;
  if (richText.content_html?.trim()) return true;
  const children = richText.content_json?.root && typeof richText.content_json.root === 'object'
    ? (richText.content_json.root as { children?: unknown[] }).children
    : undefined;
  return Array.isArray(children) && children.length > 0;
};

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AIC';

const formatExactDate = (value?: string | null) => {
  if (!value) return '';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-KE', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  }).format(date);
};

const formatTimeRange = (startsAt?: string | null, endsAt?: string | null) => {
  const start = formatTimestamp(startsAt);
  const end = formatTimestamp(endsAt);
  if (start && end) return `${start} - ${end} EAT`;
  if (start) return `${start} EAT`;
  return '';
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds && seconds !== 0) return '';
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (!minutes) return `${remainder}s`;
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
};

const updateSeo = (memorial: PublicMemorial | null) => {
  if (!memorial) return;
  document.title = memorial.seo.title;

  const description = memorial.seo.description;
  if (description) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = description;
  }

  if (memorial.seo.canonical_path) {
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${memorial.seo.canonical_path}`;
  }
};

const MemorialImage = ({
  className,
  image,
  loading = 'lazy',
  sizes = '(max-width: 768px) 92vw, 50vw',
}: {
  className: string;
  image: PublicMemorialImage;
  loading?: 'eager' | 'lazy';
  sizes?: string;
}) => {
  const sources = ['avif', 'webp'] as const;
  const variantsFor = (format: string) => {
    const seen = new Set<number>();
    return image.variants
      .filter((variant) => variant.format === format && variant.url && variant.width)
      .filter((variant) => {
        if (seen.has(variant.width)) return false;
        seen.add(variant.width);
        return true;
      })
      .map((variant) => `${variant.url} ${variant.width}w`)
      .join(', ');
  };
  const jpegSrcSet = variantsFor('jpeg');

  return (
    <figure className="grid gap-2">
      <picture>
        {sources.map((format) => {
          const srcSet = variantsFor(format);
          return srcSet ? <source key={format} sizes={sizes} srcSet={srcSet} type={`image/${format}`} /> : null;
        })}
        <img
          alt={image.alt_text}
          className={className}
          decoding="async"
          height={image.height}
          loading={loading}
          sizes={sizes}
          src={image.url}
          srcSet={jpegSrcSet || undefined}
          width={image.width}
        />
      </picture>
      {image.caption || image.credit ? (
        <figcaption className="text-center text-xs italic text-zinc-500 dark:text-stone-500">
          {[image.caption, image.credit].filter(Boolean).join(' - ')}
        </figcaption>
      ) : null}
    </figure>
  );
};

const PortraitPlaceholder = ({ name }: { name: string }) => (
  <div className="grid aspect-[4/5] w-full place-items-center rounded-sm bg-[radial-gradient(circle_at_50%_35%,#3f3f3f,#181818)] text-stone-200 shadow-2xl shadow-zinc-950/15">
    <div className="text-center">
      <p className="font-serif text-6xl">{initialsFor(name)}</p>
      <div className="mx-auto mt-5 h-px w-24 bg-stone-500" />
      <p className="mt-4 text-sm text-stone-400">Approved portrait placeholder</p>
    </div>
  </div>
);

const RichTextBlock = ({ darkMode, richText }: { darkMode: boolean; richText: PublicMemorialRichText }) => {
  if (!richTextHasContent(richText)) return null;

  const children = richText.content_json?.root && typeof richText.content_json.root === 'object'
    ? (richText.content_json.root as { children?: unknown[] }).children
    : undefined;

  if (Array.isArray(children) && children.length > 0) {
    return (
      <div className="memorial-rich-text max-w-none text-base leading-8 sm:text-lg">
        <WritingContentRenderer contentJson={richText.content_json} darkMode={darkMode} emptyMessage="" />
      </div>
    );
  }

  if (richText.content_html?.trim()) {
    return (
      <div
        className="memorial-rich-text max-w-none text-base leading-8 sm:text-lg"
        dangerouslySetInnerHTML={{ __html: richText.content_html }}
      />
    );
  }

  return null;
};

const SectionShell = ({
  children,
  eyebrow,
  heading,
  id,
  tone = 'plain',
}: {
  children: ReactNode;
  eyebrow: string;
  heading: string;
  id: string;
  tone?: 'plain' | 'warm';
}) => (
  <section
    className={`scroll-mt-28 border-t border-black/10 dark:border-white/10 ${tone === 'warm' ? 'bg-[#efe8dc]/70 dark:bg-white/[0.03]' : 'bg-transparent'}`}
    id={id}
  >
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[18rem_1fr] lg:px-8 lg:py-16">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-800 dark:text-red-200">{eyebrow}</p>
        <h2 className="mt-3 max-w-sm text-3xl font-black leading-tight sm:text-4xl">{heading}</h2>
        <div className="mt-5 h-0.5 w-14 bg-red-800 dark:bg-red-200" />
      </header>
      <div className="min-w-0">{children}</div>
    </div>
  </section>
);

const HeroSection = ({ hero, scripture }: { hero: PublicMemorialHeroSection; scripture?: string }) => (
  <section className="border-b border-black/10 bg-[radial-gradient(circle_at_20%_0%,#fffaf0,#f8f5ef_55%,#efe8dc)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_20%_0%,#171717,#080808_65%,#050505)]">
    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,28rem)_10rem] lg:items-center lg:px-8 lg:py-16">
      <div>
        <p className="text-lg font-black text-red-800 dark:text-red-200">In loving memory</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-black leading-none tracking-normal sm:text-7xl lg:text-8xl">{hero.display_name}</h1>
        <p className="mt-5 text-2xl font-black">{hero.role}</p>
        <div className="mt-2 grid gap-1 text-lg text-zinc-700 dark:text-stone-300">
          {hero.service_summary.map((line) => <p key={line}>{line}</p>)}
        </div>
        {hero.birth_date || hero.death_date ? (
          <p className="mt-5 text-sm font-bold text-zinc-600 dark:text-stone-400">
            {[formatExactDate(hero.birth_date), formatExactDate(hero.death_date)].filter(Boolean).join(' - ')}
          </p>
        ) : null}
        {scripture ? (
          <blockquote className="mt-8 max-w-2xl border-t border-zinc-300 pt-5 font-serif text-2xl italic leading-snug text-zinc-800 dark:border-stone-700 dark:text-stone-100">
            {scripture}
          </blockquote>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a className="inline-flex min-h-12 items-center gap-3 rounded-full border border-red-800 px-7 text-sm font-black text-red-900 transition hover:bg-red-800 hover:text-white dark:border-red-200 dark:text-red-100 dark:hover:bg-red-200 dark:hover:text-zinc-950" href="#life-service">
            His life & legacy <ArrowRight size={18} />
          </a>
          <a className="inline-flex min-h-12 items-center gap-2 text-sm font-bold underline decoration-zinc-400 underline-offset-8 hover:text-red-800 dark:hover:text-red-100" href="#arrangements">
            Service arrangements
          </a>
        </div>
      </div>
      <div>{hero.image ? <MemorialImage className="aspect-[4/5] w-full rounded-sm object-cover shadow-2xl shadow-zinc-950/15" image={hero.image} loading="eager" sizes="(max-width: 1024px) 92vw, 28rem" /> : <PortraitPlaceholder name={hero.display_name} />}</div>
      <aside className="hidden text-zinc-700 dark:text-stone-300 lg:block">
        <div className="h-0.5 w-14 bg-red-800 dark:bg-red-200" />
        <p className="mt-7 font-serif text-3xl italic leading-tight">Faith.<br />Service.<br />Lasting<br />Impact.</p>
        <div className="mt-10 h-px w-16 bg-zinc-400 dark:bg-stone-600" />
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.4em] text-zinc-500 dark:text-stone-500">{hero.church_name}</p>
      </aside>
    </div>
  </section>
);

const StatementSection = ({ darkMode, section }: { darkMode: boolean; section: PublicMemorialStatementSection }) => (
  <SectionShell eyebrow="Official LCC statement" heading={section.heading} id="church-statement" tone="warm">
    <div className="grid gap-8">
      <div>
        <RichTextBlock darkMode={darkMode} richText={section.body} />
        {section.attribution || section.issued_on ? (
          <p className="mt-6 text-sm font-bold text-zinc-600 dark:text-stone-400">
            {[section.attribution, formatExactDate(section.issued_on)].filter(Boolean).join(' - ')}
          </p>
        ) : null}
      </div>
    </div>
  </SectionShell>
);

const ImageStorySection = ({
  darkMode,
  eyebrow,
  id,
  section,
  tone,
}: {
  darkMode: boolean;
  eyebrow: string;
  id: string;
  section: PublicMemorialImageStorySection;
  tone?: 'plain' | 'warm';
}) => (
  <SectionShell eyebrow={eyebrow} heading={section.heading} id={id} tone={tone}>
    <div className="grid gap-7">
      {richTextHasContent(section.body) ? <RichTextBlock darkMode={darkMode} richText={section.body} /> : null}
      {section.images.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {section.images.map((image) => (
            <MemorialImage className="aspect-[4/3] w-full rounded-sm object-cover" image={image} key={image.id} />
          ))}
        </div>
      ) : null}
    </div>
  </SectionShell>
);

const TributeCard = ({ darkMode, item, ministry }: { darkMode: boolean; item: PublicMemorialTribute; ministry: boolean }) => (
  <article className={`border p-5 ${darkMode ? 'border-white/10 bg-white/[0.04]' : 'border-black/10 bg-white/70'}`}>
    {item.images[0] ? <MemorialImage className="aspect-[16/9] w-full rounded-sm object-cover" image={item.images[0]} sizes="(max-width: 768px) 92vw, 22rem" /> : null}
    <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">
      {ministry ? item.ministry_name : item.author_name}
    </p>
    <div className="mt-3">
      <RichTextBlock darkMode={darkMode} richText={item.body} />
    </div>
    <p className="mt-5 text-sm font-bold text-zinc-600 dark:text-stone-400">
      {[item.author_name, item.author_role].filter(Boolean).join(', ')}
    </p>
  </article>
);

const TributesSection = ({
  darkMode,
  eyebrow,
  id,
  ministry,
  section,
}: {
  darkMode: boolean;
  eyebrow: string;
  id: string;
  ministry: boolean;
  section: PublicMemorialTributeSection;
}) => (
  <SectionShell eyebrow={eyebrow} heading={section.heading} id={id}>
    {section.intro.length ? (
      <div className="mb-8 max-w-2xl text-base leading-7 text-zinc-600 dark:text-stone-400">
        {section.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    ) : null}
    <div className="grid gap-4 md:grid-cols-3">
      {section.items.map((item) => <TributeCard darkMode={darkMode} item={item} key={item.id} ministry={ministry} />)}
    </div>
  </SectionShell>
);

const TimelineItem = ({ darkMode, item }: { darkMode: boolean; item: PublicMemorialMilestone }) => (
  <li className="grid gap-4 border-l border-zinc-300 pl-6 dark:border-stone-700">
    <div className="-ml-[1.95rem] flex items-start gap-5">
      <span className="mt-1 size-3 rounded-full bg-red-800 ring-4 ring-[#f8f5ef] dark:bg-red-200 dark:ring-[#080808]" />
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-red-800 dark:text-red-200">{item.date_label}</p>
        <h3 className="mt-1 text-xl font-black">{item.title}</h3>
        {item.occurred_on ? <p className="mt-1 text-sm text-zinc-500 dark:text-stone-500">{formatExactDate(item.occurred_on)}</p> : null}
      </div>
    </div>
    {richTextHasContent(item.description) ? <RichTextBlock darkMode={darkMode} richText={item.description} /> : null}
    {item.images.length ? (
      <div className="grid gap-4 sm:grid-cols-2">
        {item.images.map((image) => <MemorialImage className="aspect-[4/3] w-full rounded-sm object-cover" image={image} key={image.id} />)}
      </div>
    ) : null}
  </li>
);

const TimelineSection = ({ darkMode, section }: { darkMode: boolean; section: PublicMemorialTimelineSection }) => (
  <SectionShell eyebrow="A record of faithful service" heading={section.heading} id="leadership" tone="warm">
    {section.intro.length ? (
      <div className="mb-8 max-w-2xl text-base leading-7 text-zinc-600 dark:text-stone-400">
        {section.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    ) : null}
    <ol className="grid gap-8">
      {section.items.map((item) => <TimelineItem darkMode={darkMode} item={item} key={item.id} />)}
    </ol>
  </SectionShell>
);

const GallerySection = ({ section }: { section: PublicMemorialGallerySection }) => (
  <SectionShell eyebrow="A life remembered" heading={section.heading} id="photos">
    {section.intro.length ? (
      <div className="mb-8 max-w-2xl text-base leading-7 text-zinc-600 dark:text-stone-400">
        {section.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    ) : null}
    <div className="grid gap-3 md:grid-cols-3">
      {section.items.map((image, index) => (
        <MemorialImage
          className={`w-full rounded-sm object-cover ${index === 0 ? 'aspect-[3/4] md:row-span-2 md:h-full' : 'aspect-[4/3]'}`}
          image={image}
          key={image.id}
          sizes="(max-width: 768px) 92vw, 22rem"
        />
      ))}
    </div>
  </SectionShell>
);

const RecordingCard = ({ recording }: { recording: PublicMemorialRecording }) => {
  const [embedVisible, setEmbedVisible] = useState(false);
  const duration = formatDuration(recording.duration_seconds);
  const meta = [recording.kind, recording.speaker_name, formatExactDate(recording.recorded_on), duration].filter(Boolean).join(' - ');

  return (
    <article className="grid gap-4 border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      {embedVisible && recording.embed_url ? (
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="aspect-video w-full rounded-sm"
          loading="lazy"
          src={recording.embed_url}
          title={recording.title}
        />
      ) : (
        <button
          className="grid aspect-video w-full place-items-center rounded-sm bg-zinc-200 text-zinc-900 transition hover:bg-zinc-300 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700"
          onClick={() => setEmbedVisible(true)}
          type="button"
        >
          <span className="grid size-14 place-items-center rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
            <Play fill="currentColor" size={22} />
          </span>
        </button>
      )}
      <div>
        <h3 className="text-lg font-black">{recording.title}</h3>
        {meta ? <p className="mt-1 text-sm text-zinc-600 dark:text-stone-400">{meta}</p> : null}
        {recording.caption ? <p className="mt-3 text-sm leading-6">{recording.caption}</p> : null}
        {!recording.embed_url || recording.provider === 'external' ? (
          <a className="mt-4 inline-flex items-center gap-2 text-sm font-black text-red-800 dark:text-red-200" href={recording.url} rel="noopener noreferrer" target="_blank">
            Open recording <ExternalLink size={15} />
          </a>
        ) : null}
      </div>
    </article>
  );
};

const RecordingsSection = ({ section }: { section: PublicMemorialRecordingsSection }) => (
  <SectionShell eyebrow="Sermons, speeches and recordings" heading={section.heading} id="recordings">
    {section.intro.length ? (
      <div className="mb-8 max-w-2xl text-base leading-7 text-zinc-600 dark:text-stone-400">
        {section.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    ) : null}
    <div className="grid gap-4 md:grid-cols-2">
      {section.items.map((item) => <RecordingCard key={item.id} recording={item} />)}
    </div>
  </SectionShell>
);

const eventKindLabel: Record<string, string> = {
  funeral: 'Funeral service',
  memorial_service: 'Memorial service',
  prayer_meeting: 'Prayer gathering',
};

const ArrangementsSection = ({ darkMode, section }: { darkMode: boolean; section: PublicMemorialArrangementsSection }) => (
  <SectionShell eyebrow="Details to be announced" heading={section.heading} id="arrangements" tone="warm">
    {richTextHasContent(section.body) ? (
      <div className="mb-8">
        <RichTextBlock darkMode={darkMode} richText={section.body} />
      </div>
    ) : null}
    {section.items.length ? (
      <div className="grid gap-4 md:grid-cols-3">
        {section.items.map((item) => {
          const dateLine = item.date_label || formatExactDate(item.event_date) || 'Details to be announced';
          const timeLine = formatTimeRange(item.starts_at, item.ends_at);
          return (
            <article className="grid gap-3 border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-white/[0.04]" key={item.id}>
              <CalendarDays className="text-red-800 dark:text-red-200" size={24} />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-red-800 dark:text-red-200">{eventKindLabel[item.kind] || item.kind}</p>
                <h3 className="mt-2 text-xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm font-bold text-zinc-600 dark:text-stone-400">{dateLine}</p>
                {timeLine ? <p className="text-sm text-zinc-600 dark:text-stone-400">{timeLine}</p> : null}
              </div>
              {item.location_name || item.location_address ? (
                <p className="inline-flex items-start gap-2 text-sm leading-6 text-zinc-700 dark:text-stone-300">
                  <MapPin className="mt-1 shrink-0" size={15} />
                  <span>{[item.location_name, item.location_address].filter(Boolean).join(', ')}</span>
                </p>
              ) : null}
              {richTextHasContent(item.details) ? <RichTextBlock darkMode={darkMode} richText={item.details} /> : null}
              {item.livestream ? (
                <a className="inline-flex items-center gap-2 text-sm font-black text-red-800 dark:text-red-200" href={item.livestream.url} rel="noopener noreferrer" target="_blank">
                  Livestream <ExternalLink size={15} />
                </a>
              ) : null}
            </article>
          );
        })}
      </div>
    ) : null}
    {section.programmes.length ? (
      <div className="mt-6 flex flex-wrap gap-3">
        {section.programmes.map((programme) => (
          <a className="inline-flex min-h-12 items-center gap-2 border border-black/10 bg-white px-5 text-sm font-black text-zinc-900 transition hover:text-red-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-stone-100 dark:hover:text-red-100" href={programme.url} key={programme.id} rel="noopener noreferrer" target="_blank">
            <FileText size={17} /> {programme.title}
          </a>
        ))}
      </div>
    ) : null}
  </SectionShell>
);

const ClosingHopeSection = ({ darkMode, section }: { darkMode: boolean; section: PublicMemorialClosingHopeSection }) => (
  <section className="scroll-mt-28 border-t border-black/10 bg-[#efe8dc]/70 px-4 py-14 text-center dark:border-white/10 dark:bg-white/[0.03] sm:px-6 lg:px-8" id="hope">
    <div className="mx-auto max-w-4xl">
      <p className="text-4xl text-red-800 dark:text-red-200">+</p>
      <h2 className="sr-only">{section.heading}</h2>
      {richTextHasContent(section.body) ? (
        <div className="mt-4 text-left">
          <RichTextBlock darkMode={darkMode} richText={section.body} />
        </div>
      ) : null}
      {section.scripture ? (
        <blockquote className="mt-5 font-serif text-2xl italic leading-snug sm:text-3xl">
          {section.scripture.text.map((line) => <p key={line}>{line}</p>)}
          <footer className="mt-3 text-sm font-bold not-italic text-zinc-600 dark:text-stone-400">
            {[section.scripture.reference, section.scripture.translation, section.scripture.attribution].filter(Boolean).join(' - ')}
          </footer>
        </blockquote>
      ) : null}
    </div>
  </section>
);

const MemorialSkeleton = () => (
  <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_28rem] lg:px-8">
    <div className="grid content-start gap-5">
      <div className="h-5 w-36 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
      <div className="h-20 w-full max-w-2xl animate-pulse rounded bg-black/10 dark:bg-white/10" />
      <div className="h-6 w-72 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      <div className="h-28 w-full max-w-xl animate-pulse rounded bg-black/10 dark:bg-white/10" />
    </div>
    <div className="aspect-[4/5] animate-pulse rounded-sm bg-black/10 dark:bg-white/10" />
  </div>
);

const PublicMemorialPage = () => {
  const { memorialSlug = '' } = useParams<{ memorialSlug?: string }>();
  const { darkMode, toggleTheme } = useTheme();
  const [memorial, setMemorial] = useState<PublicMemorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setMemorial(null);

    fetchPublicMemorial(memorialSlug, controller.signal)
      .then((payload) => {
        setMemorial(payload);
        updateSeo(payload);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        if (isPublicMemorialUnavailable(requestError)) {
          const preview = getPublicMemorialPreview(memorialSlug);
          if (preview) {
            setMemorial(preview);
            updateSeo(preview);
            return;
          }
          setError('This memorial is not available right now.');
          return;
        }
        setError(requestError instanceof ApiError ? requestError.message : 'Unable to load this memorial right now.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [memorialSlug]);

  const navItems = useMemo(() => {
    if (!memorial) return [];
    return sectionOrder.filter(([key]) => Boolean(memorial.sections[key]));
  }, [memorial]);

  const hero = memorial?.sections.hero;
  const heroScripture = memorial?.sections.closing_hope?.scripture?.text?.[0];

  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip ${darkMode ? 'bg-[#080808] text-stone-100' : 'bg-[#f8f5ef] text-zinc-950'}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={toggleTheme} />
      <main className="flex-1">
        {loading ? <MemorialSkeleton /> : null}
        {!loading && error ? (
          <section className="mx-auto grid max-w-3xl gap-5 px-4 py-20 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-800 dark:text-red-200">Memorial</p>
            <h1 className="text-4xl font-black">Memorial unavailable</h1>
            <p className="text-zinc-600 dark:text-stone-400">{error}</p>
            <Link className="mx-auto inline-flex min-h-12 items-center gap-2 rounded-full border border-red-800 px-6 text-sm font-black text-red-900 dark:border-red-200 dark:text-red-100" to="/">
              Back to church website <ArrowRight size={16} />
            </Link>
          </section>
        ) : null}
        {!loading && memorial && hero ? (
          <>
            <HeroSection hero={hero} scripture={heroScripture} />
            {navItems.length ? (
              <nav className="sticky top-[73px] z-20 border-b border-black/10 bg-[#f8f5ef]/90 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#080808]/90 sm:px-6 lg:px-8" aria-label="Memorial sections">
                <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto text-sm font-bold text-zinc-600 dark:text-stone-300">
                  {navItems.map(([, id, label]) => (
                    <a className="shrink-0 rounded-full px-2 py-1 transition hover:text-red-800 dark:hover:text-red-100" href={`#${id}`} key={id}>{label}</a>
                  ))}
                </div>
              </nav>
            ) : null}
            {memorial.sections.lcc_statement ? <StatementSection darkMode={darkMode} section={memorial.sections.lcc_statement} /> : null}
            {memorial.sections.life_and_service ? <ImageStorySection darkMode={darkMode} eyebrow="A life remembered" id="life-service" section={memorial.sections.life_and_service} tone="warm" /> : null}
            {memorial.sections.ministry_tributes ? <TributesSection darkMode={darkMode} eyebrow="A legacy across our ministries" id="ministry-tributes" ministry section={memorial.sections.ministry_tributes} /> : null}
            {memorial.sections.personal_reflections ? <TributesSection darkMode={darkMode} eyebrow="In their own words" id="memories" ministry={false} section={memorial.sections.personal_reflections} /> : null}
            {memorial.sections.leadership_timeline ? <TimelineSection darkMode={darkMode} section={memorial.sections.leadership_timeline} /> : null}
            {memorial.sections.gallery ? <GallerySection section={memorial.sections.gallery} /> : null}
            {memorial.sections.recordings ? <RecordingsSection section={memorial.sections.recordings} /> : null}
            {memorial.sections.arrangements ? <ArrangementsSection darkMode={darkMode} section={memorial.sections.arrangements} /> : null}
            {memorial.sections.family ? <ImageStorySection darkMode={darkMode} eyebrow="The family" id="family" section={memorial.sections.family} tone="warm" /> : null}
            {memorial.sections.closing_hope ? <ClosingHopeSection darkMode={darkMode} section={memorial.sections.closing_hope} /> : null}
          </>
        ) : null}
      </main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
};

export default PublicMemorialPage;
