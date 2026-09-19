import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ELDER_GEOFFREY_MEMORIAL_API_SLUG,
  getMemorialPage,
  memorialSectionKeys,
} from "../api/memorialPublic";
import SiteFooter from "../components/navigation/SiteFooter";
import SiteHeader from "../components/navigation/SiteHeader";
import { useTheme } from "../hooks/useTheme";
import type { MemorialPublicPayload } from "../types/memorialPublic";
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
  const { page, sections } = payload;
  const renderedNavSections = navSectionKeys.filter((sectionKey) => shouldRenderSection(sections[sectionKey]));
  const heroReference = sections.hero.content?.scripture_references[0];
  const initials = getInitials(page.full_name);

  return (
    <MemorialContentShell>
      <header className="border-b border-[var(--memorial-line)] bg-[var(--memorial-paper)]">
        <div className="grid w-full gap-10 px-6 py-10 sm:px-8 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(20rem,30rem)_10rem] lg:items-center lg:gap-10 lg:px-[clamp(3rem,5vw,6rem)] lg:py-14 xl:grid-cols-[minmax(0,1fr)_minmax(28rem,36rem)_minmax(12rem,15rem)] xl:gap-12">
          <div className="flex min-w-0 flex-col justify-center lg:pb-10">
            <p className="text-sm font-black text-[var(--memorial-burgundy)]">In loving memory</p>
            <h1 className="mt-4 max-w-5xl text-[clamp(3.75rem,8.2vw,8.4rem)] font-black leading-[0.88] text-[var(--memorial-ink)]">
              {page.full_name}
            </h1>
            <div className="mt-5 space-y-1 text-lg text-[#222] sm:text-xl">
              <p className="font-extrabold">{page.role_title}</p>
              <p className="text-[#35302b]">{page.years_of_service}</p>
            </div>
            <span className="memorial-rule mt-7" aria-hidden="true" />
            {sections.hero.content?.content_text ? (
              <blockquote className="memorial-scripture mt-7 max-w-2xl text-2xl sm:text-3xl">
                {sections.hero.content.content_text}
              </blockquote>
            ) : null}
            {heroReference ? (
              <p className="mt-3 text-sm font-semibold text-[#4f4840]">{heroReference.display_text}</p>
            ) : null}
          </div>

          <figure className="relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-black/10 bg-[#191817] shadow-2xl shadow-black/10 lg:self-center">
            {page.portrait_image?.original_url ? (
              <img
                alt={page.portrait_image.alt_text || page.full_name}
                className="h-full w-full object-cover"
                src={page.portrait_image.original_url}
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

      <MemorialSectionNav sectionKeys={renderedNavSections} />

      <div>
        {renderedNavSections.map((sectionKey, index) => (
          <MemorialSectionFrame
            index={index}
            key={sectionKey}
            sectionKey={sectionKey}
            section={sections[sectionKey]}
          />
        ))}
      </div>
    </MemorialContentShell>
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
            {content?.content_html ? (
              <div
                className="memorial-rich-text max-w-3xl"
                dangerouslySetInnerHTML={{ __html: content.content_html }}
              />
            ) : null}
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

function shouldRenderSection(section: MemorialPublicPayload["sections"][MemorialNavSectionKey]) {
  const items = "items" in section ? section.items : [];
  return Boolean(section.content || items.length > 0);
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