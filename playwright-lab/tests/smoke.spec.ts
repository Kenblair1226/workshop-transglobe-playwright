import { test, expect } from '@playwright/test';

/**
 * 冒煙測試：快速、高層次地確認入口網站的頁面與 API
 * 能正常啟動。這些應該是任何部署或設定變更後第一個執行的測試。
 */
test.describe('smoke', () => {
  test('home page loads with branding and navigation', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page).toHaveTitle(/TransGlobe Insurance/);
    await expect(page.getByRole('link', { name: 'TransGlobe Insurance' })).toBeVisible();

    // 限定於主導覽，因為下方的 hero 區塊也有
    // "Search Policies" / "Get a Quote" 的 call-to-action 連結。
    const primaryNav = page.getByRole('navigation', { name: 'Primary' });
    await expect(primaryNav.getByRole('link', { name: 'Search Policies' })).toBeVisible();
    await expect(primaryNav.getByRole('link', { name: 'Get a Quote' })).toBeVisible();
  });

  test('navigating to the search page from the home hero works', async ({ page }) => {
    await page.goto('/index.html');
    await page.getByTestId('cta-search').click();
    await expect(page).toHaveURL(/\/search\.html$/);
    await expect(page.getByRole('heading', { name: 'Search Policies' })).toBeVisible();
  });

  test('navigating to the quote page from the home hero works', async ({ page }) => {
    await page.goto('/index.html');
    await page.getByTestId('cta-quote').click();
    await expect(page).toHaveURL(/\/quote\.html$/);
    await expect(page.getByRole('heading', { name: 'Get a Quote' })).toBeVisible();
  });

  test('policy search API responds with the full in-memory dataset', async ({ request }) => {
    const response = await request.get('/api/policies?q=&product=all&status=all');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.count).toBeGreaterThan(0);
    expect(Array.isArray(body.results)).toBe(true);
  });

  test('unknown routes return a friendly 404 page', async ({ request }) => {
    const response = await request.get('/this-page-does-not-exist.html');
    expect(response.status()).toBe(404);
    expect(await response.text()).toContain('Page not found');
  });
});
