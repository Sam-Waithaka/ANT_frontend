import type { PublicMemorial, PublicMemorialRichText } from './types';

const previewEnabled = () =>
  import.meta.env.DEV || import.meta.env.VITE_MEMORIAL_PREVIEW_FALLBACK === 'true';

const richText = (...paragraphs: string[]): PublicMemorialRichText => ({
  content_html: paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join(''),
  content_json: {
    root: {
      children: paragraphs.map((paragraph) => ({
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: paragraph,
            type: 'text',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'paragraph',
        version: 1,
      })),
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  },
});

const elderGeoffreyKirunguPreview: PublicMemorial = {
  schema_version: 1,
  slug: 'elder-geoffrey-kirungu',
  updated_at: '2026-09-19T08:00:00Z',
  seo: {
    canonical_path: '/in-memory/elder-geoffrey-kirungu',
    description: 'In loving memory of Elder Geoffrey Kirungu.',
    image: null,
    title: 'In memory of Elder Geoffrey Kirungu',
  },
  sections: {
    hero: {
      birth_date: null,
      church_name: 'A.I.C Njoro Town',
      death_date: null,
      display_name: 'Elder Geoffrey Kirungu',
      heading: 'Memorial hero',
      image: null,
      role: 'Chairman, Local Church Council',
      service_summary: ['Faithfully served as chairman for 14 years'],
    },
    lcc_statement: {
      attribution: 'A.I.C Njoro Town Local Church Council',
      body: richText(
        'Our hearts are heavy, yet filled with hope, as we announce that our beloved chairman and brother, Elder Geoffrey Kirungu, has entered into the presence of our Savior.',
        'As a church, we give thanks to God for his faithful service, godly example and steadfast commitment to the work of Christ among us.',
      ),
      heading: 'A message from our church',
      issued_on: null,
    },
    life_and_service: {
      body: richText('Approved biography to be supplied.'),
      heading: 'His life and faithful service',
      images: [],
    },
    ministry_tributes: {
      heading: 'A legacy across our ministries',
      intro: ['His influence continues through the lives he has touched in our church.'],
      items: [
        {
          author_name: 'Ministry representative',
          author_role: null,
          body: richText('Approved ministry statement.'),
          id: 'preview-ministry-1',
          images: [],
          ministry_name: 'Ministry tribute 01',
        },
        {
          author_name: 'Ministry representative',
          author_role: null,
          body: richText('Approved ministry statement.'),
          id: 'preview-ministry-2',
          images: [],
          ministry_name: 'Ministry tribute 02',
        },
        {
          author_name: 'Ministry representative',
          author_role: null,
          body: richText('Approved ministry statement.'),
          id: 'preview-ministry-3',
          images: [],
          ministry_name: 'Ministry tribute 03',
        },
      ],
    },
    personal_reflections: {
      heading: 'A commissioned reflection',
      intro: [],
      items: [
        {
          author_name: 'Approved attribution',
          author_role: null,
          body: richText('A commissioned reflection will appear here.'),
          id: 'preview-reflection-1',
          images: [],
        },
      ],
    },
    leadership_timeline: {
      heading: 'Fourteen years of leadership',
      intro: ['A steady servant. A lasting impact. Fourteen years of faithful leadership in our Local Church Council.'],
      items: [
        {
          date_label: 'Verified milestone',
          description: richText('Details to be supplied.'),
          id: 'preview-milestone-1',
          images: [],
          occurred_on: null,
          title: 'Verified milestone',
        },
        {
          date_label: 'Verified milestone',
          description: richText('Details to be supplied.'),
          id: 'preview-milestone-2',
          images: [],
          occurred_on: null,
          title: 'Verified milestone',
        },
        {
          date_label: 'Verified milestone',
          description: richText('Details to be supplied.'),
          id: 'preview-milestone-3',
          images: [],
          occurred_on: null,
          title: 'Verified milestone',
        },
      ],
    },
    gallery: {
      heading: 'A life in pictures',
      intro: ['Moments from a life well lived. A visual tribute will be added here.'],
      items: [],
    },
    recordings: {
      heading: 'Sermons, speeches and recordings',
      intro: ['Messages of faith, encouragement and service. Recordings will be added here once approved.'],
      items: [],
    },
    arrangements: {
      body: richText('We will share the arrangements here once they are confirmed.'),
      heading: 'Funeral and memorial arrangements',
      items: [
        {
          date_label: 'Details to be announced',
          details: richText('Details to be announced.'),
          ends_at: null,
          event_date: null,
          id: 'preview-event-1',
          kind: 'prayer_meeting',
          livestream: null,
          location_address: null,
          location_name: null,
          starts_at: null,
          title: 'Prayer gathering',
        },
        {
          date_label: 'Details to be announced',
          details: richText('Details to be announced.'),
          ends_at: null,
          event_date: null,
          id: 'preview-event-2',
          kind: 'memorial_service',
          livestream: null,
          location_address: null,
          location_name: null,
          starts_at: null,
          title: 'Memorial service',
        },
        {
          date_label: 'Details to be announced',
          details: richText('Details to be announced.'),
          ends_at: null,
          event_date: null,
          id: 'preview-event-3',
          kind: 'funeral',
          livestream: null,
          location_address: null,
          location_name: null,
          starts_at: null,
          title: 'Funeral service',
        },
      ],
      programmes: [],
      timezone: 'Africa/Nairobi',
    },
    family: {
      body: richText('Please keep Esther Kirungu, their children, grandchildren, and the entire family in your prayers.'),
      heading: 'The family',
      images: [],
    },
    closing_hope: {
      body: richText('Our hope in Christ.'),
      heading: 'Our hope',
      scripture: {
        attribution: null,
        reference: '2 Corinthians 5:8',
        text: ['To be absent from the body is to be present with the Lord.'],
        translation: null,
      },
    },
  },
};

export const getPublicMemorialPreview = (slug: string) => {
  if (!previewEnabled() || slug !== elderGeoffreyKirunguPreview.slug) return null;
  return elderGeoffreyKirunguPreview;
};
