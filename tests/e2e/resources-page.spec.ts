import { expect, test } from '@playwright/test';

test('resources page renders the public Read landing page without mobile overflow', async ({ page }) => {
  await page.goto('/resources');

  await expect(page.getByRole('link', { name: 'Resources' })).toHaveClass(/bg-red-800/);
  await expect(page.getByRole('heading', { level: 1, name: 'Read' })).toBeVisible();
  await expect(page.getByText('Articles, Bible studies, pastoral guidance, and devotional reflections.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Walking Through Acts 12' })).toBeVisible();
  await expect(page.getByText('Featured Collections')).toBeVisible();
  await expect(page.getByText('Browse Scripture')).toBeVisible();
  await expect(page.getByText('Browse Ministry')).toBeVisible();
  await expect(page.getByText('Stay updated with our latest resources.')).toBeVisible();

  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(desktopOverflow).toBe(false);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  await expect(page.getByRole('heading', { level: 1, name: 'Read' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Subscribe via RSS/i })).toBeVisible();

  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(mobileOverflow).toBe(false);
});
