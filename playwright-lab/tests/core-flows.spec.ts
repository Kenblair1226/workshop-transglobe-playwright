import { test, expect } from '@playwright/test';
import { fillQuoteForm, sampleQuoteExpected, sampleQuoteRequest } from './utils/fixtures';

/**
 * 涵蓋入口網站兩大主要旅程的核心流程測試：
 * 查詢現有保單，以及產生新報價。
 */
test.describe('policy search flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search.html');
    // 每個測試與頁面互動前，必須先等初始（未篩選）列表載入
    // 完成 — 使用真實的就緒信號而非固定的 sleep。
    await expect(page.getByTestId('results-count')).toHaveText(/policies found/);
  });

  test('finds a single policy by holder name', async ({ page }) => {
    await page.getByTestId('search-input').fill('Alice');

    await expect(page.getByTestId('results-count')).toHaveText('1 policy found');
    const row = page.getByTestId('policy-row');
    await expect(row).toHaveCount(1);
    await expect(row.getByTestId('policy-number')).toHaveText('POL-100234');
    await expect(row.getByTestId('policy-product')).toHaveText('Auto');
  });

  test('finds a single policy by exact policy number', async ({ page }) => {
    await page.getByTestId('search-input').fill('POL-100238');

    await expect(page.getByTestId('results-count')).toHaveText('1 policy found');
    await expect(page.getByTestId('policy-holder')).toHaveText('Elena Petrova');
  });

  test('filters by product', async ({ page }) => {
    await page.getByTestId('product-filter').selectOption('life');

    await expect(page.getByTestId('results-count')).toHaveText('2 policies found');
    const products = page.getByTestId('policy-product');
    await expect(products).toHaveCount(2);
    for (const product of await products.all()) {
      await expect(product).toHaveText('Life');
    }
  });

  test('filters by status', async ({ page }) => {
    await page.getByTestId('status-filter').selectOption('expired');

    await expect(page.getByTestId('results-count')).toHaveText('2 policies found');
    const statuses = page.getByTestId('policy-status');
    await expect(statuses).toHaveCount(2);
    for (const status of await statuses.all()) {
      await expect(status).toHaveText('Expired');
    }
  });

  test('shows an empty state when nothing matches', async ({ page }) => {
    await page.getByTestId('search-input').fill('no-such-policy-xyz');

    await expect(page.getByTestId('results-count')).toHaveText('0 policies found');
    await expect(page.getByTestId('empty-state')).toBeVisible();
    await expect(page.getByTestId('policy-row')).toHaveCount(0);
  });

  test('opens and closes the policy detail modal with correct data', async ({ page }) => {
    await page.getByTestId('search-input').fill('Brian Osei');
    await expect(page.getByTestId('results-count')).toHaveText('1 policy found');

    await page.getByRole('button', { name: 'View details for Brian Osei' }).click();

    const modal = page.getByTestId('policy-detail-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByTestId('modal-policy-number')).toHaveText('POL-100235');
    await expect(modal.getByTestId('modal-product')).toHaveText('Home');
    await expect(modal.getByTestId('modal-status')).toHaveText('Active');
    await expect(modal.getByTestId('modal-premium')).toHaveText('$112.75');
    await expect(modal.getByTestId('modal-coverage')).toHaveText('$350000.00');

    await page.getByTestId('policy-modal-close').click();
    await expect(modal).toBeHidden();
  });
});

test.describe('quote flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quote.html');
  });

  test('calculates a quote with the expected deterministic breakdown', async ({ page }) => {
    await fillQuoteForm(page);
    await page.getByTestId('get-quote-btn').click();

    const result = page.getByTestId('quote-result');
    await expect(result).toBeVisible();
    await expect(page.getByTestId('quote-monthly')).toHaveText(sampleQuoteExpected.monthlyPremium);
    await expect(page.getByTestId('quote-annual')).toHaveText(sampleQuoteExpected.annualPremium);
    await expect(page.getByTestId('quote-base-rate')).toHaveText(sampleQuoteExpected.baseRate);
    await expect(page.getByTestId('quote-coverage-loading')).toHaveText(sampleQuoteExpected.coverageLoading);
    await expect(page.getByTestId('quote-age-surcharge')).toHaveText(sampleQuoteExpected.ageSurcharge);
    await expect(page.getByTestId('quote-id')).toHaveText(sampleQuoteExpected.quoteIdPattern);
  });

  test('applies an age surcharge for younger applicants', async ({ page }) => {
    await fillQuoteForm(page, {
      fullName: 'Casey Young',
      email: 'casey.young@example.com',
      dob: '2005-01-01',
      product: 'auto',
      coverageAmount: '20000',
      startDate: '2025-01-10',
    });
    await page.getByTestId('get-quote-btn').click();

    // 生效日年齡 20 -> 15% 加費：(45 + 16) * 1.15 = 70.15
    await expect(page.getByTestId('quote-age-surcharge')).toHaveText('15%');
    await expect(page.getByTestId('quote-monthly')).toHaveText('$70.15');
  });

  test('shows inline validation errors for an incomplete submission', async ({ page }) => {
    await page.getByTestId('get-quote-btn').click();

    await expect(page.getByTestId('form-alert')).toBeVisible();
    await expect(page.getByTestId('full-name-error')).not.toHaveText('');
    await expect(page.getByTestId('email-error')).not.toHaveText('');
    await expect(page.getByTestId('quote-result')).toBeHidden();
  });

  test('rejects an invalid email address', async ({ page }) => {
    await fillQuoteForm(page, { ...sampleQuoteRequest, email: 'not-an-email' });
    await page.getByTestId('get-quote-btn').click();

    await expect(page.getByTestId('email-error')).toHaveText(/valid email/i);
    await expect(page.getByTestId('quote-result')).toBeHidden();
  });
});
