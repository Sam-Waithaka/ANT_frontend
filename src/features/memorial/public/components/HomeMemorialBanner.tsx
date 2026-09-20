import { useEffect, useId, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getMemorialPage } from "../../../../api/memorialPublic";
import type { MemorialPublicPayload } from "../../../../types/memorialPublic";
import {
  HOME_MEMORIAL_BANNER_API_SLUG,
  HOME_MEMORIAL_BANNER_ENABLED,
  HOME_MEMORIAL_BANNER_ROUTE,
} from "../homeMemorialBannerConfig";
import { getBestMemorialImageVariant } from "../media";

type HomeMemorialBannerProps = {
  darkMode?: boolean;
  enabled?: boolean;
};

type BannerState =
  | { status: "loading" }
  | { status: "hidden" }
  | { payload: MemorialPublicPayload; status: "ready" };

const fallbackName = "Elder Geoffrey Kirungu";
const fallbackRole = "Chairman, A.I.C Njoro Town Local Church Council";
const fallbackServiceLine = "Fourteen years of faithful service";
const fallbackTribute =
  "We honour a beloved brother and faithful servant whose leadership left an enduring mark on our fellowship.";

const themeClasses = (darkMode: boolean) => ({
  cta: `order-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-red-800 px-6 py-3 text-sm font-black text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 ${
    darkMode ? "focus:ring-offset-[#171412]" : "focus:ring-offset-[#f8f5ef]"
  }`,
  loading: darkMode
    ? {
        cta: "bg-red-700/50",
        portrait: "border-stone-100/15 bg-white/10",
        section: "border-b-2 border-red-800 bg-[#181512] text-stone-100",
        skeletonStrong: "bg-white/15",
        skeletonSoft: "bg-white/10",
      }
    : {
        cta: "bg-red-800/20",
        portrait: "border-red-900/15 bg-red-950/5",
        section: "border-b-2 border-red-800 bg-[#f8f2e8] text-zinc-950",
        skeletonStrong: "bg-red-950/12",
        skeletonSoft: "bg-red-950/8",
      },
  name: darkMode ? "text-[#fff8ec]" : "text-zinc-950",
  overline: darkMode ? "text-stone-300/85" : "text-red-900",
  portrait: darkMode
    ? "border-[#d7b778] bg-black/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
    : "border-red-900/20 bg-white/70 shadow-[0_12px_32px_rgba(24,24,27,0.10)]",
  role: darkMode ? "text-stone-100/90" : "text-zinc-900",
  section: darkMode
    ? "border-b-2 border-red-800 bg-[radial-gradient(circle_at_14%_50%,rgba(185,28,28,0.18),transparent_32%),linear-gradient(90deg,#211d1a_0%,#171412_58%,#11100f_100%)] text-stone-100"
    : "border-b-2 border-red-800 bg-[radial-gradient(circle_at_14%_50%,rgba(153,27,27,0.08),transparent_34%),linear-gradient(90deg,#fffaf2_0%,#f8f2e8_56%,#efe5d6_100%)] text-zinc-950",
  service: darkMode ? "text-stone-200/90" : "text-red-950/80",
  tribute: darkMode ? "text-stone-200/85" : "text-zinc-700",
});

const HomeMemorialBanner = ({
  darkMode = false,
  enabled = HOME_MEMORIAL_BANNER_ENABLED,
}: HomeMemorialBannerProps) => {
  const headingId = useId();
  const [state, setState] = useState<BannerState>(() => (enabled ? { status: "loading" } : { status: "hidden" }));
  const styles = themeClasses(darkMode);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let ignore = false;

    void getMemorialPage(HOME_MEMORIAL_BANNER_API_SLUG)
      .then((payload) => {
        if (ignore) {
          return;
        }

        if (!payload?.page.published_at) {
          setState({ status: "hidden" });
          return;
        }

        setState({ payload, status: "ready" });
      })
      .catch(() => {
        if (!ignore) {
          setState({ status: "hidden" });
        }
      });

    return () => {
      ignore = true;
    };
  }, [enabled]);

  if (!enabled || state.status === "hidden") {
    return null;
  }

  if (state.status === "loading") {
    return (
      <section
        aria-busy="true"
        aria-label="Loading memorial announcement"
        className={`${styles.loading.section} px-4 py-6 sm:px-6 lg:py-7`}
      >
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-[5.5rem_minmax(0,1fr)] lg:grid-cols-[7rem_minmax(0,1fr)_auto] lg:items-center">
          <div className={`aspect-[4/5] w-20 rounded-sm border sm:w-[5.5rem] lg:w-28 ${styles.loading.portrait}`} />
          <div className="space-y-3">
            <div className={`h-3 w-40 rounded-full ${styles.loading.skeletonStrong}`} />
            <div className={`h-8 max-w-xl rounded-full ${styles.loading.skeletonStrong}`} />
            <div className={`h-4 max-w-2xl rounded-full ${styles.loading.skeletonSoft}`} />
          </div>
          <div className={`hidden h-12 w-36 rounded-full lg:block ${styles.loading.cta}`} />
        </div>
      </section>
    );
  }

  const { page } = state.payload;
  const portraitVariant = getBestMemorialImageVariant(page.portrait_image, "medium", { allowOriginal: false });
  const name = page.full_name || fallbackName;
  const role = page.role_title || fallbackRole;
  const serviceLine = page.years_of_service || fallbackServiceLine;
  const tribute = page.summary || fallbackTribute;
  const portraitAlt = page.portrait_image?.alt_text || `Portrait of ${name}`;

  return (
    <section aria-labelledby={headingId} className={`${styles.section} px-4 py-6 sm:px-6 sm:py-7 lg:py-8`}>
      <div
        className={`mx-auto grid max-w-6xl gap-5 sm:items-center lg:gap-8 ${
          portraitVariant
            ? "sm:grid-cols-[6rem_minmax(0,1fr)] lg:grid-cols-[7.5rem_minmax(0,1fr)_auto]"
            : "lg:grid-cols-[minmax(0,1fr)_auto]"
        }`}
      >
        <div className={portraitVariant ? "order-2 min-w-0 sm:col-start-2 lg:col-start-2" : "order-2 min-w-0 lg:col-start-1"}>
          <p className={`text-[0.68rem] font-black uppercase leading-none tracking-[0.42em] ${styles.overline}`}>
            In loving memory
          </p>
          <h2
            className={`mt-2 max-w-3xl font-serif text-[clamp(2rem,9vw,2.75rem)] font-bold leading-[1.02] sm:text-[clamp(2.35rem,6vw,3.2rem)] lg:text-[3.15rem] ${styles.name}`}
            id={headingId}
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {name}
          </h2>
          <p className={`mt-2 max-w-3xl text-base leading-6 sm:text-lg ${styles.role}`}>
            {role}
          </p>
          <p className={`mt-1 max-w-3xl font-serif text-base italic leading-6 sm:text-lg ${styles.service}`}>
            {serviceLine}
          </p>
          <p className={`mt-2 max-w-4xl text-sm leading-6 sm:text-base ${styles.tribute}`}>
            {tribute}
          </p>
        </div>

        <Link
          className={`${styles.cta} ${
            portraitVariant
              ? "sm:col-start-2 sm:w-fit lg:col-start-3 lg:justify-self-end"
              : "sm:w-fit lg:col-start-2 lg:justify-self-end"
          }`}
          to={HOME_MEMORIAL_BANNER_ROUTE}
        >
          View Memorial
          <ArrowRight aria-hidden="true" size={18} strokeWidth={2.2} />
        </Link>

        {portraitVariant ? (
          <figure className={`order-1 w-20 overflow-hidden rounded-sm sm:col-start-1 sm:row-span-2 sm:w-24 lg:w-[7.25rem] ${styles.portrait}`}>
            <img
              alt={portraitAlt}
              className="aspect-[4/5] h-full w-full object-cover"
              height={portraitVariant.height ?? 460}
              loading="eager"
              src={portraitVariant.url}
              width={portraitVariant.width ?? 368}
            />
          </figure>
        ) : null}
      </div>
    </section>
  );
};

export default HomeMemorialBanner;