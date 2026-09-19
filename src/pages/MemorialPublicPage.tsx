import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import ReactPlayer from "react-player";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  ExternalLink,
  FileText,
  Languages,
  MapPin,
  PlayCircle,
  Radio,
  UserRound,
} from "lucide-react";
import {
  ELDER_GEOFFREY_MEMORIAL_API_SLUG,
  getMemorialPage,
  memorialSectionKeys,
} from "../api/memorialPublic";
import SiteFooter from "../components/navigation/SiteFooter";
import SiteHeader from "../components/navigation/SiteHeader";
import { useTheme } from "../hooks/useTheme";
import type {
  MemorialMediaAsset,
  MemorialMediaEmbed,
  MemorialPublicPayload,
  MemorialScriptureReference,
} from "../types/memorialPublic";
import "../styles/memorial.css";

const memorialEndpointPath = `/v1/memorial/public/pages/${ELDER_GEOFFREY_MEMORIAL_API_SLUG}/`;

type MemorialSectionKey = (typeof memorialSectionKeys)[number];
type MemorialNavSectionKey = Exclude<MemorialSectionKey, "hero">;

type MemorialRequestState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; payload: MemorialPublicPayload };

const friendlySectionLabels: Record<MemorialSectionKey, string> = {
  hero: "Memorial Hero",
  official_statement: "A Message",
  life_service: "His Life",
  ministry_legacy: "Ministries",
  personal_tributes: "Reflections",
  leadership_timeline: "Leadership",
  gallery: "Photos",
  recordings: "Recordings",
  arrangements: "Arrangements",
  family: "Family",
  closing_hope: "Our Hope",
};

const sectionEyebrows: Record<MemorialSectionKey, string> = {
  hero: "In loving memory",
  official_statement: "Official LCC statement",
  life_service: "A life remembered",
  ministry_legacy: "Across our ministries",
  personal_tributes: "In their own words",
  leadership_timeline: "A record of faithful service",
  gallery: "A life in pictures",
  recordings: "Sermons, speeches and recordings",
  arrangements: "Details and services",
  family: "The family",
  closing_hope: "Our hope in Christ",
};

const navSectionKeys = memorialSectionKeys.filter(
  (sectionKey): sectionKey is MemorialNavSectionKey => sectionKey !== "hero",
);

const coreRichSectionKeys = [
  "official_statement",
  "life_service",
  "family",
  "closing_hope",
] as const satisfies readonly MemorialNavSectionKey[];

const repeatableSectionKeys = [
  "ministry_legacy",
  "personal_tributes",
  "leadership_timeline",
  "gallery",
  "arrangements",
] as const satisfies readonly MemorialNavSectionKey[];

type CoreRichSectionKey = (typeof coreRichSectionKeys)[number];
type RepeatableSectionKey = (typeof repeatableSectionKeys)[number];
type PublicImageSize = "thumb" | "small" | "medium" | "large";

type PublicImageVariant = {
  format: string;
  height: number | null;
  sizeName: string;
  url: string;
  width: number | null;
};

function MemorialPublicPage() {
  const { darkMode, toggleTheme } = useTheme();
  const [requestState, setRequestState] = useState<MemorialRequestState>({ status: "loading" });

  useEffect(() => {
    let ignore = false;

    async function loadMemorialPage() {
      setRequestState({ status: "loading" });

      try {
        const payload = await getMemorialPage(ELDER_GEOFFREY_MEMORIAL_API_SLUG);

        if (ignore) {
          return;
        }

        if (!payload) {
          setRequestState({ status: "not-found" });
          return;
        }

        setRequestState({ status: "ready", payload });
      } catch (error) {
        if (ignore) {
          return;
        }

        setRequestState({
          status: "error",
          message: error instanceof Error ? error.message : "Unable to load memorial page",
        });
      }
    }

    void loadMemorialPage();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (requestState.status !== "ready") {
      document.title = "Memorial";
      return;
    }

    const { page } = requestState.payload;
    document.title = page.meta_title || `${page.full_name} Memorial`;

    const description = page.meta_description || page.summary;
    const metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');

    if (metaDescription && description) {
      metaDescription.content = description;
    }
  }, [requestState]);

  return (
    <SitePageShell darkMode={darkMode} onToggleTheme={toggleTheme}>
      {requestState.status === "loading" ? (
        <MemorialContentShell>
          <MemorialStatusCard
            eyebrow="Memorial"
            title="Loading memorial page"
            message="We are preparing the public memorial details."
          />
        </MemorialContentShell>
      ) : null}

      {requestState.status === "not-found" ? (
        <MemorialContentShell>
          <MemorialStatusCard
            eyebrow="404"
            title="Memorial page not found"
            message="This memorial page may not be published yet, or its public link may have changed."
            detail={`Backend returned 404 for ${memorialEndpointPath}`}
          />
        </MemorialContentShell>
      ) : null}

      {requestState.status === "error" ? (
        <MemorialContentShell>
          <MemorialStatusCard
            eyebrow="Memorial"
            title="We could not load this memorial"
            message={`${requestState.message}. Please try again shortly.`}
            detail={`Request path: ${memorialEndpointPath}`}
          />
        </MemorialContentShell>
      ) : null}

      {requestState.status === "ready" ? <MemorialReadyState payload={requestState.payload} /> : null}
    </SitePageShell>
  );
}

function SitePageShell({
  children,
  darkMode,
  onToggleTheme,
}: {
  children: ReactNode;
  darkMode: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <div className={`flex min-h-screen flex-col overflow-x-clip transition-colors duration-500 ${darkMode ? "bg-[#080808] text-stone-100" : "bg-[#f8f5ef] text-zinc-950"}`}>
      <SiteHeader darkMode={darkMode} onToggleTheme={onToggleTheme} />
      <main className="flex-1">{children}</main>
      <SiteFooter darkMode={darkMode} />
    </div>
  );
}

function MemorialReadyState({ payload }: { payload: MemorialPublicPayload }) {
  const { sections } = payload;
  const renderedNavSections = navSectionKeys.filter((sectionKey) => shouldRenderSection(sections[sectionKey]));

  return (
    <MemorialContentShell>
      <MemorialHero payload={payload} />
      <MemorialSectionNav sectionKeys={renderedNavSections} />

      <div>
        {renderedNavSections.map((sectionKey, index) => {
          if (isCoreRichSectionKey(sectionKey)) {
            return (
              <CoreMemorialSection
                index={index}
                key={sectionKey}
                section={sections[sectionKey]}
                sectionKey={sectionKey}
              />
            );
          }

          if (isRepeatableSectionKey(sectionKey)) {
            return renderRepeatableSection(sectionKey, index, sections);
          }

          if (sectionKey === "recordings") {
            return <RecordingsSection index={index} key={sectionKey} section={sections.recordings} />;
          }

          return (
            <MemorialSectionFrame
              index={index}
              key={sectionKey}
              sectionKey={sectionKey}
              section={sections[sectionKey]}
            />
          );
        })}
      </div>
    </MemorialContentShell>
  );
}

function MemorialHero({ payload }: { payload: MemorialPublicPayload }) {
  const { page, sections } = payload;
  const heroContent = sections.hero.content;
  const hasHeroBackground = Boolean(getBestImageVariant(page.hero_image, "large"));
  const hasPortrait = Boolean(getBestImageVariant(page.portrait_image, "large"));
  const initials = getInitials(page.full_name);
  const scriptureReferences = heroContent?.scripture_references ?? [];

  return (
    <header className="relative isolate overflow-hidden border-b border-[var(--memorial-line)] bg-[var(--memorial-paper)]">
      {hasHeroBackground ? (
        <>
          <PublicImage
            asset={page.hero_image}
            className="absolute inset-0 -z-20 h-full w-full object-cover opacity-15"
            decorative
            loading="eager"
            preferredSize="large"
          />
          <div className="absolute inset-0 -z-10 bg-[rgba(255,253,247,0.86)]" aria-hidden="true" />
        </>
      ) : null}

      <div className="grid w-full gap-8 px-6 py-8 sm:px-8 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30rem)_10rem] lg:items-center lg:gap-10 lg:px-[clamp(3rem,5vw,6rem)] lg:py-14 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,36rem)_minmax(12rem,15rem)] xl:gap-12">
        <div className="order-2 flex min-w-0 flex-col justify-center lg:order-none lg:pb-10">
          <p className="text-sm font-black text-[var(--memorial-burgundy)]">In loving memory</p>
          <h1 className="mt-4 max-w-5xl text-[clamp(3.35rem,8.2vw,8.4rem)] font-black leading-[0.88] text-[var(--memorial-ink)]">
            {page.full_name}
          </h1>
          <div className="mt-5 space-y-1 text-lg text-[#222] sm:text-xl">
            <p className="font-extrabold">{page.role_title}</p>
            <p className="text-[#35302b]">{page.years_of_service}</p>
          </div>
          <span className="memorial-rule mt-7" aria-hidden="true" />
          {heroContent?.content_html ? (
            <RichTextBlock
              className="memorial-hero-rich-text memorial-scripture mt-7 max-w-2xl text-2xl sm:text-3xl"
              html={heroContent.content_html}
            />
          ) : null}
          <ScriptureReferences references={scriptureReferences} variant="inline" />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[var(--memorial-burgundy)] px-7 text-sm font-black text-[var(--memorial-ink)] transition hover:bg-[var(--memorial-burgundy)] hover:text-white"
              href="#life_service"
            >
              His life & legacy
              <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
            </a>
            <a
              className="inline-flex min-h-12 items-center justify-center gap-2 px-2 text-sm font-bold text-[#514a42] underline decoration-[var(--memorial-line)] underline-offset-8 transition hover:text-[var(--memorial-burgundy)]"
              href="#arrangements"
            >
              Service arrangements
              <ArrowDown aria-hidden="true" size={17} strokeWidth={2} />
            </a>
          </div>
        </div>

        <figure className="order-1 relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-black/10 bg-[#191817] shadow-2xl shadow-black/10 lg:order-none lg:self-center">
          {hasPortrait ? (
            <PublicImage
              alt={page.full_name}
              asset={page.portrait_image}
              className="h-full w-full object-cover"
              loading="eager"
              preferredSize="large"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_38%,#343331,#171615_62%)] text-stone-200">
              <p className="memorial-serif text-6xl tracking-wide">{initials}</p>
              <span className="mt-5 h-px w-20 bg-stone-400/60" aria-hidden="true" />
              <p className="mt-5 text-center text-xs uppercase tracking-[0.22em] text-stone-300/80">
                Faithful service
              </p>
            </div>
          )}
        </figure>

        <aside className="hidden h-full min-h-[24rem] flex-col justify-center border-l border-[var(--memorial-line)] pl-7 lg:flex xl:pl-9">
          <p className="memorial-scripture text-3xl xl:text-4xl">Faith.<br />Service.<br />Lasting impact.</p>
          <span className="memorial-rule mt-7" aria-hidden="true" />
          <p className="mt-6 max-w-44 text-xs font-bold uppercase leading-6 tracking-[0.34em] text-[#716960]">
            A beloved chairman. A cherished brother.
          </p>
        </aside>
      </div>
    </header>
  );
}
function MemorialSectionNav({ sectionKeys }: { sectionKeys: MemorialNavSectionKey[] }) {
  const handleMobileNavChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const target = document.getElementById(event.currentTarget.value);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="sticky top-[4.75rem] z-20 border-b border-[var(--memorial-line)] bg-[rgba(255,253,247,0.95)] backdrop-blur lg:top-[5rem]" aria-label="Memorial sections">
      <div className="mx-auto w-full max-w-[88rem] px-6 sm:px-8 lg:px-12">
        <div className="hidden items-center justify-center gap-1 lg:flex">
          {sectionKeys.map((sectionKey) => (
            <a
              className="px-5 py-5 text-sm font-semibold text-[#4f4840] transition hover:text-[var(--memorial-burgundy)]"
              href={`#${sectionKey}`}
              key={sectionKey}
            >
              {friendlySectionLabels[sectionKey]}
            </a>
          ))}
        </div>
        <div className="py-4 lg:hidden">
          <label className="sr-only" htmlFor="memorial-section-nav">On this page</label>
          <select
            className="memorial-nav-select w-full rounded-md border border-[var(--memorial-line)] px-4 py-3 pr-12 text-sm font-bold text-[var(--memorial-ink)] shadow-sm"
            defaultValue=""
            id="memorial-section-nav"
            onChange={handleMobileNavChange}
          >
            <option disabled value="">On this page</option>
            {sectionKeys.map((sectionKey) => (
              <option key={sectionKey} value={sectionKey}>
                {friendlySectionLabels[sectionKey]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}

function CoreMemorialSection({
  index,
  section,
  sectionKey,
}: {
  index: number;
  section: MemorialPublicPayload["sections"][CoreRichSectionKey];
  sectionKey: CoreRichSectionKey;
}) {
  const content = section.content;

  if (!content) {
    return null;
  }

  const mutedBand = index % 2 === 1;
  const isClosingHope = sectionKey === "closing_hope";
  const sectionClass = mutedBand
    ? "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-wash)]"
    : "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-paper)]";

  if (isClosingHope) {
    return (
      <section className={sectionClass} id={sectionKey}>
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:px-8 lg:px-12 lg:py-20">
          <p className="text-4xl font-light text-[var(--memorial-burgundy)]" aria-hidden="true">+</p>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
            {sectionEyebrows[sectionKey]}
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-none text-[var(--memorial-ink)] sm:text-5xl">
            {content.title || section.label || friendlySectionLabels[sectionKey]}
          </h2>
          {content.subtitle ? (
            <p className="mx-auto mt-4 max-w-2xl text-base font-bold text-[#4b443d]">{content.subtitle}</p>
          ) : null}
          <span className="memorial-rule mx-auto mt-7" aria-hidden="true" />
          <RichTextBlock className="mx-auto mt-8 max-w-3xl text-xl sm:text-2xl" html={content.content_html} />
          <ScriptureReferences centered references={content.scripture_references} />
          <MediaEmbeds embeds={content.media_embeds} />
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass} id={sectionKey}>
      <div className="mx-auto grid w-full max-w-[88rem] gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-12 lg:py-16 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="border-[var(--memorial-line)] lg:border-r lg:pr-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
            {sectionEyebrows[sectionKey]}
          </p>
          <h2 className="mt-4 max-w-sm text-3xl font-black leading-none text-[var(--memorial-ink)] sm:text-4xl">
            {content.title || section.label || friendlySectionLabels[sectionKey]}
          </h2>
          {content.subtitle ? (
            <p className="mt-4 max-w-sm text-sm font-bold leading-6 text-[#625b52]">{content.subtitle}</p>
          ) : null}
          <span className="memorial-rule mt-6" aria-hidden="true" />
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
          <div>
            <RichTextBlock html={content.content_html} />
            <MediaEmbeds embeds={content.media_embeds} />
          </div>
          <aside className="space-y-5 border-[var(--memorial-line)] text-sm leading-6 text-[#625b52] xl:border-l xl:pl-8">
            <ScriptureReferences references={content.scripture_references} />
            {content.reading_time_minutes ? (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a7066]">
                {content.reading_time_minutes} min read
              </p>
            ) : null}
          </aside>
        </div>
      </div>
    </section>
  );
}

function RichTextBlock({ className = "", html }: { className?: string; html: string }) {
  if (!html) {
    return null;
  }

  return (
    <div
      className={`memorial-rich-text max-w-3xl ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function ScriptureReferences({
  centered,
  references,
  variant = "chips",
}: {
  centered?: boolean;
  references: MemorialScriptureReference[];
  variant?: "chips" | "inline";
}) {
  if (!references.length) {
    return null;
  }

  if (variant === "inline") {
    return (
      <div className={`mt-3 flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}>
        {references.map((reference) => (
          <span className="text-sm font-semibold text-[#4f4840]" key={reference.id}>
            {reference.display_text}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`mt-6 flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}>
      {references.map((reference) => (
        <span
          className="rounded-full border border-[var(--memorial-line)] bg-[rgba(255,253,247,0.72)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--memorial-burgundy-dark)]"
          key={reference.id}
        >
          {reference.display_text}
        </span>
      ))}
    </div>
  );
}

function PublicImage({
  alt,
  altTextOverride,
  asset,
  className = "",
  decorative,
  loading = "lazy",
  preferredSize,
}: {
  alt?: string;
  altTextOverride?: string;
  asset: MemorialMediaAsset | null;
  className?: string;
  decorative?: boolean;
  loading?: "eager" | "lazy";
  preferredSize: PublicImageSize;
}) {
  const variant = getBestImageVariant(asset, preferredSize);

  if (!asset || !variant) {
    return null;
  }

  const resolvedAlt = decorative ? "" : altTextOverride || asset.alt_text || alt || asset.title || "";

  return (
    <img
      alt={resolvedAlt}
      aria-hidden={decorative ? true : undefined}
      className={className}
      decoding="async"
      height={variant.height ?? undefined}
      loading={loading}
      src={variant.url}
      width={variant.width ?? undefined}
    />
  );
}

function MediaEmbeds({ embeds, preferredSize = "medium" }: { embeds: MemorialMediaEmbed[]; preferredSize?: PublicImageSize }) {
  const visibleEmbeds = sortByOrder(embeds).filter((embed) => getBestImageVariant(embed.media_asset, preferredSize));

  if (!visibleEmbeds.length) {
    return null;
  }

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {visibleEmbeds.map((embed) => (
        <figure
          className="overflow-hidden rounded-sm border border-[var(--memorial-line)] bg-[var(--memorial-paper)] shadow-sm shadow-black/5"
          key={embed.embed_id || embed.id}
        >
          <PublicImage
            alt={embed.media_asset.title}
            altTextOverride={embed.alt_text_override}
            asset={embed.media_asset}
            className="aspect-[4/3] w-full object-cover"
            preferredSize={preferredSize}
          />
          {embed.caption_override || embed.media_asset.caption ? (
            <figcaption className="px-4 py-3 text-sm leading-6 text-[#625b52]">
              {embed.caption_override || embed.media_asset.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  );
}
function RecordingsSection({
  index,
  section,
}: {
  index: number;
  section: MemorialPublicPayload["sections"]["recordings"];
}) {
  const groups = sortByOrder(section.items).filter((group) => group.content || group.series || group.items.length > 0);

  if (!section.content && !groups.length) {
    return null;
  }

  return (
    <section className={getSectionBandClass(index)} id="recordings">
      <div className="mx-auto grid w-full max-w-[88rem] gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-12 lg:py-16 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="border-[var(--memorial-line)] lg:border-r lg:pr-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
            {sectionEyebrows.recordings}
          </p>
          <h2 className="mt-4 max-w-sm text-3xl font-black leading-none text-[var(--memorial-ink)] sm:text-4xl">
            {section.content?.title || section.label || friendlySectionLabels.recordings}
          </h2>
          {section.content?.subtitle ? (
            <p className="mt-4 max-w-sm text-sm font-bold leading-6 text-[#625b52]">{section.content.subtitle}</p>
          ) : null}
          <span className="memorial-rule mt-6" aria-hidden="true" />
        </div>

        <div>
          {section.content?.content_html ? (
            <div className="mb-8">
              <RichTextBlock html={section.content.content_html} />
              <ScriptureReferences references={section.content.scripture_references} />
              <MediaEmbeds embeds={section.content.media_embeds} />
            </div>
          ) : null}

          <div className="grid gap-8">
            {groups.map((group) => (
              <RecordingGroup group={group} key={group.id} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecordingGroup({
  group,
}: {
  group: MemorialPublicPayload["sections"]["recordings"]["items"][number];
}) {
  const hasSeriesCover = Boolean(getBestImageVariant(group.series?.cover_image ?? null, "medium"));
  const recordings = [...group.items].sort((first, second) => {
    const firstPriority = first.priority ?? 0;
    const secondPriority = second.priority ?? 0;

    if (firstPriority !== secondPriority) {
      return secondPriority - firstPriority;
    }

    const firstDate = first.published_at ? new Date(first.published_at).getTime() : 0;
    const secondDate = second.published_at ? new Date(second.published_at).getTime() : 0;

    return secondDate - firstDate;
  });

  return (
    <article className="rounded-sm border border-[var(--memorial-line)] bg-[rgba(255,253,247,0.78)] p-5 shadow-sm shadow-black/5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)]">
        {hasSeriesCover ? (
          <PublicImage
            alt={group.title}
            asset={group.series?.cover_image ?? null}
            className="aspect-square w-full rounded-sm object-cover"
            preferredSize="medium"
          />
        ) : (
          <div className="grid aspect-square w-full place-items-center rounded-sm bg-[#211f1d] text-stone-200">
            <PlayCircle size={42} strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--memorial-burgundy)]">
            {group.series?.title || "Memorial recordings"}
          </p>
          <h3 className="mt-3 text-2xl font-black leading-tight text-[var(--memorial-ink)]">{group.title}</h3>
          {group.content?.content_html ? (
            <RichTextBlock className="mt-4 text-base" html={group.content.content_html} />
          ) : group.series?.description ? (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[#625b52]">{group.series.description}</p>
          ) : null}
        </div>
      </div>

      {recordings.length > 0 ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {recordings.map((recording) => (
            <RecordingCard item={recording} key={recording.id} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function RecordingCard({
  item,
}: {
  item: MemorialPublicPayload["sections"]["recordings"]["items"][number]["items"][number];
}) {
  const canEmbed = Boolean(item.embed_url);
  const fallbackUrl = item.external_url || item.embed_url;
  const metadata = [
    item.provider,
    item.media_type,
    formatDuration(item.duration_seconds),
    formatDateTime(item.published_at, null, "date"),
  ].filter(Boolean);

  return (
    <article className="overflow-hidden rounded-sm border border-[var(--memorial-line)] bg-[var(--memorial-paper)] shadow-sm shadow-black/5">
      {canEmbed ? (
        <div className="aspect-video bg-[#141312]">
          <ReactPlayer
            controls
            height="100%"
            light={item.thumbnail_url || false}
            src={item.embed_url}
            width="100%"
          />
        </div>
      ) : (
        <a
          className="group relative block aspect-video overflow-hidden bg-[#141312] text-stone-100"
          href={fallbackUrl || undefined}
          rel="noreferrer"
          target="_blank"
        >
          {item.thumbnail_url ? (
            <img alt="" className="h-full w-full object-cover opacity-80 transition group-hover:scale-105" src={item.thumbnail_url} />
          ) : null}
          <span className="absolute inset-0 grid place-items-center bg-black/25">
            <span className="grid size-16 place-items-center rounded-full bg-white/90 text-[var(--memorial-ink)] shadow-lg">
              <PlayCircle size={32} strokeWidth={1.7} aria-hidden="true" />
            </span>
          </span>
        </a>
      )}

      <div className="p-5">
        <h4 className="text-xl font-black leading-tight text-[var(--memorial-ink)]">{item.title}</h4>
        {item.description_excerpt || item.description ? (
          <p className="mt-3 text-sm leading-6 text-[#625b52]">{item.description_excerpt || item.description}</p>
        ) : null}

        <div className="mt-4 grid gap-2 text-sm leading-6 text-[#5f584f]">
          {item.speaker ? (
            <p className="flex gap-2">
              <UserRound className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
              <span>{item.speaker}</span>
            </p>
          ) : null}
          {item.scripture_reference ? (
            <p className="memorial-serif italic text-[#443e37]">{item.scripture_reference}</p>
          ) : null}
          {metadata.length > 0 ? (
            <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7a7066]">
              {metadata.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </p>
          ) : null}
          {item.language ? (
            <p className="flex gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#7a7066]">
              <Languages size={14} aria-hidden="true" />
              {item.language}
            </p>
          ) : null}
        </div>

        {fallbackUrl ? (
          <a
            className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--memorial-line)] px-4 text-sm font-black text-[var(--memorial-ink)] transition hover:border-[var(--memorial-burgundy)] hover:text-[var(--memorial-burgundy)]"
            href={fallbackUrl}
            rel="noreferrer"
            target="_blank"
          >
            {canEmbed ? "Open recording" : "Watch or listen"}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
function renderRepeatableSection(
  sectionKey: RepeatableSectionKey,
  index: number,
  sections: MemorialPublicPayload["sections"],
) {
  switch (sectionKey) {
    case "ministry_legacy":
      return <MinistryLegacySection index={index} key={sectionKey} section={sections.ministry_legacy} />;
    case "personal_tributes":
      return <PersonalTributesSection index={index} key={sectionKey} section={sections.personal_tributes} />;
    case "leadership_timeline":
      return <LeadershipTimelineSection index={index} key={sectionKey} section={sections.leadership_timeline} />;
    case "gallery":
      return <GallerySection index={index} key={sectionKey} section={sections.gallery} />;
    case "arrangements":
      return <ArrangementsSection index={index} key={sectionKey} section={sections.arrangements} />;
  }
}

function MinistryLegacySection({
  index,
  section,
}: {
  index: number;
  section: MemorialPublicPayload["sections"]["ministry_legacy"];
}) {
  const items = sortByOrder(section.items);

  return (
    <section className={getSectionBandClass(index)} id="ministry_legacy">
      <RepeatableSectionGrid section={section} sectionKey="ministry_legacy">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const hasPhoto = Boolean(getBestImageVariant(item.representative_photo, "medium"));

            return (
              <article
                className="flex min-h-full flex-col overflow-hidden rounded-sm border border-[var(--memorial-line)] bg-[rgba(255,253,247,0.78)] shadow-sm shadow-black/5"
                key={item.id}
              >
                {hasPhoto ? (
                  <PublicImage
                    alt={item.display_ministry_name}
                    asset={item.representative_photo}
                    className="aspect-[16/10] w-full object-cover"
                    preferredSize="medium"
                  />
                ) : (
                  <div className="grid aspect-[16/10] place-items-center bg-[#e4ded4] text-[#6d655c]">
                    <span className="memorial-serif text-4xl">{getInitials(item.display_ministry_name)}</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--memorial-burgundy)]">
                    {item.display_ministry_name || item.ministry_name}
                  </p>
                  <h3 className="mt-3 text-xl font-black leading-tight text-[var(--memorial-ink)]">
                    {item.content?.title || `${item.display_ministry_name} tribute`}
                  </h3>
                  {item.content?.content_html ? (
                    <RichTextBlock className="mt-4 text-base" html={item.content.content_html} />
                  ) : null}
                  <div className="mt-5 border-t border-[var(--memorial-line)] pt-4 text-sm leading-6 text-[#625b52]">
                    {item.speaker_name ? <p className="font-black text-[#29251f]">{item.speaker_name}</p> : null}
                    {item.speaker_office ? <p>{item.speaker_office}</p> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </RepeatableSectionGrid>
    </section>
  );
}

function PersonalTributesSection({
  index,
  section,
}: {
  index: number;
  section: MemorialPublicPayload["sections"]["personal_tributes"];
}) {
  const items = sortByOrder(section.items);

  return (
    <section className={getSectionBandClass(index)} id="personal_tributes">
      <RepeatableSectionGrid section={section} sectionKey="personal_tributes">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const hasPhoto = Boolean(getBestImageVariant(item.author_photo, "thumb"));

            return (
              <article
                className="rounded-sm border border-[var(--memorial-line)] bg-[rgba(255,253,247,0.78)] p-6 shadow-sm shadow-black/5"
                key={item.id}
              >
                <div className="flex items-center gap-4">
                  {hasPhoto ? (
                    <PublicImage
                      alt={item.author_name}
                      asset={item.author_photo}
                      className="size-16 rounded-full object-cover"
                      preferredSize="thumb"
                    />
                  ) : (
                    <div className="grid size-16 place-items-center rounded-full bg-[#211f1d] text-stone-200">
                      <span className="memorial-serif text-xl">{getInitials(item.author_name)}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-black leading-tight text-[var(--memorial-ink)]">{item.author_name}</h3>
                    {item.author_role ? <p className="mt-1 text-sm text-[#625b52]">{item.author_role}</p> : null}
                  </div>
                </div>
                {item.relationship_to_deceased ? (
                  <p className="mt-5 inline-flex rounded-full border border-[var(--memorial-line)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--memorial-burgundy-dark)]">
                    {item.relationship_to_deceased}
                  </p>
                ) : null}
                {item.content?.content_html ? (
                  <RichTextBlock className="mt-5 text-base" html={item.content.content_html} />
                ) : null}
              </article>
            );
          })}
        </div>
      </RepeatableSectionGrid>
    </section>
  );
}

function LeadershipTimelineSection({
  index,
  section,
}: {
  index: number;
  section: MemorialPublicPayload["sections"]["leadership_timeline"];
}) {
  const items = sortByOrder(section.items);

  return (
    <section className={getSectionBandClass(index)} id="leadership_timeline">
      <RepeatableSectionGrid section={section} sectionKey="leadership_timeline">
        <div className="relative grid gap-6 before:absolute before:left-4 before:top-2 before:hidden before:h-[calc(100%-1rem)] before:w-px before:bg-[var(--memorial-line)] md:before:block">
          {items.map((item) => {
            const hasImage = Boolean(getBestImageVariant(item.image, "medium"));
            const dateLabel = formatTimelineDate(item);

            return (
              <article className="relative grid gap-4 md:grid-cols-[2rem_minmax(0,1fr)]" key={item.id}>
                <span className="relative z-10 hidden size-8 rounded-full border-4 border-[var(--memorial-paper)] bg-[var(--memorial-burgundy)] shadow-sm md:block" aria-hidden="true" />
                <div className="grid overflow-hidden rounded-sm border border-[var(--memorial-line)] bg-[rgba(255,253,247,0.78)] shadow-sm shadow-black/5 lg:grid-cols-[16rem_minmax(0,1fr)]">
                  {hasImage ? (
                    <PublicImage alt={item.title} asset={item.image} className="h-full min-h-52 w-full object-cover" preferredSize="medium" />
                  ) : null}
                  <div className="p-6">
                    {dateLabel ? (
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--memorial-burgundy)]">{dateLabel}</p>
                    ) : null}
                    <h3 className="mt-3 text-2xl font-black leading-tight text-[var(--memorial-ink)]">{item.title}</h3>
                    {item.content?.content_html ? (
                      <RichTextBlock className="mt-4 text-base" html={item.content.content_html} />
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </RepeatableSectionGrid>
    </section>
  );
}

function GallerySection({
  index,
  section,
}: {
  index: number;
  section: MemorialPublicPayload["sections"]["gallery"];
}) {
  const items = sortByOrder(section.items);

  return (
    <section className={getSectionBandClass(index)} id="gallery">
      <RepeatableSectionGrid section={section} sectionKey="gallery">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, itemIndex) => {
            const imageSize: PublicImageSize = itemIndex === 0 ? "large" : "medium";

            if (!getBestImageVariant(item.media_asset, imageSize)) {
              return null;
            }

            return (
              <figure
                className={`overflow-hidden rounded-sm border border-[var(--memorial-line)] bg-[rgba(255,253,247,0.78)] shadow-sm shadow-black/5 ${itemIndex === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
                key={item.id}
              >
                <PublicImage
                  alt={item.caption || item.media_asset.title}
                  altTextOverride={item.alt_text_override}
                  asset={item.media_asset}
                  className={`${itemIndex === 0 ? "aspect-[4/3]" : "aspect-square"} w-full object-cover`}
                  preferredSize={imageSize}
                />
                <figcaption className="p-4 text-sm leading-6 text-[#625b52]">
                  {item.category_label ? (
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--memorial-burgundy)]">{item.category_label}</p>
                  ) : null}
                  {item.caption ? <p className="mt-2 text-[#332f2a]">{item.caption}</p> : null}
                  {item.credit ? <p className="mt-2 text-xs">Credit: {item.credit}</p> : null}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </RepeatableSectionGrid>
    </section>
  );
}

function ArrangementsSection({
  index,
  section,
}: {
  index: number;
  section: MemorialPublicPayload["sections"]["arrangements"];
}) {
  const items = [...section.items].sort((first, second) => {
    if (first.is_prominent !== second.is_prominent) {
      return first.is_prominent ? -1 : 1;
    }

    const firstTime = first.starts_at ? new Date(first.starts_at).getTime() : Number.MAX_SAFE_INTEGER;
    const secondTime = second.starts_at ? new Date(second.starts_at).getTime() : Number.MAX_SAFE_INTEGER;

    if (firstTime !== secondTime) {
      return firstTime - secondTime;
    }

    return first.order - second.order;
  });

  return (
    <section className={getSectionBandClass(index)} id="arrangements">
      <RepeatableSectionGrid section={section} sectionKey="arrangements">
        <div className="grid gap-5 lg:grid-cols-3">
          {items.map((item) => {
            const programmeUrl = getBestImageVariant(item.programme_asset, "large")?.url || "";

            return (
              <article
                className={`rounded-sm border p-6 shadow-sm shadow-black/5 ${item.is_prominent ? "border-[var(--memorial-burgundy)] bg-[rgba(255,253,247,0.9)]" : "border-[var(--memorial-line)] bg-[rgba(255,253,247,0.78)]"}`}
                key={item.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--memorial-burgundy)]">{item.arrangement_type_label}</p>
                    <h3 className="mt-3 text-2xl font-black leading-tight text-[var(--memorial-ink)]">{item.title}</h3>
                  </div>
                  <CalendarDays className="mt-1 shrink-0 text-[var(--memorial-burgundy)]" size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <div className="mt-5 space-y-3 text-sm leading-6 text-[#5f584f]">
                  {item.starts_at ? (
                    <p className="flex gap-3">
                      <CalendarDays className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                      <span>{formatDateTime(item.starts_at, item.ends_at)}</span>
                    </p>
                  ) : null}
                  {item.location_name || item.address ? (
                    <p className="flex gap-3">
                      <MapPin className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                      <span>{[item.location_name, item.address].filter(Boolean).join(" · ")}</span>
                    </p>
                  ) : null}
                </div>

                {item.content?.content_html ? (
                  <RichTextBlock className="mt-5 text-base" html={item.content.content_html} />
                ) : null}

                {item.livestream_url || programmeUrl ? (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    {item.livestream_url ? (
                      <a
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--memorial-ink)] px-5 text-sm font-black text-white transition hover:bg-[var(--memorial-burgundy)]"
                        href={item.livestream_url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Radio size={17} aria-hidden="true" />
                        Livestream
                        <ExternalLink size={15} aria-hidden="true" />
                      </a>
                    ) : null}
                    {programmeUrl ? (
                      <a
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--memorial-line)] px-5 text-sm font-black text-[var(--memorial-ink)] transition hover:border-[var(--memorial-burgundy)] hover:text-[var(--memorial-burgundy)]"
                        href={programmeUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <FileText size={17} aria-hidden="true" />
                        Programme
                        <ExternalLink size={15} aria-hidden="true" />
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </RepeatableSectionGrid>
    </section>
  );
}

function RepeatableSectionGrid({
  children,
  section,
  sectionKey,
}: {
  children: ReactNode;
  section: MemorialPublicPayload["sections"][RepeatableSectionKey];
  sectionKey: RepeatableSectionKey;
}) {
  const content = section.content;

  return (
    <div className="mx-auto grid w-full max-w-[88rem] gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-12 lg:py-16 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="border-[var(--memorial-line)] lg:border-r lg:pr-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
          {sectionEyebrows[sectionKey]}
        </p>
        <h2 className="mt-4 max-w-sm text-3xl font-black leading-none text-[var(--memorial-ink)] sm:text-4xl">
          {content?.title || section.label || friendlySectionLabels[sectionKey]}
        </h2>
        {content?.subtitle ? (
          <p className="mt-4 max-w-sm text-sm font-bold leading-6 text-[#625b52]">{content.subtitle}</p>
        ) : null}
        <span className="memorial-rule mt-6" aria-hidden="true" />
      </div>

      <div>
        {content?.content_html ? (
          <div className="mb-8">
            <RichTextBlock html={content.content_html} />
            <ScriptureReferences references={content.scripture_references} />
            <MediaEmbeds embeds={content.media_embeds} />
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
function MemorialSectionFrame({
  index,
  section,
  sectionKey,
}: {
  index: number;
  section: MemorialPublicPayload["sections"][MemorialNavSectionKey];
  sectionKey: MemorialNavSectionKey;
}) {
  const content = section.content;
  const items = "items" in section ? section.items : [];
  const mutedBand = index % 2 === 1;

  return (
    <section
      className={mutedBand ? "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-wash)]" : "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-paper)]"}
      id={sectionKey}
    >
      <div className="mx-auto grid w-full max-w-[88rem] gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-12 lg:py-16 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="border-[var(--memorial-line)] lg:border-r lg:pr-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
            {sectionEyebrows[sectionKey]}
          </p>
          <h2 className="mt-4 max-w-sm text-3xl font-black leading-none text-[var(--memorial-ink)] sm:text-4xl">
            {content?.title || section.label || friendlySectionLabels[sectionKey]}
          </h2>
          <span className="memorial-rule mt-6" aria-hidden="true" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
          <div>
            {content?.subtitle ? (
              <p className="mb-4 text-base font-bold text-[#4b443d]">{content.subtitle}</p>
            ) : null}
            {content?.content_html ? <RichTextBlock html={content.content_html} /> : null}
            {content ? <MediaEmbeds embeds={content.media_embeds} /> : null}
          </div>
          <aside className="text-sm leading-6 text-[#625b52]">
            {items.length > 0 ? (
              <p>
                {items.length} {items.length === 1 ? "entry" : "entries"} prepared for this section.
              </p>
            ) : content?.scripture_references.length ? (
              <p className="memorial-serif italic">
                {content.scripture_references.map((reference) => reference.display_text).join(" · ")}
              </p>
            ) : (
              <p>{section.label || friendlySectionLabels[sectionKey]}</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function isRepeatableSectionKey(sectionKey: MemorialNavSectionKey): sectionKey is RepeatableSectionKey {
  return repeatableSectionKeys.includes(sectionKey as RepeatableSectionKey);
}

function getSectionBandClass(index: number) {
  return index % 2 === 1
    ? "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-wash)]"
    : "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-paper)]";
}

function sortByOrder<TItem extends { order: number }>(items: TItem[]) {
  return [...items].sort((first, second) => first.order - second.order);
}

function formatTimelineDate(item: MemorialPublicPayload["sections"]["leadership_timeline"]["items"][number]) {
  if (item.date_label) {
    return item.date_label;
  }

  if (item.start_year && item.end_year) {
    return item.start_year === item.end_year ? `${item.start_year}` : `${item.start_year}-${item.end_year}`;
  }

  if (item.start_year) {
    return `${item.start_year}`;
  }

  return formatDateTime(item.event_date, null, "date");
}

function formatDateTime(value: string | null, endsAt: string | null = null, mode: "date" | "dateTime" = "dateTime") {
  if (!value) {
    return "";
  }

  const start = new Date(value);

  if (Number.isNaN(start.getTime())) {
    return "";
  }

  if (mode === "date") {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(start);
  }

  const date = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(start);
  const end = endsAt ? new Date(endsAt) : null;

  if (!end || Number.isNaN(end.getTime())) {
    return date;
  }

  const endTime = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(end);

  return `${date} - ${endTime}`;
}

function formatDuration(durationSeconds: number | null) {
  if (!durationSeconds) {
    return "";
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function isCoreRichSectionKey(sectionKey: MemorialNavSectionKey): sectionKey is CoreRichSectionKey {
  return coreRichSectionKeys.includes(sectionKey as CoreRichSectionKey);
}
function shouldRenderSection(section: MemorialPublicPayload["sections"][MemorialNavSectionKey]) {
  const items = "items" in section ? section.items : [];
  return Boolean(section.content || items.length > 0);
}

function getBestImageVariant(asset: MemorialMediaAsset | null, preferredSize: PublicImageSize): PublicImageVariant | null {
  if (!asset) {
    return null;
  }

  const formatPreference = ["avif", "webp", "jpeg"];
  const sizePreference = getImageSizePreference(preferredSize);

  for (const format of formatPreference) {
    const variants = asset.variant_map?.[format];

    for (const size of sizePreference) {
      const variant = variants?.[size];

      if (variant?.url) {
        return {
          format: variant.format || format,
          height: variant.height,
          sizeName: variant.size_name || size,
          url: variant.url,
          width: variant.width,
        };
      }
    }
  }

  if (!asset.original_url) {
    return null;
  }

  return {
    format: "original",
    height: asset.height,
    sizeName: "original",
    url: asset.original_url,
    width: asset.width,
  };
}

function getImageSizePreference(preferredSize: PublicImageSize) {
  if (preferredSize === "large") {
    return ["large", "medium", "small", "thumb"];
  }

  if (preferredSize === "medium") {
    return ["medium", "large", "small", "thumb"];
  }

  if (preferredSize === "small") {
    return ["small", "thumb", "medium", "large"];
  }

  return ["thumb", "small", "medium", "large"];
}
function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function MemorialContentShell({ children }: { children: ReactNode }) {
  return <div className="memorial-page text-[var(--memorial-ink)]">{children}</div>;
}

function MemorialStatusCard({
  eyebrow,
  title,
  message,
  detail,
}: {
  eyebrow: string;
  title: string;
  message: string;
  detail?: string;
}) {
  return (
    <div className="grid min-h-[50rem] place-items-center px-6 py-16">
      <section className="max-w-xl rounded-md border border-[var(--memorial-line)] bg-[var(--memorial-paper)] p-8 text-center shadow-xl shadow-black/5">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-[var(--memorial-burgundy)]">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-black text-[var(--memorial-ink)]">{title}</h1>
        <p className="mt-4 leading-7 text-[var(--memorial-muted)]">{message}</p>
        {detail ? (
          <p className="mt-5 rounded-md bg-[#f3eee5] px-4 py-3 text-xs font-bold text-[#4c453d]">
            {detail}
          </p>
        ) : null}
      </section>
    </div>
  );
}

export default MemorialPublicPage;
