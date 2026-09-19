export type MemorialId = string;
export type MemorialTimestamp = string;
export type LexicalJson = Record<string, unknown>;

export type PortalMemorialSummary = {
  id: MemorialId;
  slug: string;
  display_name: string;
  status: 'draft' | 'published' | 'unpublished';
  updated_at: MemorialTimestamp;
  public_path: string;
};

export type PortalMemorialList = {
  memorials: PortalMemorialSummary[];
};

export type WriteupType =
  | 'lcc_statement'
  | 'life_and_service'
  | 'arrangements'
  | 'family'
  | 'closing_hope'
  | 'tribute'
  | 'milestone'
  | 'service_event';

export type PortalWriteup = {
  writeup_type: WriteupType;
  object_id: MemorialId | null;
  label: string;
  content_json: LexicalJson;
  updated_at: MemorialTimestamp;
};

export type PortalWriteupIndex = {
  slug: string;
  editable: boolean;
  updated_at: MemorialTimestamp;
  writeups: PortalWriteup[];
};

export type CrudCapability = {
  view: boolean;
  add: boolean;
  change: boolean;
  delete: boolean;
  approve: boolean;
};

export type ModerationCapabilities = {
  page: { view: boolean; change: boolean; publish: boolean };
  children: {
    tribute: CrudCapability;
    milestone: CrudCapability;
    service_event: CrudCapability;
    media: CrudCapability;
  };
  media: {
    select: boolean;
    upload: boolean;
    replace: boolean;
    replace_with_upload: boolean;
  };
};

export type ModerationPage = {
  id: MemorialId;
  slug: string;
  status: 'draft' | 'published' | 'unpublished';
  published_at: MemorialTimestamp | null;
  published_by: string | null;
  created_at: MemorialTimestamp;
  updated_at: MemorialTimestamp;
  display_name: string;
  role: string;
  church_name: string;
  service_summary: string;
  birth_date: string | null;
  death_date: string | null;
  hero_heading: string;
  hero_enabled: boolean;
  lcc_statement_heading: string;
  lcc_statement_enabled: boolean;
  life_and_service_heading: string;
  life_and_service_enabled: boolean;
  ministry_tributes_heading: string;
  ministry_tributes_enabled: boolean;
  personal_reflections_heading: string;
  personal_reflections_enabled: boolean;
  leadership_timeline_heading: string;
  leadership_timeline_enabled: boolean;
  gallery_heading: string;
  gallery_enabled: boolean;
  recordings_heading: string;
  recordings_enabled: boolean;
  arrangements_heading: string;
  arrangements_enabled: boolean;
  family_heading: string;
  family_enabled: boolean;
  closing_hope_heading: string;
  closing_hope_enabled: boolean;
  lcc_statement_attribution: string;
  lcc_statement_issued_on: string | null;
  ministry_tributes_intro: string;
  personal_reflections_intro: string;
  leadership_timeline_intro: string;
  gallery_intro: string;
  recordings_intro: string;
  scripture_text: string;
  scripture_reference: string;
  scripture_translation: string;
  scripture_attribution: string;
  seo_title: string;
  seo_description: string;
};

export type ModerationChildBase = {
  id: MemorialId;
  position: number;
  is_approved: boolean;
  approved_at: MemorialTimestamp | null;
  approved_by: string | null;
  created_at: MemorialTimestamp;
  updated_at: MemorialTimestamp;
};

export type ModerationTribute = ModerationChildBase & {
  kind: 'ministry' | 'personal';
  ministry_name: string;
  author_name: string;
  author_role: string;
  content_json: LexicalJson;
};

export type ModerationMilestone = ModerationChildBase & {
  date_label: string;
  occurred_on: string | null;
  title: string;
  content_json: LexicalJson;
};

export type ModerationServiceEvent = ModerationChildBase & {
  kind: 'prayer_meeting' | 'memorial_service' | 'funeral';
  title: string;
  event_date: string | null;
  starts_at: MemorialTimestamp | null;
  ends_at: MemorialTimestamp | null;
  date_label: string;
  location_name: string;
  location_address: string;
  content_json: LexicalJson;
  livestream_url: string;
};

export type MediaProcessingCode =
  | 'invalid'
  | 'unavailable'
  | 'pending'
  | 'processing'
  | 'failed'
  | 'missing_rendition'
  | 'changed'
  | 'ready_unapproved'
  | 'ready'
  | 'external';

export type MediaPurpose =
  | 'hero'
  | 'seo'
  | 'life_and_service'
  | 'tribute_image'
  | 'milestone_image'
  | 'gallery'
  | 'recording'
  | 'programme'
  | 'family';

export type ModerationMedia = ModerationChildBase & {
  source_kind: 'image' | 'recording' | 'programme';
  purpose: MediaPurpose;
  asset_uuid: string | null;
  external_url: string | null;
  tribute_id: MemorialId | null;
  milestone_id: MemorialId | null;
  display_title: string;
  caption: string;
  alt_text: string;
  credit: string;
  provider: 'youtube' | 'external' | null;
  recording_kind: 'sermon' | 'speech' | 'audio' | 'video' | null;
  speaker_name: string | null;
  recorded_on: string | null;
  duration_seconds: number | null;
  programme_format: 'pdf' | 'webpage' | null;
  provenance: 'uploaded_here' | 'borrowed' | 'external';
  processing: {
    code: MediaProcessingCode;
    label: string;
    can_approve: boolean;
    publicly_available: boolean;
  };
};

export type PublicationReadiness = {
  ready: boolean;
  errors: Record<string, string[]>;
};

export type ModerationWorkspace = {
  slug: string;
  capabilities: ModerationCapabilities;
  page: ModerationPage;
  publication: PublicationReadiness;
  tributes: ModerationTribute[];
  milestones: ModerationMilestone[];
  service_events: ModerationServiceEvent[];
  media: ModerationMedia[];
};

export type ChildType = 'tribute' | 'milestone' | 'service_event' | 'media';
export type ModerationObject = ModerationTribute | ModerationMilestone | ModerationServiceEvent | ModerationMedia;

export type ModerationObjectResponse = {
  object_type: ChildType;
  object: ModerationObject;
  page_updated_at: MemorialTimestamp;
};

export type SelectableAsset = {
  uuid: string;
  title: string;
  alt_text: string;
  status: string;
  width: number | null;
  height: number | null;
  preview: { url: string; width: number; height: number } | null;
};

export type PageUpdatePayload = Partial<Omit<ModerationPage,
  'id' | 'slug' | 'status' | 'published_at' | 'published_by' | 'created_at' | 'updated_at'
>> & { expected_updated_at: MemorialTimestamp };

export type TributeCreatePayload = {
  expected_page_updated_at: MemorialTimestamp;
  kind: 'ministry' | 'personal';
  ministry_name: string;
  author_name: string;
  author_role: string;
  content_json: LexicalJson;
  position: number;
};

export type MilestoneCreatePayload = {
  expected_page_updated_at: MemorialTimestamp;
  date_label: string;
  occurred_on: string | null;
  title: string;
  content_json: LexicalJson;
  position: number;
};

export type ServiceEventCreatePayload = {
  expected_page_updated_at: MemorialTimestamp;
  kind: 'prayer_meeting' | 'memorial_service' | 'funeral';
  title: string;
  event_date: string | null;
  starts_at: MemorialTimestamp | null;
  ends_at: MemorialTimestamp | null;
  date_label: string;
  location_name: string;
  location_address: string;
  content_json: LexicalJson;
  livestream_url: string;
  position: number;
};

export type ExternalMediaCreatePayload = {
  expected_page_updated_at: MemorialTimestamp;
  source_kind: 'recording' | 'programme';
  external_url: string;
  display_title: string;
  provider: 'youtube' | 'external';
  recording_kind?: 'sermon' | 'speech' | 'audio' | 'video';
  speaker_name?: string;
  recorded_on?: string | null;
  duration_seconds?: number | null;
  programme_format?: 'pdf' | 'webpage';
  caption: string;
  credit: string;
  position: number;
};

export type ChildCreatePayload = TributeCreatePayload | MilestoneCreatePayload | ServiceEventCreatePayload | ExternalMediaCreatePayload;

export type BorrowedImagePayload = {
  asset_uuid: string;
  purpose: Exclude<MediaPurpose, 'recording' | 'programme'>;
  alt_text: string;
  caption: string;
  credit: string;
  position: number;
  tribute_id: MemorialId | null;
  milestone_id: MemorialId | null;
  expected_page_updated_at: MemorialTimestamp;
};

export type UploadImagePayload = Omit<BorrowedImagePayload, 'asset_uuid'> & {
  upload: File;
  title: string;
  public_availability_confirmed: true;
};

export type ReplacementPayload = {
  alt_text: string;
  caption: string | null;
  credit: string | null;
  expected_page_updated_at: MemorialTimestamp;
  expected_link_updated_at: MemorialTimestamp;
};

export const emptyLexicalDocument = (): LexicalJson => ({
  root: {
    children: [],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
});
