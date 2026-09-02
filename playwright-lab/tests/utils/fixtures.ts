import type { Page } from '@playwright/test';

/**
 * 報價表單流程的共用 fixtures，在 core-flow、solution 與 diagnostics
 * 等 spec 間重複使用，讓「已知正確」情境及其預期數字
 * 只需在單一地方維護。
 *
 * 預期數字來自 server/quote.js 中的確定性公式：
 *   baseRate(auto) = 45
 *   coverageLoading = 20000 * 0.0008 = 16
 *   age at 2025-01-10 for dob 1990-06-15 = 34 (25-40 bracket -> 0% surcharge)
 *   monthlyPremium = (45 + 16) * 1.0 = 61.00
 *   annualPremium  = 61 * 12 * 0.95 = 695.40
 */
export const sampleQuoteRequest = {
  fullName: 'Jordan Blake',
  email: 'jordan.blake@example.com',
  dob: '1990-06-15',
  product: 'auto',
  coverageAmount: '20000',
  startDate: '2025-01-10',
};

export const sampleQuoteExpected = {
  baseRate: '$45.00',
  coverageLoading: '$16.00',
  ageSurcharge: '0%',
  monthlyPremium: '$61.00',
  annualPremium: '$695.40',
  quoteIdPattern: /^Q-AUT-[0-9A-F]{6}$/,
};

export async function fillQuoteForm(page: Page, request = sampleQuoteRequest): Promise<void> {
  await page.getByTestId('full-name').fill(request.fullName);
  await page.getByTestId('email').fill(request.email);
  await page.getByTestId('dob').fill(request.dob);
  await page.getByTestId('product').selectOption(request.product);
  await page.getByTestId('coverage-amount').fill(request.coverageAmount);
  await page.getByTestId('start-date').fill(request.startDate);
}
