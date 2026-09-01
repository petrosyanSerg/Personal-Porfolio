import { expect, test, type Page } from '@playwright/test';

const DESIGN_SYSTEMS = [
  'neoclassical',
  'baroque',
  'aurora',
  'ethereal',
  'filigree',
  'acanthus',
  'anthropomorphic',
  'pixel-art',
  'conceptual-sketch',
  'luxury-typography',
  'japandi',
  'memphis',
  'bohemian',
  'shabby-chic',
  'cottagecore',
  'victorian',
  'art-deco',
  'art-nouveau',
  'mystical-western',
  'kitsch',
  'y2k',
  'bauhaus',
  'brutalism',
  'cybercore',
  'synthwave',
  'vaporwave',
  'pop-art',
  'bento-box',
  'graffiti',
  'tenebrism',
  'gothic',
  'pointillism',
  'mixed-media',
  'steampunk',
  'kawaii',
  'coquette',
  'surrealism',
  'utilitarian',
  'mid-century',
  'scrapbook',
  'frutiger-aero',
  'dark-academia',
  'light-academia',
  'wabi-sabi',
  'wild-west',
  'nautical',
  'rebus',
  'glassmorphism',
  'modular-typography',
  'neo-brutalism',
] as const;

const STORAGE_KEY = 'sp-design';

async function arriveIn(page: Page, id: string) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key as string, value as string),
    [STORAGE_KEY, id],
  );
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 12 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 16 });
  });
}

test.describe('every hero scene mounts and runs', () => {
  for (const id of DESIGN_SYSTEMS) {
    test(`${id}: renders a live canvas with no console errors`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== 'desktop',
        'the mobile policy deliberately cuts several scenes; covered separately',
      );

      test.slow();

      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));

      await arriveIn(page, id);
      await page.goto('/en');

      const slot = page.locator('[data-scene-slot]');
      await expect(slot).toHaveAttribute('data-scene', id);

      const canvas = slot.locator('canvas');
      await expect(canvas).toBeVisible({ timeout: 20_000 });

      const size = await canvas.evaluate((element) => {
        const c = element as HTMLCanvasElement;
        return { width: c.width, height: c.height };
      });
      expect(size.width).toBeGreaterThan(100);
      expect(size.height).toBeGreaterThan(100);

      await page.waitForTimeout(1200);

      expect(errors).toEqual([]);
    });
  }
});

test.describe('the mobile policy is enforced, not aspirational', () => {
  for (const id of ['victorian', 'gothic', 'steampunk', 'dark-academia'] as const) {
    test(`${id}: no canvas on a phone, and still a finished hero`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile', 'mobile project only');

      await arriveIn(page, id);
      await page.goto('/en');
      await page.waitForTimeout(2000);

      await expect(page.locator('[data-scene-slot] canvas')).toHaveCount(0);
      await expect(page.locator('h1')).toBeVisible();

      const background = await page.evaluate(
        () => getComputedStyle(document.body).backgroundColor,
      );
      expect(background).not.toBe('rgba(0, 0, 0, 0)');
    });
  }
});
