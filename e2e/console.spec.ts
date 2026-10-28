import { expect, type Page, test } from '@playwright/test';
import fs from 'node:fs';

function filters(page: Page) {
  return page.getByPlaceholder('Search hash, account, amount').locator('xpath=ancestor::div[1]');
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

test.describe('desktop console', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('loads the ledger, metrics, and inspector', async ({ page }) => {
    await expect(page).toHaveTitle('Nexus Ops | Financial Telemetry Console');
    await expect(page.getByText('NEXUS // OPS')).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'tx_000001', exact: true })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'tx_000002', exact: true })).toHaveCount(0);
    await expect(page.getByRole('complementary')).toContainText('tx_000001');
    await expect(page.locator('header').getByText('Total processed')).toBeVisible();
  });

  test('filters by status and search', async ({ page }) => {
    await filters(page).getByRole('button', { name: 'Flagged', exact: true }).click();
    await expect(page.getByRole('gridcell', { name: 'tx_000009', exact: true })).toBeVisible();
    await expect(page.getByRole('gridcell', { name: 'tx_000001', exact: true })).toHaveCount(0);

    await page.getByPlaceholder('Search hash, account, amount').fill('missing-hash');
    await expect(
      page.getByRole('gridcell', { name: 'No transactions found matching the active filters.' }),
    ).toBeVisible();
  });

  test('opens a row in the inspector and moves with the keyboard', async ({ page }) => {
    await page.getByRole('gridcell', { name: 'tx_000001', exact: true }).click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(page.getByRole('complementary')).toContainText('tx_000005');
    await expect(page.getByRole('complementary')).toContainText('RISK HEURISTICS');
  });

  test('toggles the live feed from the header pill', async ({ page }) => {
    const live = page.getByRole('button', { name: /LIVE STREAMING/ });
    await expect(live.locator('img')).not.toHaveClass(/animate-pulse/);

    await live.click();
    await expect(live.locator('img')).toHaveClass(/animate-pulse/);

    await live.click();
    await expect(live.locator('img')).not.toHaveClass(/animate-pulse/);
  });

  test('exports the filtered ledger as CSV', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export CSV' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('nexus-ops-telemetry.csv');
    const file = await download.path();
    expect(file).toBeTruthy();
    const csv = fs.readFileSync(file!, 'utf8');
    expect(csv.startsWith('id,timestamp,originAccount')).toBe(true);
    expect(csv).toContain('tx_000001');
    expect(csv).not.toContain('tx_000002');
  });

  test('resets filters and cycles density from the keyboard', async ({ page }) => {
    await filters(page).getByRole('button', { name: 'Flagged', exact: true }).click();
    await expect(page.getByRole('gridcell', { name: 'tx_000001', exact: true })).toHaveCount(0);

    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.keyboard.press('r');
    await expect(page.getByRole('gridcell', { name: 'tx_000001', exact: true })).toBeVisible();

    await page.keyboard.press('d');
    await expect(filters(page).getByRole('button', { name: 'Comfortable' })).toHaveClass(/bg-fg/);
  });
});

test.describe('mobile ledger', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('opens a transaction and returns to the ledger', async ({ page }) => {
    await expect(page.getByRole('button', { name: /tx_000001/ }).first()).toBeVisible();
    await expect(page.locator('div.grid').getByText('Total processed')).toBeVisible();

    await page.getByRole('button', { name: /View$/ }).click();
    const inspector = page.getByText('Inspector', { exact: true }).locator('xpath=ancestor::div[1]');
    await expect(inspector.getByText('tx_000001', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Ledger' }).click();
    await expect(page.getByRole('button', { name: /View$/ })).toBeVisible();
    await expect(page.getByText('Inspector', { exact: true })).toHaveCount(0);
  });
});
