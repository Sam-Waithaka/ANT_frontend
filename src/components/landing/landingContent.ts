export const heroCtas = [
  {
    label: 'Join Us This Sunday',
    href: '/project52',
    variant: 'primary',
  },
  {
    label: 'Explore Scripture',
    href: '/scripture',
    variant: 'secondary',
  },
] as const;

export const dailyVerse = {
  label: 'Daily Verse',
  reference: 'Ephesians 2:10',
  version: 'BSB',
  text: 'For we are His workmanship, created in Christ Jesus for good works, which God prepared beforehand as our way of life.',
};

export const project52Preview = {
  eyebrow: 'Project 52',
  heading: "A Journey Through God's Word",
  description: 'Read through the Bible week by week with our church community across 52 intentional weeks.',
  ctaLabel: 'View Plan',
  weekLabel: 'Week 20 of 52',
  progressLabel: '38% Complete',
  progressValue: 38,
  readingLabel: "This Week's Reading",
  reading: 'Psalms 23-29',
  verseLine: 'The Lord is my shepherd; I shall not want.',
  days: [
    { label: 'Mon', state: 'complete' },
    { label: 'Tue', state: 'complete' },
    { label: 'Wed', state: 'complete' },
    { label: 'Thu', state: 'active' },
    { label: 'Fri', state: 'upcoming' },
  ],
} as const;
