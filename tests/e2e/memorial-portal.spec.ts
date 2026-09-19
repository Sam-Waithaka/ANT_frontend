import { expect, test, type Page } from '@playwright/test';

const pageState = {
  id: '1', slug: 'elder-geoffrey-kirungu', status: 'draft', published_at: null, published_by: null,
  created_at: '2026-09-19T08:00:00Z', updated_at: '2026-09-19T08:00:00Z', display_name: 'Elder Geoffrey Kirungu',
  role: 'Chairman, Local Church Council', church_name: 'A.I.C Njoro Town', service_summary: 'Faithfully served as chairman for 14 years',
  birth_date: null, death_date: null, hero_heading: 'Memorial hero', hero_enabled: true,
  lcc_statement_heading: 'Official LCC statement', lcc_statement_enabled: true, life_and_service_heading: 'His life and faithful service', life_and_service_enabled: true,
  ministry_tributes_heading: 'A legacy across our ministries', ministry_tributes_enabled: true, personal_reflections_heading: 'In their own words', personal_reflections_enabled: true,
  leadership_timeline_heading: 'Fourteen years of leadership', leadership_timeline_enabled: true, gallery_heading: 'A life in pictures', gallery_enabled: true,
  recordings_heading: 'Sermons, speeches and recordings', recordings_enabled: true, arrangements_heading: 'Funeral and memorial arrangements', arrangements_enabled: true,
  family_heading: 'The family', family_enabled: true, closing_hope_heading: 'Closing hope', closing_hope_enabled: true,
  lcc_statement_attribution: '', lcc_statement_issued_on: null, ministry_tributes_intro: '', personal_reflections_intro: '', leadership_timeline_intro: '',
  gallery_intro: '', recordings_intro: '', scripture_text: '', scripture_reference: '', scripture_translation: '', scripture_attribution: '', seo_title: '', seo_description: '',
};

const capabilities = {
  page: { view: true, change: true, publish: true },
  children: {
    tribute: { view: true, add: true, change: true, delete: true, approve: true },
    milestone: { view: true, add: true, change: true, delete: true, approve: true },
    service_event: { view: true, add: true, change: true, delete: true, approve: true },
    media: { view: true, add: true, change: true, delete: true, approve: true },
  },
  media: { select: true, upload: true, replace: true, replace_with_upload: true },
};

const lexical = { root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 } };

const mockMemorialPortal = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem('aic.auth.access', 'e2e-access');
    localStorage.setItem('aic.auth.refresh', 'e2e-refresh');
  });
  await page.route('**/v1/auth/me/', async (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id: 1, username: 'editor', first_name: 'Memorial', last_name: 'Editor', permissions: [] }) }));
  await page.route('**/v1/memorials/portal/', async (route) => route.fulfill({ contentType: 'application/json', headers: { 'Cache-Control': 'no-store' }, body: JSON.stringify({ memorials: [{ id: pageState.id, slug: pageState.slug, display_name: pageState.display_name, status: pageState.status, updated_at: pageState.updated_at, public_path: `/in-memory/${pageState.slug}` }] }) }));
  await page.route('**/v1/memorials/portal/elder-geoffrey-kirungu/writeups/', async (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ slug: pageState.slug, editable: true, updated_at: pageState.updated_at, writeups: [
    { writeup_type: 'lcc_statement', object_id: null, label: 'Official LCC statement', content_json: lexical, updated_at: pageState.updated_at },
    { writeup_type: 'life_and_service', object_id: null, label: 'His life and faithful service', content_json: lexical, updated_at: pageState.updated_at },
    { writeup_type: 'arrangements', object_id: null, label: 'Funeral and memorial arrangements', content_json: lexical, updated_at: pageState.updated_at },
    { writeup_type: 'family', object_id: null, label: 'The family', content_json: lexical, updated_at: pageState.updated_at },
    { writeup_type: 'closing_hope', object_id: null, label: 'Closing hope', content_json: lexical, updated_at: pageState.updated_at },
  ] }) }));
  await page.route('**/v1/memorials/portal/elder-geoffrey-kirungu/moderation/', async (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ slug: pageState.slug, capabilities, page: pageState, publication: { ready: false, errors: { role: ['Confirm the memorial role.'] } }, tributes: [], milestones: [], service_events: [], media: [] }) }));
  await page.route('**/v1/memorials/portal/elder-geoffrey-kirungu/moderation/media/assets/', async (route) => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ assets: [] }) }));
};

test.beforeEach(async ({ page }) => mockMemorialPortal(page));

test('discovery hub builds the workspace link from backend identity', async ({ page }) => {
  await page.goto('/portal/memorials');
  const memorial = page.getByRole('link', { name: /Elder Geoffrey Kirungu/ });
  await expect(memorial).toBeVisible();
  await expect(memorial).toHaveAttribute('href', '/portal/memorials/elder-geoffrey-kirungu/overview');
});

test('desktop memorial hub, page settings and Writing Studio render from the contract', async ({ page }) => {
  await page.goto('/portal/memorials/elder-geoffrey-kirungu/overview');
  await expect(page.getByRole('heading', { level: 1, name: 'Elder Geoffrey Kirungu' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Draft' })).toBeVisible();
  await expect(page.getByText('Available workspaces')).toBeVisible();
  await expect(page.getByRole('link', { name: /Page and sections/ })).toBeVisible();

  await page.getByRole('navigation', { name: 'Memorial workspaces' }).getByRole('link', { name: 'Page', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Identity and presentation' })).toBeVisible();
  await expect(page.getByText('Memorial hero and identity')).toBeVisible();
  await expect(page.getByText('Closing hope', { exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Writing' }).click();
  await expect(page.getByText('Submit a new commissioned tribute or reflection')).toBeVisible();
  await expect(page.getByLabel('Memorial document')).toHaveValue('lcc_statement:singleton');
  await expect(page.getByRole('button', { name: 'Save draft' })).toBeDisabled();
});

test('mobile memorial navigation is accessible and has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/portal/memorials/elder-geoffrey-kirungu/overview');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  await page.getByRole('button', { name: 'Open memorial navigation' }).click();
  const memorialNavigation = page.getByRole('navigation', { name: 'Memorial workspaces' });
  await expect(memorialNavigation).toBeVisible();
  await memorialNavigation.getByRole('link', { name: 'Media', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Memorial media' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
});
