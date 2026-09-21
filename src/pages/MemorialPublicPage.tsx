import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import ReactPlayer from "react-player";
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ExternalLink,
  FileText,
  Languages,
  List,
  MapPin,
  PlayCircle,
  Radio,
  UserRound,
} from "lucide-react";
import {
  ELDER_GEOFFREY_MEMORIAL_API_SLUG,
  createMemorialPublicPageUrl,
  getMemorialPage,
  memorialSectionKeys,
} from "../api/memorialPublic";
import {
  MemorialContentPreviewCard,
  MemorialContentReaderModal,
} from "../components/memorial/MemorialContentReader";
import { useMemorialContentReader, type MemorialContentReaderEntry } from "../components/memorial/useMemorialContentReader";
import FloatingBrowseControl from "../components/navigation/FloatingBrowseControl";
import WritingContentRenderer from "../components/writing/WritingContentRenderer";
import SiteFooter from "../components/navigation/SiteFooter";
import SiteHeader from "../components/navigation/SiteHeader";
import { useTheme } from "../hooks/useTheme";
import {
  getMemorialBlockExcerpt,
  getPrimaryBlockImage,
  shouldCollapseMemorialContent,
  type MemorialViewportSize,
} from "../utils/memorialContentPreview";
import { canRenderMemorialLexicalContent } from "../utils/memorialLexicalContent";
import { filterItemOwnedMemorialBlocks } from "../utils/memorialPublicBlocks";
import type { WritingMediaEmbedLike } from "../components/writing/editor/nodes/ChurchBlockMediaContext";
import type { MediaAsset, MediaVariant } from "../services/mediaAssetsApi";
import type {
  MemorialMediaAsset,
  MemorialMediaEmbed,
  MemorialPublicPayload,
  MemorialRichText,
  MemorialScriptureReference,
} from "../types/memorialPublic";
import "../styles/memorial.css";

const memorialEndpointPath = createMemorialPublicPageUrl(ELDER_GEOFFREY_MEMORIAL_API_SLUG);

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

const MemorialThemeContext = createContext(false);
const MemorialViewportContext = createContext<MemorialViewportSize>("desktop");

function useMemorialDarkMode() {
  return useContext(MemorialThemeContext);
}

function useMemorialViewportSize() {
  return useContext(MemorialViewportContext);
}

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
        <MemorialContentShell darkMode={darkMode}>
          <MemorialStatusCard
            eyebrow="Memorial"
            title="Loading memorial page"
            message="We are preparing the public memorial details."
          />
        </MemorialContentShell>
      ) : null}

      {requestState.status === "not-found" ? (
        <MemorialContentShell darkMode={darkMode}>
          <MemorialStatusCard
            eyebrow="404"
            title="Memorial page not found"
            message="This memorial page may not be published yet, or its public link may have changed."
            detail={`Backend returned 404 for ${memorialEndpointPath}`}
          />
        </MemorialContentShell>
      ) : null}

      {requestState.status === "error" ? (
        <MemorialContentShell darkMode={darkMode}>
          <MemorialStatusCard
            eyebrow="Memorial"
            title="We could not load this memorial"
            message={`${requestState.message}. Please try again shortly.`}
            detail={`Request path: ${memorialEndpointPath}`}
          />
        </MemorialContentShell>
      ) : null}

      {requestState.status === "ready" ? <MemorialReadyState darkMode={darkMode} payload={requestState.payload} /> : null}
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

function MemorialReadyState({ darkMode, payload }: { darkMode: boolean; payload: MemorialPublicPayload }) {
  const { sections } = payload;
  const viewportSize = useMemorialViewportState();
  const renderedNavSections = useMemo(
    () => navSectionKeys.filter((sectionKey) => shouldRenderSection(sectionKey, sections)),
    [sections],
  );

  return (
    <MemorialContentShell darkMode={darkMode}>
      <MemorialViewportContext.Provider value={viewportSize}>
        <MemorialHero payload={payload} visibleSectionKeys={renderedNavSections} />
        <MemorialSectionNav darkMode={darkMode} sectionKeys={renderedNavSections} />

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
      </MemorialViewportContext.Provider>
    </MemorialContentShell>
  );
}

function MemorialHero({
  payload,
  visibleSectionKeys,
}: {
  payload: MemorialPublicPayload;
  visibleSectionKeys: MemorialNavSectionKey[];
}) {
  const { page, sections } = payload;
  const heroBlocks = sections.hero.blocks;
  const renderableHeroBlocks = heroBlocks.filter(hasRenderableBlock);
  const primaryHeroBlock = renderableHeroBlocks[0] ?? null;
  const supplementalHeroBlocks = renderableHeroBlocks.slice(1);
  const hasHeroBackground = Boolean(getBestImageVariant(page.hero_image, "large"));
  const hasPortrait = Boolean(getBestImageVariant(page.portrait_image, "large"));
  const initials = getInitials(page.full_name);
  const scriptureReferences = primaryHeroBlock?.scripture_references ?? [];
  const primaryHeroUsesLexicalContent = richTextUsesLexicalContent(primaryHeroBlock);
  const showLifeLegacyCta = visibleSectionKeys.includes("life_service");
  const showArrangementsCta = visibleSectionKeys.includes("arrangements");

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
          <div className="absolute inset-0 -z-10 bg-[var(--memorial-hero-overlay)]" aria-hidden="true" />
        </>
      ) : null}

      <div className="grid w-full gap-8 px-6 py-8 sm:px-8 md:px-10 xl:min-h-[calc(100vh-5rem)] xl:grid-cols-[minmax(26rem,0.95fr)_minmax(24rem,0.9fr)] xl:items-center xl:gap-10 xl:px-[clamp(3rem,5vw,6rem)] xl:py-14 2xl:grid-cols-[minmax(0,1fr)_minmax(28rem,36rem)_minmax(12rem,15rem)] 2xl:gap-12">
        <div className="order-2 flex min-w-0 flex-col justify-center xl:order-none xl:pb-10">
          <p className="text-sm font-black text-[var(--memorial-burgundy)]">In loving memory</p>
          <h1 className="mt-4 max-w-5xl text-[clamp(3.25rem,12vw,5.6rem)] font-black leading-[0.9] text-[var(--memorial-ink)] md:text-[clamp(4.25rem,9vw,6.5rem)] xl:text-[clamp(4.75rem,6.4vw,7.2rem)] 2xl:text-[clamp(5.5rem,6.8vw,8.4rem)]">
            {page.full_name}
          </h1>
          <div className="mt-5 space-y-1 text-lg text-[var(--memorial-ink)] sm:text-xl">
            <p className="font-extrabold">{page.role_title}</p>
            <p className="text-[var(--memorial-muted-strong)]">{page.years_of_service}</p>
          </div>
          <span className="memorial-rule mt-7" aria-hidden="true" />
          {primaryHeroBlock && hasRenderableRichTextBody(primaryHeroBlock) ? (
            <RichTextBlock
              className="memorial-hero-rich-text memorial-scripture mt-7 max-w-2xl text-xl sm:text-2xl xl:text-3xl"
              content={primaryHeroBlock}
            />
          ) : null}
          {primaryHeroUsesLexicalContent ? null : (
            <ScriptureReferences references={scriptureReferences} variant="inline" />
          )}
          {!primaryHeroUsesLexicalContent && primaryHeroBlock?.media_embeds.length ? (
            <MediaEmbeds embeds={primaryHeroBlock.media_embeds} preferredSize="medium" />
          ) : null}
          {supplementalHeroBlocks.length ? (
            <SectionBlocks
              blockClassName="border-t border-[var(--memorial-line)] pt-5"
              blocks={supplementalHeroBlocks}
              className="mt-6 max-w-2xl gap-5"
              contentClassName="text-base sm:text-lg"
              mediaSize="medium"
              showReadingTime={false}
              titleLevel={3}
            />
          ) : null}
          {showLifeLegacyCta || showArrangementsCta ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {showLifeLegacyCta ? (
                <a
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[var(--memorial-burgundy)] px-7 text-sm font-black text-[var(--memorial-ink)] transition hover:bg-[var(--memorial-burgundy)] hover:text-white"
                  href="#life_service"
                >
                  His life & legacy
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={2} />
                </a>
              ) : null}
              {showArrangementsCta ? (
                <a
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-2 text-sm font-bold text-[var(--memorial-muted-strong)] underline decoration-[var(--memorial-line)] underline-offset-8 transition hover:text-[var(--memorial-burgundy)]"
                  href="#arrangements"
                >
                  Service arrangements
                  <ArrowDown aria-hidden="true" size={17} strokeWidth={2} />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <figure className="order-1 relative mx-auto aspect-[4/5] w-full max-w-[34rem] overflow-hidden rounded-sm border border-black/10 bg-[#191817] shadow-2xl shadow-black/10 xl:order-none xl:max-w-none xl:self-center">
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

        <aside className="hidden h-full min-h-[24rem] flex-col justify-center border-l border-[var(--memorial-line)] pl-7 2xl:flex 2xl:pl-9">
          <p className="memorial-scripture text-3xl 2xl:text-4xl">Faith.<br />Service.<br />Lasting impact.</p>
          <span className="memorial-rule mt-7" aria-hidden="true" />
          <p className="mt-6 max-w-44 text-xs font-bold uppercase leading-6 tracking-[0.34em] text-[var(--memorial-muted-soft)]">
            A beloved chairman. A cherished brother.
          </p>
        </aside>
      </div>
    </header>
  );
}
function MemorialSectionNav({ darkMode, sectionKeys }: { darkMode: boolean; sectionKeys: MemorialNavSectionKey[] }) {
  const [activeSectionKey, setActiveSectionKey] = useState<MemorialNavSectionKey | null>(null);
  const activeLabel = activeSectionKey ? friendlySectionLabels[activeSectionKey] : "On this page";

  useEffect(() => {
    const syncActiveSectionFromHash = () => {
      const hashSectionKey = window.location.hash.replace("#", "") as MemorialNavSectionKey;
      setActiveSectionKey(sectionKeys.includes(hashSectionKey) ? hashSectionKey : null);
    };

    syncActiveSectionFromHash();
    window.addEventListener("hashchange", syncActiveSectionFromHash);

    return () => window.removeEventListener("hashchange", syncActiveSectionFromHash);
  }, [sectionKeys]);

  const scrollToSection = (sectionKey: MemorialNavSectionKey, close?: () => void) => {
    setActiveSectionKey(sectionKey);
    document.getElementById(sectionKey)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${sectionKey}`);
    close?.();
  };

  if (!sectionKeys.length) {
    return null;
  }

  return (
    <>
      <nav className="sticky top-[4.75rem] z-20 hidden border-b border-[var(--memorial-line)] bg-[var(--memorial-nav)] backdrop-blur xl:block xl:top-[5rem]" aria-label="Memorial sections">
        <div className="mx-auto w-full max-w-[88rem] px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-center gap-1">
            {sectionKeys.map((sectionKey) => {
              const isActive = activeSectionKey === sectionKey;

              return (
                <a
                  aria-current={isActive ? "page" : undefined}
                  className={`px-5 py-5 text-sm font-semibold transition ${isActive ? "text-[var(--memorial-burgundy)]" : "text-[var(--memorial-muted-strong)] hover:text-[var(--memorial-burgundy)]"}`}
                  href={`#${sectionKey}`}
                  key={sectionKey}
                  onClick={() => setActiveSectionKey(sectionKey)}
                >
                  {friendlySectionLabels[sectionKey]}
                </a>
              );
            })}
          </div>
        </div>
      </nav>

      <FloatingBrowseControl
        darkMode={darkMode}
        dialogLabel="memorial sections"
        eyebrow="Memorial"
        icon={List}
        title="On This Page"
        triggerAriaLabel={`Memorial sections: ${activeLabel}`}
        triggerLabel={activeLabel}
      >
        {(close) => (
          <nav aria-label="Browse memorial sections" className="grid gap-1">
            {sectionKeys.map((sectionKey) => {
              const isActive = activeSectionKey === sectionKey;

              return (
                <button
                  aria-pressed={isActive}
                  className={`flex min-h-14 box-border w-full max-w-full min-w-0 items-center gap-3 rounded-xl px-3 text-left text-base font-bold transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-700 ${isActive ? "bg-red-800 text-white" : darkMode ? "text-stone-200 hover:bg-white/10" : "text-zinc-800 hover:bg-white"}`}
                  key={sectionKey}
                  onClick={() => scrollToSection(sectionKey, close)}
                  type="button"
                >
                  <span className="min-w-0 flex-1">{friendlySectionLabels[sectionKey]}</span>
                  {isActive ? <Check size={18} aria-label="Selected" /> : null}
                </button>
              );
            })}
          </nav>
        )}
      </FloatingBrowseControl>
    </>
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
  const { blocks } = section;

  if (!hasRenderableBlocks(blocks)) {
    return null;
  }

  const mutedBand = index % 2 === 1;
  const isClosingHope = sectionKey === "closing_hope";
  const sectionTitle = section.label || friendlySectionLabels[sectionKey];
  const sectionClass = mutedBand
    ? "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-wash)]"
    : "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-paper)]";

  if (isClosingHope) {
    return (
      <section className={sectionClass} id={sectionKey}>
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:px-8 md:py-20 lg:px-12 lg:py-24">
          <p className="text-4xl font-light text-[var(--memorial-burgundy)]" aria-hidden="true">+</p>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
            {sectionEyebrows[sectionKey]}
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-none text-[var(--memorial-ink)] sm:text-5xl">
            {sectionTitle}
          </h2>
          <span className="memorial-rule mx-auto mt-7" aria-hidden="true" />
          <SectionBlocks
            blocks={blocks}
            centered
            className="mx-auto mt-10 max-w-3xl gap-9"
            contentClassName="text-xl sm:text-2xl"
            mediaSize="medium"
            titleLevel={3}
          />
        </div>
      </section>
    );
  }

  return (
    <section className={sectionClass} id={sectionKey}>
      <div className="mx-auto grid w-full max-w-[88rem] gap-10 px-6 py-14 sm:px-8 md:px-10 md:py-16 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-12 lg:py-20 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="memorial-section-rail border-[var(--memorial-line)] lg:border-r lg:pr-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
            {sectionEyebrows[sectionKey]}
          </p>
          <h2 className="memorial-section-heading mt-4 max-w-lg text-3xl font-black leading-none text-[var(--memorial-ink)] sm:text-4xl">
            {sectionTitle}
          </h2>
          <span className="memorial-rule mt-6" aria-hidden="true" />
        </div>

        <SectionBlocks blocks={blocks} className="min-w-0 gap-12" titleLevel={3} />
      </div>
    </section>
  );
}

function memorialMediaAssetForLexical(asset: MemorialMediaAsset): MediaAsset {
  const variantMap: MediaAsset["variant_map"] = {};
  const variants: MediaVariant[] = [];
  const sourceVariantMap = asset.variant_map ?? {};

  for (const format of ["avif", "webp", "jpeg"] as const) {
    const sourceBySize = sourceVariantMap[format];

    if (!sourceBySize) {
      continue;
    }

    const targetBySize = {} as NonNullable<MediaAsset["variant_map"][typeof format]>;

    for (const size of ["thumb", "small", "medium", "large"] as const) {
      const variant = sourceBySize[size];

      if (!variant?.url) {
        continue;
      }

      const mediaVariant: MediaVariant = {
        file_size: variant.file_size,
        format,
        generated_at: null,
        height: variant.height,
        id: variant.id,
        quality: variant.quality,
        size_name: variant.size_name || size,
        status: "ready",
        url: variant.url,
        width: variant.width,
      };

      targetBySize[size] = mediaVariant;
      variants.push(mediaVariant);
    }

    variantMap[format] = targetBySize;
  }

  return {
    ...asset,
    alt_text: asset.alt_text || "",
    caption: asset.caption || "",
    height: asset.height ?? null,
    original_url: asset.original_url || null,
    status: "ready",
    uuid: asset.uuid || String(asset.id),
    variant_map: variantMap,
    variants,
    width: asset.width ?? null,
  };
}

function memorialMediaEmbedsForLexical(embeds: MemorialMediaEmbed[]): WritingMediaEmbedLike[] {
  return embeds.map((embed) => ({
    alt_text_override: embed.alt_text_override,
    caption_override: embed.caption_override,
    embed_id: embed.embed_id,
    id: embed.id,
    media_asset: embed.media_asset.id,
    media_asset_detail: memorialMediaAssetForLexical(embed.media_asset),
  }));
}

function RichTextBlock({ className = "", content }: { className?: string; content: MemorialRichText | null }) {
  const darkMode = useMemorialDarkMode();
  const usesLexicalContent = richTextUsesLexicalContent(content);
  const mediaEmbeds = useMemo(
    () => memorialMediaEmbedsForLexical(content?.media_embeds ?? []),
    [content],
  );

  if (!content) {
    return null;
  }

  if (usesLexicalContent) {
    return (
      <div className={"memorial-rich-text max-w-[48rem] " + className}>
        <WritingContentRenderer
          ariaLabel="Memorial content"
          contentEditableClassName="memorial-lexical-content"
          contentJson={content.content_json}
          darkMode={darkMode}
          emptyMessage=""
          mediaEmbeds={mediaEmbeds}
        />
      </div>
    );
  }

  if (!content.content_html) {
    return null;
  }

  return (
    <div
      className={"memorial-rich-text max-w-[48rem] " + className}
      dangerouslySetInnerHTML={{ __html: content.content_html }}
    />
  );
}

type SectionBlocksProps = {
  blockClassName?: string;
  blocks: MemorialRichText[];
  centered?: boolean;
  className?: string;
  contentClassName?: string;
  hideBlockTitles?: boolean;
  mediaSize?: PublicImageSize;
  showReadingTime?: boolean;
  titleLevel?: 2 | 3 | 4;
};

type SectionBlockRenderProps = Omit<SectionBlocksProps, "blocks" | "className"> & {
  block: MemorialRichText;
};

type SectionBlockProps = SectionBlockRenderProps & {
  onOpenContentReader: (entry: MemorialContentReaderEntry, trigger: HTMLElement) => void;
  viewportSize: MemorialViewportSize;
};

export function SectionBlocks({
  blockClassName = "",
  blocks,
  centered = false,
  className = "",
  contentClassName = "",
  hideBlockTitles = false,
  mediaSize = "medium",
  showReadingTime = true,
  titleLevel = 3,
}: SectionBlocksProps) {
  const renderableBlocks = blocks.filter(hasRenderableBlock);
  const viewportSize = useMemorialViewportSize();
  const { activeEntry, closeReader, isReaderOpen, openReader } = useMemorialContentReader();

  if (!renderableBlocks.length) {
    return null;
  }

  return (
    <>
      <div className={"grid gap-8 " + className}>
        {renderableBlocks.map((block) => (
          <SectionBlock
            block={block}
            blockClassName={blockClassName}
            centered={centered}
            contentClassName={contentClassName}
            hideBlockTitles={hideBlockTitles}
            key={block.id}
            mediaSize={mediaSize}
            onOpenContentReader={openReader}
            showReadingTime={showReadingTime}
            titleLevel={titleLevel}
            viewportSize={viewportSize}
          />
        ))}
      </div>
      <MemorialContentReaderModal entry={activeEntry} onClose={closeReader} open={isReaderOpen} />
    </>
  );
}

export function SectionBlock({
  block,
  blockClassName = "",
  centered = false,
  contentClassName = "",
  hideBlockTitles = false,
  mediaSize = "medium",
  onOpenContentReader,
  showReadingTime = true,
  titleLevel = 3,
  viewportSize,
}: SectionBlockProps) {
  if (!shouldCollapseMemorialContent(block, viewportSize)) {
    return (
      <SectionBlockFullContent
        block={block}
        blockClassName={blockClassName}
        centered={centered}
        contentClassName={contentClassName}
        hideBlockTitles={hideBlockTitles}
        mediaSize={mediaSize}
        showReadingTime={showReadingTime}
        titleLevel={titleLevel}
      />
    );
  }

  const readerTitle = getMemorialReaderTitle(block);
  const readerSubtitle = block.subtitle || undefined;
  const readingMeta = getReadingMeta(block);
  const entry: MemorialContentReaderEntry = {
    actionLabel: "Read full reflection",
    eyebrow: block.section_key ? formatMemorialSectionKey(block.section_key) : undefined,
    fullContent: (
      <SectionBlockFullContent
        block={block}
        blockClassName=""
        centered={false}
        contentClassName={contentClassName}
        hideBlockTitles
        mediaSize={mediaSize}
        showReadingTime={false}
        titleLevel={titleLevel}
      />
    ),
    id: block.id,
    image: resolveMemorialPreviewImage({
      alt: readerTitle,
      content: block,
      fallbackVisual: getSectionPreviewFallbackVisual(block, readerTitle),
      preferredSize: mediaSize,
    }),
    preview: getMemorialBlockExcerpt(block, viewportSize),
    readingMeta,
    subtitle: readerSubtitle,
    title: readerTitle,
  };

  return (
    <article className={"memorial-section-block " + (centered ? "mx-auto" : "") + " " + blockClassName}>
      <MemorialContentPreviewCard
        className={centered ? "mx-auto max-w-3xl" : "max-w-[48rem]"}
        entry={entry}
        onOpen={onOpenContentReader}
      />
    </article>
  );
}

function SectionBlockFullContent({
  block,
  blockClassName = "",
  centered = false,
  contentClassName = "",
  hideBlockTitles = false,
  mediaSize = "medium",
  showReadingTime = true,
  titleLevel = 3,
}: SectionBlockRenderProps) {
  const usesLexicalContent = richTextUsesLexicalContent(block);
  const hasHeading = !hideBlockTitles && Boolean(block.title || block.subtitle);
  const hasBody = Boolean(
    hasRenderableRichTextBody(block) ||
      block.media_embeds.length ||
      block.scripture_references.length ||
      (block.reading_time_minutes ?? 0) > 0,
  );

  if (!hasHeading && !hasBody) {
    return null;
  }

  return (
    <article className={"memorial-section-block " + (centered ? "mx-auto text-center " : "") + blockClassName}>
      {hasHeading ? (
        <div className={centered ? "mx-auto max-w-3xl" : "max-w-3xl"}>
          {block.title ? <SectionBlockTitle level={titleLevel}>{block.title}</SectionBlockTitle> : null}
          {block.subtitle ? (
            <p className="mt-3 text-base font-bold leading-7 text-[var(--memorial-muted-strong)]">
              {block.subtitle}
            </p>
          ) : null}
        </div>
      ) : null}

      {hasRenderableRichTextBody(block) ? (
        <RichTextBlock
          className={(hasHeading ? "mt-5 " : "") + (centered ? "mx-auto " : "") + contentClassName}
          content={block}
        />
      ) : null}
      {usesLexicalContent ? null : <ScriptureReferences centered={centered} references={block.scripture_references} />}
      {usesLexicalContent ? null : <MediaEmbeds embeds={block.media_embeds} preferredSize={mediaSize} />}
      {showReadingTime && block.reading_time_minutes ? (
        <p className={"mt-5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--memorial-muted-soft)] " + (centered ? "text-center" : "")}>
          {block.reading_time_minutes} min read
        </p>
      ) : null}
    </article>
  );
}

type MemorialItemContentProps = {
  actionLabel?: string;
  className?: string;
  content: MemorialRichText | null;
  contentClassName?: string;
  fallbackTitle: string;
  explicitImage?: MemorialMediaAsset | null;
  forceReader?: boolean;
  fallbackVisual?: ReactNode;
  imageAlt?: string;
  mediaSize?: PublicImageSize;
  previewClassName?: string;
  readerEyebrow?: string;
  readerSubtitle?: string;
  titleLevel?: 2 | 3 | 4;
};

function MemorialItemContent({
  actionLabel = "Read full reflection",
  className = "",
  content,
  contentClassName = "text-base",
  explicitImage = null,
  fallbackTitle,
  fallbackVisual,
  forceReader = false,
  imageAlt,
  mediaSize = "medium",
  previewClassName = "",
  readerEyebrow,
  readerSubtitle,
  titleLevel = 4,
}: MemorialItemContentProps) {
  const viewportSize = useMemorialViewportSize();
  const { activeEntry, closeReader, isReaderOpen, openReader } = useMemorialContentReader();

  if (!content || !hasRenderableItemContent(content)) {
    return null;
  }

  const title = getMemorialReaderTitle(content, fallbackTitle);
  const fullContent = (
    <SectionBlockFullContent
      block={content}
      blockClassName=""
      centered={false}
      contentClassName={contentClassName}
      hideBlockTitles
      mediaSize={mediaSize}
      showReadingTime={false}
      titleLevel={titleLevel}
    />
  );

  const shouldUseReader = forceReader || shouldCollapseMemorialContent(content, viewportSize);

  if (!shouldUseReader) {
    return <div className={className}>{fullContent}</div>;
  }

  const entry: MemorialContentReaderEntry = {
    actionLabel,
    eyebrow: readerEyebrow || (content.section_key ? formatMemorialSectionKey(content.section_key) : undefined),
    fullContent,
    id: "item-" + content.id,
    image: resolveMemorialPreviewImage({
      alt: imageAlt || title,
      content,
      explicitImage,
      fallbackVisual,
      preferredSize: mediaSize,
    }),
    preview: getMemorialBlockExcerpt(content, viewportSize),
    readingMeta: getReadingMeta(content),
    subtitle: content.subtitle || readerSubtitle || undefined,
    title,
  };

  return (
    <>
      <div className={"grid gap-3 " + className}>
        <p className={"memorial-serif text-base leading-7 text-[var(--memorial-muted-strong)] " + previewClassName}>
          {entry.preview}
        </p>
        <button
          aria-haspopup="dialog"
          aria-label={`${actionLabel}: ${title}`}
          className="memorial-reader-inline-action"
          onClick={(event) => openReader(entry, event.currentTarget)}
          type="button"
        >
          {actionLabel}
          <ArrowRight size={15} aria-hidden="true" />
        </button>
      </div>
      <MemorialContentReaderModal entry={activeEntry} onClose={closeReader} open={isReaderOpen} />
    </>
  );
}

function getMemorialReaderTitle(block: MemorialRichText, fallbackTitle = "Memorial reading") {
  return block.title || block.subtitle || fallbackTitle || "Memorial reading";
}

function hasRenderableItemContent(content: MemorialRichText) {
  return Boolean(
    hasRenderableRichTextBody(content) ||
      hasRenderableMediaEmbeds(content.media_embeds) ||
      content.scripture_references.length > 0,
  );
}

function getReadingMeta(block: MemorialRichText) {
  return block.reading_time_minutes ? block.reading_time_minutes + " min read" : undefined;
}

function formatMemorialSectionKey(sectionKey: string) {
  return sectionKey.toLowerCase().replace(/_/g, " ");
}

type MemorialPreviewImageOptions = {
  alt: string;
  content?: MemorialRichText | null;
  explicitImage?: MemorialMediaAsset | null;
  fallbackVisual?: ReactNode;
  preferredSize: PublicImageSize;
};

function resolveMemorialPreviewImage({
  alt,
  content = null,
  explicitImage = null,
  fallbackVisual,
  preferredSize,
}: MemorialPreviewImageOptions) {
  return (
    getPreviewImageFromAsset(explicitImage, alt, preferredSize) ??
    getPreviewImageFromAsset(getPrimaryBlockImage(content), alt, preferredSize) ??
    fallbackVisual
  );
}

function getPreviewImageFromAsset(asset: MemorialMediaAsset | null, alt: string, preferredSize: PublicImageSize) {
  if (!getBestImageVariant(asset, preferredSize)) {
    return undefined;
  }

  return (
    <PublicImage
      alt={alt}
      asset={asset}
      className="h-full w-full object-cover"
      preferredSize={preferredSize}
    />
  );
}

function getSectionPreviewFallbackVisual(block: MemorialRichText, title: string) {
  return getInitialsPreviewFallback(block.section_key ? formatMemorialSectionKey(block.section_key) : title);
}

function getInitialsPreviewFallback(label: string) {
  return <MemorialPreviewFallbackVisual label={label}>{getInitials(label) || "AIC"}</MemorialPreviewFallbackVisual>;
}

function getIconPreviewFallback(icon: ReactNode, label: string) {
  return <MemorialPreviewFallbackVisual label={label}>{icon}</MemorialPreviewFallbackVisual>;
}

function MemorialPreviewFallbackVisual({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div aria-hidden="true" className="memorial-content-preview-card__fallback">
      <span className="memorial-content-preview-card__fallback-mark">{children}</span>
      <span className="memorial-content-preview-card__fallback-label">{label}</span>
    </div>
  );
}

function SectionBlockTitle({
  children,
  level,
}: {
  children: ReactNode;
  level: 2 | 3 | 4;
}) {
  const className = "memorial-block-title font-serif text-2xl font-black leading-tight text-[var(--memorial-ink)] sm:text-3xl";

  if (level === 2) {
    return <h2 className={className}>{children}</h2>;
  }

  if (level === 4) {
    return <h4 className={className}>{children}</h4>;
  }

  return <h3 className={className}>{children}</h3>;
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
          <span className="text-sm font-semibold text-[var(--memorial-muted-strong)]" key={reference.id}>
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
          className="memorial-pill"
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
    <div className="mt-8 grid gap-5 sm:grid-cols-2">
      {visibleEmbeds.map((embed) => (
        <figure
          className="memorial-card memorial-card--flush"
          key={embed.embed_id || embed.id}
        >
          <PublicImage
            alt={embed.media_asset.title}
            altTextOverride={embed.alt_text_override}
            asset={embed.media_asset}
            className="memorial-card-image memorial-card-image--wide"
            preferredSize={preferredSize}
          />
          {embed.caption_override || embed.media_asset.caption ? (
            <figcaption className="px-4 py-3 text-sm leading-6 text-[var(--memorial-muted)]">
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
  const groups = getRenderableRecordingGroups(section.items);
  const editorialBlocks = getRepeatableSectionEditorialBlocks(section);
  const hasIntro = hasRenderableBlocks(editorialBlocks);

  if (!hasIntro && !groups.length) {
    return null;
  }

  return (
    <section className={getSectionBandClass(index)} id="recordings">
      <div className="mx-auto grid w-full max-w-[88rem] gap-10 px-6 py-14 sm:px-8 md:px-10 md:py-16 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-12 lg:py-20 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="memorial-section-rail border-[var(--memorial-line)] lg:border-r lg:pr-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
            {sectionEyebrows.recordings}
          </p>
          <h2 className="memorial-section-heading mt-4 max-w-lg text-3xl font-black leading-none text-[var(--memorial-ink)] sm:text-4xl">
            {section.label || friendlySectionLabels.recordings}
          </h2>
          <span className="memorial-rule mt-6" aria-hidden="true" />
        </div>

        <div>
          <SectionBlocks blocks={editorialBlocks} className="memorial-section-intro mb-10 gap-7" contentClassName="text-[1.05rem]" titleLevel={3} />

          {groups.length ? (
            <div className="grid gap-10">
              {groups.map((group) => (
                <RecordingGroup group={group} key={group.id} />
              ))}
            </div>
          ) : null}
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
  const recordings = getRenderableRecordingItems(group.items);

  return (
    <article className="memorial-card memorial-card--padded">
      <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)]">
        {hasSeriesCover ? (
          <PublicImage
            alt={group.title}
            asset={group.series?.cover_image ?? null}
            className="memorial-card-image memorial-card-image--square"
            preferredSize="medium"
          />
        ) : (
          <div className="memorial-card-media memorial-card-media--square memorial-card-media--dark">
            <PlayCircle size={42} strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--memorial-burgundy)]">
            {group.series?.title || "Memorial recordings"}
          </p>
          <h3 className="mt-3 text-2xl font-black leading-tight text-[var(--memorial-ink)]">{group.title}</h3>
          {group.content && hasRenderableItemContent(group.content) ? (
            <MemorialItemContent
              actionLabel="Read recording notes"
              className="mt-4"
              content={group.content}
              fallbackTitle={group.content?.title || group.title}
              explicitImage={group.series?.cover_image ?? null}
              fallbackVisual={getIconPreviewFallback(<PlayCircle size={42} strokeWidth={1.5} aria-hidden="true" />, "Recording")}
              imageAlt={group.title || group.series?.title || "Memorial recordings"}
              readerEyebrow={group.series?.title || "Memorial recordings"}
            />
          ) : group.series?.description ? (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--memorial-muted)]">{group.series.description}</p>
          ) : null}
        </div>
      </div>

      {recordings.length > 0 ? (
        <div className="mt-7 grid gap-6 lg:grid-cols-2">
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
    <article className="memorial-card memorial-card--flush">
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
          <p className="mt-3 text-sm leading-6 text-[var(--memorial-muted)]">{item.description_excerpt || item.description}</p>
        ) : null}

        <div className="mt-4 grid gap-2 text-sm leading-6 text-[var(--memorial-muted)]">
          {item.speaker ? (
            <p className="flex gap-2">
              <UserRound className="mt-0.5 shrink-0" size={16} aria-hidden="true" />
              <span>{item.speaker}</span>
            </p>
          ) : null}
          {item.scripture_reference ? (
            <p className="memorial-serif italic text-[var(--memorial-muted-strong)]">{item.scripture_reference}</p>
          ) : null}
          {metadata.length > 0 ? (
            <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs font-bold uppercase tracking-[0.12em] text-[var(--memorial-muted-soft)]">
              {metadata.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </p>
          ) : null}
          {item.language ? (
            <p className="flex gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--memorial-muted-soft)]">
              <Languages size={14} aria-hidden="true" />
              {item.language}
            </p>
          ) : null}
        </div>

        {fallbackUrl ? (
          <a
            className="memorial-action-link mt-5"
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
  const items = getRenderableMinistryLegacyItems(section.items);
  const editorialBlocks = getRepeatableSectionEditorialBlocks(section);
  const hasIntro = hasRenderableBlocks(editorialBlocks);

  if (!hasIntro && !items.length) {
    return null;
  }

  return (
    <section className={getSectionBandClass(index)} id="ministry_legacy">
      <RepeatableSectionGrid editorialBlocks={editorialBlocks} section={section} sectionKey="ministry_legacy">
        {items.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const hasPhoto = Boolean(getBestImageVariant(item.representative_photo, "medium"));

            return (
              <article
                className="memorial-card memorial-card--flush flex min-h-full flex-col"
                key={item.id}
              >
                {hasPhoto ? (
                  <PublicImage
                    alt={item.display_ministry_name}
                    asset={item.representative_photo}
                    className="memorial-card-image memorial-card-image--wide"
                    preferredSize="medium"
                  />
                ) : (
                  <div className="memorial-card-media memorial-card-media--wide">
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
                  <MemorialItemContent
                    actionLabel="Read full tribute"
                    className="mt-4"
                    content={item.content}
                    fallbackTitle={item.content?.title || item.display_ministry_name + " tribute"}
                    explicitImage={item.representative_photo}
                    fallbackVisual={getInitialsPreviewFallback(item.display_ministry_name || item.ministry_name || "Ministry tribute")}
                    imageAlt={item.display_ministry_name || item.ministry_name || "Ministry tribute"}
                    readerEyebrow={item.display_ministry_name || item.ministry_name || "Ministry tribute"}
                  />
                  <div className="mt-5 border-t border-[var(--memorial-line)] pt-4 text-sm leading-6 text-[var(--memorial-muted)]">
                    {item.speaker_name ? <p className="font-black text-[var(--memorial-ink)]">{item.speaker_name}</p> : null}
                    {item.speaker_office ? <p>{item.speaker_office}</p> : null}
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        ) : null}
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
  const items = getRenderablePersonalTributeItems(section.items);
  const editorialBlocks = getRepeatableSectionEditorialBlocks(section);
  const hasIntro = hasRenderableBlocks(editorialBlocks);

  if (!hasIntro && !items.length) {
    return null;
  }

  return (
    <section className={getSectionBandClass(index)} id="personal_tributes">
      <RepeatableSectionGrid editorialBlocks={editorialBlocks} section={section} sectionKey="personal_tributes">
        {items.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const hasPhoto = Boolean(getBestImageVariant(item.author_photo, "thumb"));

            return (
              <article
                className="memorial-card memorial-card--padded"
                key={item.id}
              >
                <div className="flex items-center gap-4">
                  {hasPhoto ? (
                    <PublicImage
                      alt={item.author_name}
                      asset={item.author_photo}
                      className="memorial-avatar"
                      preferredSize="thumb"
                    />
                  ) : (
                    <div className="memorial-avatar memorial-avatar--fallback">
                      <span className="memorial-serif text-xl">{getInitials(item.author_name)}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-black leading-tight text-[var(--memorial-ink)]">{item.author_name}</h3>
                    {item.author_role ? <p className="mt-1 text-sm text-[var(--memorial-muted)]">{item.author_role}</p> : null}
                  </div>
                </div>
                {item.relationship_to_deceased ? (
                  <p className="memorial-pill mt-5">
                    {item.relationship_to_deceased}
                  </p>
                ) : null}
                <MemorialItemContent
                  actionLabel="Read full reflection"
                  className="mt-5"
                  content={item.content}
                  fallbackTitle={item.content?.title || item.author_name + " reflection"}
                  explicitImage={item.author_photo}
                  fallbackVisual={getInitialsPreviewFallback(item.author_name || "Personal tribute")}
                  forceReader
                  imageAlt={item.author_name || "Personal tribute"}
                  readerEyebrow={item.relationship_to_deceased || item.author_role || "Personal tribute"}
                />
              </article>
            );
          })}
          </div>
        ) : null}
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
  const items = getRenderableTimelineItems(section.items);
  const editorialBlocks = getRepeatableSectionEditorialBlocks(section);
  const hasIntro = hasRenderableBlocks(editorialBlocks);

  if (!hasIntro && !items.length) {
    return null;
  }

  return (
    <section className={getSectionBandClass(index)} id="leadership_timeline">
      <RepeatableSectionGrid editorialBlocks={editorialBlocks} section={section} sectionKey="leadership_timeline">
        {items.length ? (
          <div className="relative grid gap-6 before:absolute before:left-4 before:top-2 before:hidden before:h-[calc(100%-1rem)] before:w-px before:bg-[var(--memorial-line)] md:before:block">
          {items.map((item) => {
            const hasImage = Boolean(getBestImageVariant(item.image, "medium"));
            const dateLabel = formatTimelineDate(item);

            return (
              <article className="relative grid gap-4 md:grid-cols-[2rem_minmax(0,1fr)]" key={item.id}>
                <span className="relative z-10 hidden size-8 rounded-full border-4 border-[var(--memorial-paper)] bg-[var(--memorial-burgundy)] shadow-sm md:block" aria-hidden="true" />
                <div className="memorial-card memorial-card--flush grid lg:grid-cols-[16rem_minmax(0,1fr)]">
                  {hasImage ? (
                    <PublicImage alt={item.title} asset={item.image} className="memorial-card-image memorial-card-image--timeline" preferredSize="medium" />
                  ) : null}
                  <div className="p-6">
                    {dateLabel ? (
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--memorial-burgundy)]">{dateLabel}</p>
                    ) : null}
                    <h3 className="mt-3 text-2xl font-black leading-tight text-[var(--memorial-ink)]">{item.title}</h3>
                    <MemorialItemContent
                      actionLabel="Read milestone details"
                      className="mt-4"
                      content={item.content}
                      fallbackTitle={item.title}
                      explicitImage={item.image}
                      fallbackVisual={getInitialsPreviewFallback(dateLabel || item.title || "Leadership milestone")}
                      imageAlt={item.title || "Leadership milestone"}
                      readerEyebrow={dateLabel || "Leadership milestone"}
                    />
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        ) : null}
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
  const items = getRenderableGalleryItems(section.items);
  const editorialBlocks = getRepeatableSectionEditorialBlocks(section);
  const hasIntro = hasRenderableBlocks(editorialBlocks);

  if (!hasIntro && !items.length) {
    return null;
  }

  return (
    <section className={getSectionBandClass(index)} id="gallery">
      <RepeatableSectionGrid editorialBlocks={editorialBlocks} section={section} sectionKey="gallery">
        {items.length ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, itemIndex) => {
            const imageSize: PublicImageSize = itemIndex === 0 ? "large" : "medium";

            if (!getBestImageVariant(item.media_asset, imageSize)) {
              return null;
            }

            return (
              <figure
                className={`memorial-card memorial-card--flush ${itemIndex === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}
                key={item.id}
              >
                <PublicImage
                  alt={item.caption || item.media_asset.title}
                  altTextOverride={item.alt_text_override}
                  asset={item.media_asset}
                  className={`${itemIndex === 0 ? "aspect-[4/3]" : "aspect-square"} memorial-card-image`}
                  preferredSize={imageSize}
                />
                <figcaption className="p-4 text-sm leading-6 text-[var(--memorial-muted)]">
                  {item.category_label ? (
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--memorial-burgundy)]">{item.category_label}</p>
                  ) : null}
                  {item.caption ? <p className="mt-2 text-[var(--memorial-muted-strong)]">{item.caption}</p> : null}
                  {item.credit ? <p className="mt-2 text-xs">Credit: {item.credit}</p> : null}
                </figcaption>
              </figure>
            );
          })}
          </div>
        ) : null}
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
  const items = getRenderableArrangementItems(section.items);
  const editorialBlocks = getRepeatableSectionEditorialBlocks(section);
  const hasIntro = hasRenderableBlocks(editorialBlocks);

  if (!hasIntro && !items.length) {
    return null;
  }

  return (
    <section className={getSectionBandClass(index)} id="arrangements">
      <RepeatableSectionGrid editorialBlocks={editorialBlocks} section={section} sectionKey="arrangements">
        {items.length ? (
          <div className="grid gap-5 lg:grid-cols-3">
          {items.map((item) => {
            const programmeUrl = getBestImageVariant(item.programme_asset, "large")?.url || "";

            return (
              <article
                className={`memorial-card memorial-card--padded ${item.is_prominent ? "memorial-card--prominent" : ""}`}
                key={item.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--memorial-burgundy)]">{item.arrangement_type_label}</p>
                    <h3 className="mt-3 text-2xl font-black leading-tight text-[var(--memorial-ink)]">{item.title}</h3>
                  </div>
                  <CalendarDays className="mt-1 shrink-0 text-[var(--memorial-burgundy)]" size={24} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <div className="mt-5 space-y-3 text-sm leading-6 text-[var(--memorial-muted)]">
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

                <MemorialItemContent
                  actionLabel="Read arrangement details"
                  className="mt-5"
                  content={item.content}
                  explicitImage={null}
                  fallbackTitle={item.content?.title || item.title}
                  fallbackVisual={getIconPreviewFallback(<CalendarDays size={40} strokeWidth={1.7} aria-hidden="true" />, item.arrangement_type_label || "Arrangement")}
                  imageAlt={item.title || item.arrangement_type_label || "Arrangement"}
                  readerEyebrow={item.arrangement_type_label || "Arrangement"}
                />

                {item.livestream_url || programmeUrl ? (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    {item.livestream_url ? (
                      <a
                        className="memorial-action-link memorial-action-link--primary"
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
                        className="memorial-action-link"
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
        ) : null}
      </RepeatableSectionGrid>
    </section>
  );
}

function RepeatableSectionGrid({
  children,
  editorialBlocks,
  section,
  sectionKey,
}: {
  children: ReactNode;
  editorialBlocks: MemorialRichText[];
  section: MemorialPublicPayload["sections"][RepeatableSectionKey];
  sectionKey: RepeatableSectionKey;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[88rem] gap-10 px-6 py-14 sm:px-8 md:px-10 md:py-16 lg:grid-cols-[20rem_minmax(0,1fr)] lg:px-12 lg:py-20 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <div className="memorial-section-rail border-[var(--memorial-line)] lg:border-r lg:pr-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
          {sectionEyebrows[sectionKey]}
        </p>
        <h2 className="memorial-section-heading mt-4 max-w-lg text-3xl font-black leading-none text-[var(--memorial-ink)] sm:text-4xl">
          {section.label || friendlySectionLabels[sectionKey]}
        </h2>
        <span className="memorial-rule mt-6" aria-hidden="true" />
      </div>

      <div>
        <SectionBlocks blocks={editorialBlocks} className="memorial-section-intro mb-10 gap-7" contentClassName="text-[1.05rem]" titleLevel={3} />
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
  const items = "items" in section ? section.items : [];
  const mutedBand = index % 2 === 1;

  if (!hasRenderableBlocks(section.blocks) && !items.length) {
    return null;
  }

  return (
    <section
      className={mutedBand ? "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-wash)]" : "scroll-mt-36 border-b border-[var(--memorial-line)] bg-[var(--memorial-paper)]"}
      id={sectionKey}
    >
      <div className="mx-auto grid w-full max-w-[88rem] gap-10 px-6 py-14 sm:px-8 md:px-10 md:py-16 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-12 lg:py-20 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="memorial-section-rail border-[var(--memorial-line)] lg:border-r lg:pr-8">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[var(--memorial-burgundy)]">
            {sectionEyebrows[sectionKey]}
          </p>
          <h2 className="memorial-section-heading mt-4 max-w-lg text-3xl font-black leading-none text-[var(--memorial-ink)] sm:text-4xl">
            {section.label || friendlySectionLabels[sectionKey]}
          </h2>
          <span className="memorial-rule mt-6" aria-hidden="true" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
          <SectionBlocks blocks={section.blocks} titleLevel={3} />
          <aside className="text-sm leading-6 text-[var(--memorial-muted)]">
            {items.length > 0 ? (
              <p>
                {items.length} {items.length === 1 ? "entry" : "entries"} prepared for this section.
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

function getCurrentMemorialViewportSize(): MemorialViewportSize {
  if (typeof window === "undefined") {
    return "desktop";
  }

  if (window.innerWidth < 768) {
    return "mobile";
  }

  if (window.innerWidth < 1024) {
    return "tablet";
  }

  return "desktop";
}

function useMemorialViewportState() {
  const [viewportSize, setViewportSize] = useState<MemorialViewportSize>(() => getCurrentMemorialViewportSize());

  useEffect(() => {
    const handleResize = () => setViewportSize(getCurrentMemorialViewportSize());

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return viewportSize;
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
function shouldRenderSection(sectionKey: MemorialNavSectionKey, sections: MemorialPublicPayload["sections"]) {
  switch (sectionKey) {
    case "official_statement":
    case "life_service":
    case "family":
    case "closing_hope":
      return hasRenderableBlocks(sections[sectionKey].blocks);
    case "ministry_legacy":
      return hasRenderableRepeatableSectionBlocks(sections.ministry_legacy) || getRenderableMinistryLegacyItems(sections.ministry_legacy.items).length > 0;
    case "personal_tributes":
      return hasRenderableRepeatableSectionBlocks(sections.personal_tributes) || getRenderablePersonalTributeItems(sections.personal_tributes.items).length > 0;
    case "leadership_timeline":
      return hasRenderableRepeatableSectionBlocks(sections.leadership_timeline) || getRenderableTimelineItems(sections.leadership_timeline.items).length > 0;
    case "gallery":
      return hasRenderableRepeatableSectionBlocks(sections.gallery) || getRenderableGalleryItems(sections.gallery.items).length > 0;
    case "recordings":
      return hasRenderableRepeatableSectionBlocks(sections.recordings) || getRenderableRecordingGroups(sections.recordings.items).length > 0;
    case "arrangements":
      return hasRenderableRepeatableSectionBlocks(sections.arrangements) || getRenderableArrangementItems(sections.arrangements.items).length > 0;
  }
}

function getRepeatableSectionEditorialBlocks(section: {
  blocks: MemorialRichText[];
  items: unknown[];
}) {
  return filterItemOwnedMemorialBlocks(section.blocks, section.items);
}

function hasRenderableRepeatableSectionBlocks(section: {
  blocks: MemorialRichText[];
  items: unknown[];
}) {
  return hasRenderableBlocks(getRepeatableSectionEditorialBlocks(section));
}

function hasRenderableBlocks(blocks: MemorialRichText[]) {
  return blocks.some(hasRenderableBlock);
}

function hasRenderableBlock(block: MemorialRichText) {
  return Boolean(
    hasRenderableText(block.title) ||
      hasRenderableText(block.subtitle) ||
      hasRenderableRichTextBody(block) ||
      hasRenderableMediaEmbeds(block.media_embeds) ||
      block.scripture_references.length > 0 ||
      (block.reading_time_minutes ?? 0) > 0,
  );
}

function hasRenderableRichTextContent(content: MemorialRichText | null) {
  return content ? hasRenderableBlock(content) : false;
}

function hasRenderableRichTextBody(content: MemorialRichText | null | undefined) {
  return Boolean(content && (richTextUsesLexicalContent(content) || hasRenderableText(content.content_html)));
}

function richTextUsesLexicalContent(content: MemorialRichText | null | undefined) {
  return Boolean(content && canRenderMemorialLexicalContent(content.content_json));
}

function hasRenderableMediaEmbeds(embeds: MemorialMediaEmbed[]) {
  return embeds.some((embed) => Boolean(getBestImageVariant(embed.media_asset, "medium")));
}

function hasRenderableText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function getRenderableMinistryLegacyItems(items: MemorialPublicPayload["sections"]["ministry_legacy"]["items"]) {
  return sortByOrder(items).filter((item) =>
    Boolean(
      hasRenderableText(item.display_ministry_name) ||
        hasRenderableText(item.ministry_name) ||
        hasRenderableText(item.speaker_name) ||
        hasRenderableText(item.speaker_office) ||
        Boolean(getBestImageVariant(item.representative_photo, "medium")) ||
        hasRenderableRichTextContent(item.content),
    ),
  );
}

function getRenderablePersonalTributeItems(items: MemorialPublicPayload["sections"]["personal_tributes"]["items"]) {
  return sortByOrder(items).filter((item) =>
    Boolean(
      hasRenderableText(item.author_name) ||
        hasRenderableText(item.author_role) ||
        hasRenderableText(item.related_ministry_name) ||
        hasRenderableText(item.relationship_to_deceased) ||
        Boolean(getBestImageVariant(item.author_photo, "thumb")) ||
        hasRenderableRichTextContent(item.content),
    ),
  );
}

function getRenderableTimelineItems(items: MemorialPublicPayload["sections"]["leadership_timeline"]["items"]) {
  return sortByOrder(items).filter((item) =>
    Boolean(
      hasRenderableText(item.title) ||
        hasRenderableText(formatTimelineDate(item)) ||
        Boolean(getBestImageVariant(item.image, "medium")) ||
        hasRenderableRichTextContent(item.content),
    ),
  );
}

function getRenderableGalleryItems(items: MemorialPublicPayload["sections"]["gallery"]["items"]) {
  return sortByOrder(items).filter((item) => Boolean(getBestImageVariant(item.media_asset, "medium")));
}

function getRenderableRecordingGroups(items: MemorialPublicPayload["sections"]["recordings"]["items"]) {
  return sortByOrder(items).filter((group) =>
    Boolean(
      hasRenderableText(group.title) ||
        hasRenderableRichTextContent(group.content) ||
        hasRenderableText(group.series?.title) ||
        hasRenderableText(group.series?.description) ||
        Boolean(getBestImageVariant(group.series?.cover_image ?? null, "medium")) ||
        getRenderableRecordingItems(group.items).length > 0,
    ),
  );
}

function getRenderableRecordingItems(items: MemorialPublicPayload["sections"]["recordings"]["items"][number]["items"]) {
  return [...items]
    .filter((item) =>
      Boolean(
        hasRenderableText(item.title) ||
          hasRenderableText(item.description_excerpt) ||
          hasRenderableText(item.description) ||
          hasRenderableText(item.thumbnail_url) ||
          hasRenderableText(item.embed_url) ||
          hasRenderableText(item.external_url) ||
          hasRenderableText(item.speaker) ||
          hasRenderableText(item.scripture_reference) ||
          hasRenderableText(formatDuration(item.duration_seconds)) ||
          hasRenderableText(formatDateTime(item.published_at, null, "date")),
      ),
    )
    .sort((first, second) => {
      const firstPriority = first.priority ?? 0;
      const secondPriority = second.priority ?? 0;

      if (firstPriority !== secondPriority) {
        return secondPriority - firstPriority;
      }

      const firstDate = first.published_at ? new Date(first.published_at).getTime() : 0;
      const secondDate = second.published_at ? new Date(second.published_at).getTime() : 0;

      return secondDate - firstDate;
    });
}

function getRenderableArrangementItems(items: MemorialPublicPayload["sections"]["arrangements"]["items"]) {
  return [...items]
    .filter((item) =>
      Boolean(
        hasRenderableText(item.arrangement_type_label) ||
          hasRenderableText(item.title) ||
          hasRenderableText(formatDateTime(item.starts_at, item.ends_at)) ||
          hasRenderableText(item.location_name) ||
          hasRenderableText(item.address) ||
          hasRenderableText(item.livestream_url) ||
          Boolean(getBestImageVariant(item.programme_asset, "large")) ||
          hasRenderableRichTextContent(item.content),
      ),
    )
    .sort((first, second) => {
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

function MemorialContentShell({ children, darkMode }: { children: ReactNode; darkMode: boolean }) {
  return (
    <MemorialThemeContext.Provider value={darkMode}>
      <div className="memorial-page text-[var(--memorial-ink)]" data-memorial-theme={darkMode ? "dark" : "light"}>
        {children}
      </div>
    </MemorialThemeContext.Provider>
  );
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
          <p className="mt-5 rounded-md bg-[var(--memorial-detail-bg)] px-4 py-3 text-xs font-bold text-[var(--memorial-muted)]">
            {detail}
          </p>
        ) : null}
      </section>
    </div>
  );
}

export default MemorialPublicPage;
