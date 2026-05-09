import { expect, test } from '@playwright/test';
import { installFixedDate, mockScriptureApi } from './fixtures/scriptureApi';

test.beforeEach(async ({ page }) => {
  await mockScriptureApi(page);
});

test('clicking the scripture Project 52 widget opens the OT reading directly', async ({ page }) => {
  await page.goto('/scripture');

  await expect(page.getByRole('heading', { level: 1, name: 'Genesis 1' })).toBeVisible();
  await page.getByRole('button', { name: /1 Samuel 14-15/i }).click();

  await expect(page.getByRole('heading', { name: '1 Samuel 14' })).toBeVisible();
  await expect(page.getByText('One day Jonathan son of Saul said to his young armor-bearer.')).toBeVisible();
});

test('scripture Project 52 widget previews the next reading and opens it directly', async ({ page }) => {
  await page.goto('/scripture');

  await expect(page.getByRole('heading', { name: "Today's Reading" })).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Next Reading' })).toBeVisible();
  await expect(page.getByText('Today is Wednesday')).toBeVisible();

  await page.getByRole('button', { name: /John 21/i }).click();

  await expect(page.getByRole('heading', { name: 'John 21' })).toBeVisible();
  await expect(page.getByText('Afterward Jesus appeared again to the disciples by the Sea of Tiberias.')).toBeVisible();
});

test('scripture Project 52 widget previous reading jumps from Monday to last Friday', async ({ page }) => {
  await installFixedDate(page, '2026-05-11T09:00:00+03:00');

  await page.goto('/scripture');

  await page.getByRole('button', { name: 'Previous', exact: true }).click();

  await expect(page.getByRole('heading', { name: 'Previous Reading' })).toBeVisible();
  await expect(page.getByText('Friday, Week 18 of 52')).toBeVisible();
  await expect(page.getByRole('button', { name: /1 Samuel 18-19/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Acts 1/i })).toBeVisible();
});

test('scripture Project 52 widget disables next reading at the end of week 52', async ({ page }) => {
  await installFixedDate(page, '2027-12-31T09:00:00+03:00');

  await page.goto('/scripture');

  await expect(page.getByText('Week 52 of 52', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
});

test('scripture Project 52 widget shows weekend catch-up mode', async ({ page }) => {
  await installFixedDate(page, '2026-05-09T09:00:00+03:00');

  await page.goto('/scripture');

  await expect(page.getByRole('heading', { name: 'Weekend Catch-Up' })).toBeVisible();
  await expect(page.getByText('Week 18 of 52')).toBeVisible();
  await expect(page.getByText("Review this week's readings or catch up where you left off.")).toBeVisible();
  await expect(page.getByText('Mon')).toBeVisible();
  await expect(page.getByRole('button', { name: /1 Samuel 7-9/i })).toBeVisible();
  await expect(page.getByText('Fri')).toBeVisible();
});

test('clicking a Project 52 tile opens the correct scripture route and chapter', async ({ page }) => {
  await page.goto('/project52');

  await page.getByRole('button', { name: /john 20/i }).click();

  await expect(page).toHaveURL(/\/scripture$/);
  await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible({ timeout: 15000 });
  await expect(
    page.getByRole('button', {
      name: /Early on the first day of the week Mary Magdalene went to the tomb\./i,
    }),
  ).toBeVisible({ timeout: 15000 });
});

test('mobile scripture dock panels close when tapping the backdrop', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/scripture');

  await page.getByRole('button', { name: /project 52/i }).click();
  await expect(page.getByRole('dialog', { name: /project 52/i })).toBeVisible();

  await page.mouse.click(12, 12);
  await expect(page.getByRole('dialog', { name: /project 52/i })).toHaveCount(0);
});

test('mobile project 52 panel closes after opening a reading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/scripture');

  await page.getByRole('button', { name: /project 52/i }).click();
  await expect(page.getByRole('dialog', { name: /project 52/i })).toBeVisible();

  await page.getByRole('button', { name: /john 20/i }).click();

  await expect(page.getByRole('dialog', { name: /project 52/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
  await expect(page.getByText('Early on the first day of the week Mary Magdalene went to the tomb.')).toBeVisible();
});

test('clicking a verse opens the scripture action sheet', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();

  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: /copy verse/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /compare verse/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /collapse scripture actions|expand scripture actions/i })).toBeVisible();
});

test('compare verse opens the chapter comparison modal focused on the selected verse', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /compare verse/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });

  await expect(comparisonDialog).toBeVisible();
  await expect(page.getByRole('button', { name: /copy verse/i })).toHaveCount(0);
  await expect(comparisonDialog.getByRole('heading', { name: 'Genesis 1', exact: true })).toBeVisible();
  await expect(comparisonDialog.getByText('Verse 1')).toBeVisible();
  await expect(
    comparisonDialog.getByRole('article').filter({
      has: page.getByText('In the beginning God created the heavens and the earth.', { exact: true }),
    }).first(),
  ).toBeVisible();
});

test('compare selection opens the chapter comparison modal with selected verses highlighted', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /Now the earth was formless and void\./i }).click();
  await page.getByRole('button', { name: /compare selection/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });

  await expect(comparisonDialog).toBeVisible();
  await expect(comparisonDialog.locator('[data-highlighted="true"][data-verse-number="1"]')).toBeVisible();
  await expect(comparisonDialog.locator('[data-highlighted="true"][data-verse-number="2"]')).toBeVisible();
  await expect(comparisonDialog.getByText('Not present in this source')).toBeVisible();
});

test('compare chapter opens the chapter comparison modal without selected verse highlights', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /expand scripture actions/i }).click();
  await page.getByRole('button', { name: /compare chapter/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });

  await expect(comparisonDialog).toBeVisible();
  await expect(comparisonDialog.locator('[data-highlighted="true"]')).toHaveCount(0);
});

test('comparison modal version selector can deselect an active version', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /compare verse/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });

  await expect(comparisonDialog).toBeVisible();
  await comparisonDialog.getByRole('button', { name: /BSB, ASV/i }).click();
  await comparisonDialog.getByRole('checkbox', { name: /ASV/i }).uncheck();

  await expect(comparisonDialog.getByRole('button', { name: /^BSB$/i })).toBeVisible();
  await expect(comparisonDialog.locator('[data-comparison-version="ASV"]')).toHaveCount(0);
  await expect(comparisonDialog.getByRole('checkbox', { name: /ASV/i })).not.toBeChecked();
});

test('comparison modal chapter picker loads another chapter', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /compare verse/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });
  await expect(comparisonDialog).toBeVisible();

  await comparisonDialog.getByRole('button', { name: 'Comparison chapter' }).click();
  await comparisonDialog.getByRole('button', { name: '2', exact: true }).click();

  await expect(page.getByRole('dialog', { name: 'Genesis 2', exact: true })).toBeVisible();
  await expect(page.getByText('Thus the heavens and the earth were completed in all their vast array.')).toBeVisible();
});

test('comparison modal closes picker menus and the modal on outside clicks', async ({ page }) => {
  await page.goto('/scripture');

  await page.getByRole('button', { name: /In the beginning God created the heavens and the earth\./i }).click();
  await page.getByRole('button', { name: /compare verse/i }).click();

  const comparisonDialog = page.getByRole('dialog', { name: 'Genesis 1', exact: true });
  await expect(comparisonDialog).toBeVisible();

  await comparisonDialog.getByRole('button', { name: /BSB, ASV/i }).click();
  await expect(comparisonDialog.getByRole('checkbox', { name: /ASV/i })).toBeVisible();

  await comparisonDialog.getByRole('heading', { name: 'Genesis 1', exact: true }).click();
  await expect(comparisonDialog.getByRole('checkbox', { name: /ASV/i })).toHaveCount(0);

  await page.mouse.click(8, 8);
  await expect(comparisonDialog).toHaveCount(0);
});

test('shared verses link opens the chapter and selects the requested verses', async ({ page }) => {
  await page.goto('/scripture?book=John&chapter=20&verses=1-2&version=BSB');

  await expect(page.getByRole('heading', { name: 'John 20' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'John 20:1-2 (BSB)' })).toBeVisible();
  await expect(page.getByRole('button', { name: /copy selection/i })).toBeVisible();
});

test('previous chapter from the first chapter opens the previous book final chapter', async ({ page }) => {
  await page.goto('/scripture?book=Acts&chapter=1&version=BSB');

  await expect(page.getByRole('heading', { name: 'Acts 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Previous chapter' }).click();

  await expect(page.getByRole('heading', { name: 'John 21' })).toBeVisible();
  await expect(page.getByText('Afterward Jesus appeared again to the disciples by the Sea of Tiberias.')).toBeVisible();
});
