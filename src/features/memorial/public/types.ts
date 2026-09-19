export type PublicMemorialRichText = {
  content_html: string;
  content_json: Record<string, unknown>;
};

export type PublicMemorialImageVariant = {
  format: 'jpeg' | 'webp' | 'avif' | string;
  height: number;
  size: 'thumb' | 'small' | 'medium' | 'large' | string;
  url: string;
  width: number;
};

export type PublicMemorialImage = {
  alt_text: string;
  caption: string | null;
  credit: string | null;
  height: number;
  id: string;
  url: string;
  variants: PublicMemorialImageVariant[];
  width: number;
};

export type PublicMemorialRecording = {
  caption: string | null;
  credit: string | null;
  duration_seconds: number | null;
  embed_url: string | null;
  id: string;
  kind: 'sermon' | 'speech' | 'audio' | 'video';
  provider: 'youtube' | 'external';
  recorded_on: string | null;
  speaker_name: string | null;
  title: string;
  url: string;
};

export type PublicMemorialProgramme = {
  caption: string | null;
  credit: string | null;
  format: 'pdf' | 'webpage';
  id: string;
  provider: 'external';
  title: string;
  url: string;
};

export type PublicMemorialLivestream = {
  embed_url: string | null;
  provider: 'youtube' | 'external';
  url: string;
};

export type PublicMemorialScripture = {
  attribution: string | null;
  reference: string;
  text: string[];
  translation: string | null;
};

export type PublicMemorialHeroSection = {
  birth_date: string | null;
  church_name: string;
  death_date: string | null;
  display_name: string;
  heading: string;
  image: PublicMemorialImage | null;
  role: string;
  service_summary: string[];
};

export type PublicMemorialStatementSection = {
  attribution: string | null;
  body: PublicMemorialRichText;
  heading: string;
  issued_on: string | null;
};

export type PublicMemorialImageStorySection = {
  body: PublicMemorialRichText;
  heading: string;
  images: PublicMemorialImage[];
};

export type PublicMemorialTribute = {
  author_name: string;
  author_role: string | null;
  body: PublicMemorialRichText;
  id: string;
  images: PublicMemorialImage[];
  ministry_name?: string;
};

export type PublicMemorialTributeSection = {
  heading: string;
  intro: string[];
  items: PublicMemorialTribute[];
};

export type PublicMemorialMilestone = {
  date_label: string;
  description: PublicMemorialRichText;
  id: string;
  images: PublicMemorialImage[];
  occurred_on: string | null;
  title: string;
};

export type PublicMemorialTimelineSection = {
  heading: string;
  intro: string[];
  items: PublicMemorialMilestone[];
};

export type PublicMemorialGallerySection = {
  heading: string;
  intro: string[];
  items: PublicMemorialImage[];
};

export type PublicMemorialRecordingsSection = {
  heading: string;
  intro: string[];
  items: PublicMemorialRecording[];
};

export type PublicMemorialServiceEvent = {
  date_label: string | null;
  details: PublicMemorialRichText;
  ends_at: string | null;
  event_date: string | null;
  id: string;
  kind: 'prayer_meeting' | 'memorial_service' | 'funeral';
  livestream: PublicMemorialLivestream | null;
  location_address: string | null;
  location_name: string | null;
  starts_at: string | null;
  title: string;
};

export type PublicMemorialArrangementsSection = {
  body: PublicMemorialRichText;
  heading: string;
  items: PublicMemorialServiceEvent[];
  programmes: PublicMemorialProgramme[];
  timezone: 'Africa/Nairobi';
};

export type PublicMemorialClosingHopeSection = {
  body: PublicMemorialRichText;
  heading: string;
  scripture: PublicMemorialScripture | null;
};

export type PublicMemorialSections = {
  arrangements?: PublicMemorialArrangementsSection;
  closing_hope?: PublicMemorialClosingHopeSection;
  family?: PublicMemorialImageStorySection;
  gallery?: PublicMemorialGallerySection;
  hero?: PublicMemorialHeroSection;
  lcc_statement?: PublicMemorialStatementSection;
  leadership_timeline?: PublicMemorialTimelineSection;
  life_and_service?: PublicMemorialImageStorySection;
  ministry_tributes?: PublicMemorialTributeSection;
  personal_reflections?: PublicMemorialTributeSection;
  recordings?: PublicMemorialRecordingsSection;
};

export type PublicMemorialSeo = {
  canonical_path: string;
  description: string | null;
  image: PublicMemorialImage | null;
  title: string;
};

export type PublicMemorial = {
  schema_version: 1;
  sections: PublicMemorialSections;
  seo: PublicMemorialSeo;
  slug: string;
  updated_at: string;
};
