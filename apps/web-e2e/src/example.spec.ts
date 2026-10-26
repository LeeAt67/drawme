import { expect, test } from '@playwright/test';

test('loads the DrawMe board', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/DrawMe/);
  await expect(page.locator('.drawnix')).toBeVisible();
  await expect(page.locator('.drawnix .plait-board-container')).toBeVisible();
});
