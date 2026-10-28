import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.slice(0, 3).map((node) => node.target.join(' ')),
  }));

  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const button = document.querySelector('button');
    return button
      ? Object.getOwnPropertyNames(button).some((key) => key.startsWith('__reactProps'))
      : false;
  });
});

test.describe('accessibility', () => {
  test('desktop ledger has no violations', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByRole('grid', { name: 'Transaction ledger' })).toBeVisible();
    await expectAccessible(page);
  });

  test('desktop empty results have no violations', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByPlaceholder('Search hash, account, amount').fill('missing-hash');
    await expect(
      page.getByRole('gridcell', { name: 'No transactions found matching the active filters.' }),
    ).toBeVisible();
    await expectAccessible(page);
  });

  test('desktop inspector selection has no violations', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.getByRole('gridcell', { name: 'tx_000005', exact: true }).click();
    await expect(page.getByRole('complementary')).toContainText('tx_000005');
    await expectAccessible(page);
  });

  test('mobile ledger and inspector have no violations', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByRole('button', { name: /View$/ })).toBeVisible();
    await expectAccessible(page);

    await page.getByRole('button', { name: /View$/ }).click();
    await expect(page.getByRole('heading', { name: 'Inspector', exact: true })).toBeVisible();
    await expectAccessible(page);
  });
});
