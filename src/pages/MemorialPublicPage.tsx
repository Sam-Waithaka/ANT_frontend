import { useEffect, useState, type ReactNode } from "react";
import {
  ELDER_GEOFFREY_MEMORIAL_API_SLUG,
  getMemorialPage,
  memorialSectionKeys,
} from "../api/memorialPublic";
import type { MemorialPublicPayload } from "../types/memorialPublic";

const memorialEndpointPath = `/v1/memorial/public/pages/${ELDER_GEOFFREY_MEMORIAL_API_SLUG}/`;

type MemorialSectionKey = (typeof memorialSectionKeys)[number];

type MemorialRequestState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error"; message: string }
  | { status: "ready"; payload: MemorialPublicPayload };

const friendlySectionLabels: Record<MemorialSectionKey, string> = {
  hero: "Memorial Hero",
  official_statement: "Official LCC Statement",
  life_service: "His Life And Faithful Service",
  ministry_legacy: "A Legacy Across Our Ministries",
  personal_tributes: "In Their Own Words",
  leadership_timeline: "Fourteen Years Of Leadership",
  gallery: "A Life In Pictures",
  recordings: "Sermons, Speeches And Recordings",
  arrangements: "Funeral And Memorial Arrangements",
  family: "The Family",
  closing_hope: "Closing Hope",
};

function MemorialPublicPage() {
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

  if (requestState.status === "loading") {
    return (
      <MemorialShell>
        <MemorialStatusCard
          eyebrow="Memorial"
          title="Loading memorial page"
          message="We are preparing the public memorial details."
        />
      </MemorialShell>
    );
  }

  if (requestState.status === "not-found") {
    return (
      <MemorialShell>
        <MemorialStatusCard
          eyebrow="404"
          title="Memorial page not found"
          message="This memorial page may not be published yet, or its public link may have changed."
          detail={`Backend returned 404 for ${memorialEndpointPath}`}
        />
      </MemorialShell>
    );
  }

  if (requestState.status === "error") {
    return (
      <MemorialShell>
        <MemorialStatusCard
          eyebrow="Memorial"
          title="We could not load this memorial"
          message={`${requestState.message}. Please try again shortly.`}
          detail={`Request path: ${memorialEndpointPath}`}
        />
      </MemorialShell>
    );
  }

  return <MemorialReadyState payload={requestState.payload} />;
}

function MemorialReadyState({ payload }: { payload: MemorialPublicPayload }) {
  const { page, sections } = payload;

  return (
    <MemorialShell>
      <header className="border-b border-[#1d1b18]/10 bg-[#fffdf8]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8 lg:px-10">
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-[#a30f19]">
            In loving memory
          </div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-5xl font-black leading-[0.92] text-[#141414] sm:text-6xl lg:text-7xl">
                {page.full_name}
              </h1>
              <div className="mt-5 space-y-1 text-lg text-[#262626]">
                <p className="font-bold">{page.role_title}</p>
                <p>{page.years_of_service}</p>
              </div>
              {page.summary ? (
                <p className="mt-6 max-w-3xl text-base leading-7 text-[#4b4640]">{page.summary}</p>
              ) : null}
            </div>
            <MemorialMediaPresence payload={payload} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 lg:px-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {memorialSectionKeys.map((sectionKey) => {
            const section = sections[sectionKey];
            const items = "items" in section ? section.items : undefined;

            return (
              <article
                className="rounded-lg border border-[#1d1b18]/10 bg-white p-5 shadow-sm shadow-black/5"
                key={sectionKey}
              >
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a30f19]">
                  {sectionKey}
                </p>
                <h2 className="mt-3 text-xl font-black text-[#151515]">
                  {friendlySectionLabels[sectionKey]}
                </h2>
                <dl className="mt-4 space-y-2 text-sm text-[#5f5850]">
                  <div className="flex justify-between gap-4">
                    <dt>Content</dt>
                    <dd className="font-bold text-[#24211e]">
                      {section.content ? "Present" : "Not supplied"}
                    </dd>
                  </div>
                  {Array.isArray(items) ? (
                    <div className="flex justify-between gap-4">
                      <dt>Items</dt>
                      <dd className="font-bold text-[#24211e]">{items.length}</dd>
                    </div>
                  ) : null}
                </dl>
              </article>
            );
          })}
        </section>

      </main>
    </MemorialShell>
  );
}

function MemorialMediaPresence({ payload }: { payload: MemorialPublicPayload }) {
  const { page } = payload;

  return (
    <aside className="rounded-lg border border-[#1d1b18]/10 bg-[#f1ede5] p-5 text-sm text-[#4d4740]">
      <h2 className="text-base font-black text-[#151515]">Phase 1 media contract</h2>
      <dl className="mt-4 space-y-3">
        <div className="flex justify-between gap-4">
          <dt>Portrait image</dt>
          <dd className="font-bold text-[#24211e]">{page.portrait_image ? "Present" : "Null"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Hero image</dt>
          <dd className="font-bold text-[#24211e]">{page.hero_image ? "Present" : "Null"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Published</dt>
          <dd className="font-bold text-[#24211e]">{page.published_at || "Not supplied"}</dd>
        </div>
      </dl>
    </aside>
  );
}

function MemorialShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#f8f5ef] text-[#151515]">{children}</div>;
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
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <section className="max-w-xl rounded-lg border border-[#1d1b18]/10 bg-white p-8 text-center shadow-xl shadow-black/5">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#a30f19]">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-black text-[#141414]">{title}</h1>
        <p className="mt-4 leading-7 text-[#5f5850]">{message}</p>
        {detail ? (
          <p className="mt-5 rounded-md bg-[#f3eee5] px-4 py-3 text-xs font-bold text-[#4c453d]">
            {detail}
          </p>
        ) : null}
      </section>
    </main>
  );
}

export default MemorialPublicPage;
