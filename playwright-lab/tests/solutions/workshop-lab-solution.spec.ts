import { test, expect } from '@playwright/test';

test('finds the pending Home policy and verifies its coverage details', async ({ page }) => {
  await page.goto('/search.html');
  await expect(page.getByTestId('results-count')).toHaveText(/policies found/);

  await page.getByTestId('product-filter').selectOption('home');
  await page.getByTestId('status-filter').selectOption('pending');

  await expect(page.getByTestId('results-count')).toHaveText('1 policy found');
  await expect(page.getByTestId('policy-row')).toHaveCount(1);

  const row = page.getByRole('row', { name: /POL-100245/ });
  await expect(row).toContainText('Liam O’Brien');
  await row.getByRole('button', { name: /View details/ }).click();

  const modal = page.getByTestId('policy-detail-modal');
  await expect(modal).toBeVisible();
  await expect(modal.getByTestId('modal-policy-number')).toHaveText('POL-100245');
  await expect(modal.getByTestId('modal-coverage')).toHaveText('$310000.00');
  await expect(modal.getByTestId('modal-effective-date')).toHaveText('2025-09-01');

  await page.getByTestId('policy-modal-close').click();
  await expect(modal).toBeHidden();
});