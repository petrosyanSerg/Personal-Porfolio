import AxeBuilder from '@axe-core/playwright';
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

const AUDITED = [
  'aurora',
  'kitsch',
  'tenebrism',
  'brutalism',
  'neo-brutalism',
  'wabi-sabi',
  'y2k',
  'cybercore',
  'coquette',
  'luxury-typography',
] as const;

const STORAGE_KEY = 'sp-design';
const SESSION_KEY = 'sp-design-session';

async function arriveIn(page: Page, id: string) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key as string, value as string),
    [STORAGE_KEY, id],
  );
}

function openLab(page: Page) {
  return page.locator('header button[aria-haspopup="dialog"]').first();
}

async function scrollSettled(page: Page) {
  await page.waitForFunction(
    () =>
      new Promise<boolean>((resolve) => {
        const start = window.scrollY;
        setTimeout(() => resolve(window.scrollY === start), 150);
      }),
    undefined,
    { timeout: 10_000 },
  );
}

test.describe('every design system loads', () => {
  for (const id of DESIGN_SYSTEMS) {
    test(`${id}: renders, paints a ground, and keeps one h1`, async ({ page }) => {
      await arriveIn(page, id);
      await page.goto('/en');

      await expect(page.locator('html')).toHaveAttribute('data-design', id);

      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toContainText(/\S/);

      const background = await page.evaluate(
        () => getComputedStyle(document.body).backgroundColor,
      );
      expect(background).not.toBe('rgba(0, 0, 0, 0)');
    });
  }

  test('the lab offers exactly the registered worlds', async ({ page }) => {
    await page.goto('/en');
    await openLab(page).click();

    const options = page.locator('dialog ul button');
    await expect(options).toHaveCount(DESIGN_SYSTEMS.length);
  });

  test('the lab filters, and clears back to the full set', async ({ page }) => {
    await page.goto('/en');
    await openLab(page).click();

    const options = page.locator('dialog ul button');
    const search = page.locator('dialog input[type="search"]');

    await search.fill('concrete');
    await expect(options).toHaveCount(2);

    await search.fill('Bauhaus');
    await expect(options).toHaveCount(1);

    await search.fill('');
    await expect(options).toHaveCount(DESIGN_SYSTEMS.length);

    await search.fill('zzzznotathing');
    await expect(options).toHaveCount(0);
  });
});

test.describe('switching', () => {
  test('is instant, keeps the scroll position and reloads nothing', async ({ page }) => {
    test.slow();

    await page.goto('/en');

    await page.evaluate(() => {
      (window as unknown as { __probe?: string }).__probe = 'survives';
    });

    await page.evaluate(() =>
      document.getElementById('experience')?.scrollIntoView({ behavior: 'instant' }),
    );
    await scrollSettled(page);

    const experienceTop = () =>
      page.evaluate(() =>
        Math.round(
          document.getElementById('experience')?.getBoundingClientRect().top ?? NaN,
        ),
      );

    await openLab(page).click();

    await scrollSettled(page);

    await expect
      .poll(
        async () =>
          page.evaluate(() => {
            const element = document.getElementById('experience');
            if (!element) return Number.NaN;
            element.scrollIntoView({ behavior: 'instant' });
            return Math.round(element.getBoundingClientRect().top);
          }),
        { timeout: 15_000 },
      )
      .toBeLessThan(160);

    await scrollSettled(page);
    const anchored = await experienceTop();
    expect(anchored).toBeLessThan(160);

    await page
      .locator('dialog ul button', { hasText: 'Pixel Art' })
      .first()
      .dispatchEvent('click');

    await expect(page.locator('html')).toHaveAttribute('data-design', 'pixel-art');

    await expect
      .poll(async () => Math.abs((await experienceTop()) - anchored), {
        timeout: 8000,
      })
      .toBeLessThan(24);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);

    const probe = await page.evaluate(
      () => (window as unknown as { __probe?: string }).__probe,
    );
    expect(probe).toBe('survives');
  });

  test('survives a reload', async ({ page }) => {
    await page.goto('/en');
    await openLab(page).click();
    await page.locator('dialog ul button', { hasText: 'Filigree' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-design', 'filigree');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-design', 'filigree');
  });

  test('survives navigation to another route', async ({ page }) => {
    await arriveIn(page, 'luxury-typography');
    await page.goto('/en');
    await page.getByRole('link', { name: 'Projects' }).first().click();
    await expect(page).toHaveURL(/\/en\/projects$/);
    await expect(page.locator('html')).toHaveAttribute(
      'data-design',
      'luxury-typography',
    );
  });

  test('an unknown stored value is treated as no choice at all', async ({ page }) => {
    await arriveIn(page, 'not-a-real-world');
    await page.goto('/en');

    const world = await page.locator('html').getAttribute('data-design');
    expect(DESIGN_SYSTEMS).toContain(world);
  });
});

test.describe('a first-time visitor is dealt a world', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('lands in a real one, chosen before first paint', async ({ page }) => {
    await page.goto('/en');

    const world = await page.locator('html').getAttribute('data-design');
    expect(DESIGN_SYSTEMS).toContain(world);

    const ground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(ground).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('the draw is not recorded as a choice', async ({ page }) => {
    await page.goto('/en');

    const [choice, session] = await page.evaluate(
      ([c, s]) => [
        window.localStorage.getItem(c as string),
        window.sessionStorage.getItem(s as string),
      ],
      [STORAGE_KEY, SESSION_KEY],
    );

    expect(choice).toBeNull();
    expect(DESIGN_SYSTEMS).toContain(session);
  });

  test('holds still across a reload and a hard navigation', async ({ page }) => {
    await page.goto('/en');
    const drawn = await page.locator('html').getAttribute('data-design');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-design', drawn!);

    await page.goto('/en/projects');
    await expect(page.locator('html')).toHaveAttribute('data-design', drawn!);
  });

  test('different arrivals do not all land in the same world', async ({
    browser,
    baseURL,
  }) => {
    const drawn = new Set<string>();

    for (let visit = 0; visit < 12; visit += 1) {
      const context = await browser.newContext({ baseURL });
      const page = await context.newPage();
      await page.goto('/en');
      drawn.add((await page.locator('html').getAttribute('data-design')) ?? '');
      await context.close();
    }

    expect(drawn.size).toBeGreaterThan(1);
  });

  test('a choice ends the draw for good', async ({ page }) => {
    await page.goto('/en');

    await openLab(page).click();
    await page.locator('dialog ul button', { hasText: 'Cybercore' }).first().click();
    await expect(page.locator('html')).toHaveAttribute('data-design', 'cybercore');

    const choice = await page.evaluate(
      (key) => window.localStorage.getItem(key as string),
      STORAGE_KEY,
    );
    expect(choice).toBe('cybercore');

    await page.evaluate(
      (key) => window.sessionStorage.removeItem(key as string),
      SESSION_KEY,
    );
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('data-design', 'cybercore');
  });
});

test.describe('the lab is a real dialog', () => {
  test('opens, traps nothing behind it, and closes on Escape', async ({ page }) => {
    await page.goto('/en');
    const dialog = page.locator('dialog');

    await expect(dialog).toBeHidden();
    await openLab(page).click();
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('closes from its own button, and can be reopened', async ({ page }) => {
    await page.goto('/en');
    const dialog = page.locator('dialog');

    await openLab(page).click();
    await expect(dialog).toBeVisible();

    await page.locator('dialog button[aria-label]').first().click();
    await expect(dialog).toBeHidden();

    await openLab(page).click();
    await expect(dialog).toBeVisible();
  });

  test('is reachable and operable by keyboard alone', async ({ page }) => {
    await page.goto('/en');
    const trigger = openLab(page);
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('dialog')).toBeVisible();

    const inside = await page.evaluate(
      () => document.activeElement?.closest('dialog') !== null,
    );
    expect(inside).toBe(true);
  });
});

test.describe('accessibility across worlds', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        get: () => ({ saveData: true }),
      });
    });
  });

  for (const id of AUDITED) {
    test(`axe: ${id}`, async ({ page }) => {
      await arriveIn(page, id);
      await page.goto('/en');

      await page.waitForFunction(
        () =>
          [...document.querySelectorAll('[data-enter]')].every((element) =>
            element
              .getAnimations()
              .every((animation) => animation.playState !== 'running'),
          ),
        undefined,
        { timeout: 10_000 },
      );

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }

  test('axe is clean inside the lab itself', async ({ page }) => {
    test.slow();

    await page.goto('/en');
    await openLab(page).click();
    await expect(page.locator('dialog ul button').first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe('cost of a world', () => {
  test('a visit downloads one scene, not fifty', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop only');

    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 12 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 16 });
    });

    const chunks: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/_next/static/chunks/')) chunks.push(request.url());
    });

    await arriveIn(page, 'bauhaus');
    await page.goto('/en');
    await expect(page.locator('[data-scene-slot] canvas')).toBeVisible({
      timeout: 15_000,
    });

    await expect(page.locator('[data-scene-slot]')).toHaveAttribute(
      'data-scene',
      'bauhaus',
    );

    expect(chunks.length).toBeLessThan(40);
  });

  test('Save-Data downloads no scene at all', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop only');

    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'connection', {
        get: () => ({ saveData: true }),
      });
    });

    await arriveIn(page, 'aurora');
    await page.goto('/en');
    await page.waitForTimeout(2500);

    await expect(page.locator('[data-scene-slot] canvas')).toHaveCount(0);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('a world with no ornament vocabulary renders no ornament SVG', async ({
    page,
  }) => {
    await arriveIn(page, 'luxury-typography');
    await page.goto('/en');
    await expect(page.locator('section svg[data-corner]')).toHaveCount(0);

    await arriveIn(page, 'filigree');
    await page.goto('/en');
    await expect(page.locator('section svg[data-corner]')).toHaveCount(4);
  });
});

test.describe('responsive across worlds', () => {
  for (const id of [
    'baroque',
    'pixel-art',
    'luxury-typography',
    'ethereal',
    'gothic',
    'brutalism',
    'kitsch',
    'bento-box',
  ] as const) {
    test(`${id}: no horizontal overflow at 375px`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'viewport driven by the test');
      await page.setViewportSize({ width: 375, height: 812 });
      await arriveIn(page, id);
      await page.goto('/en');
      await page.waitForTimeout(500);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test.describe('reduced motion across worlds', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the most animated world settles with no transform', async ({ page }) => {
    await arriveIn(page, 'aurora');
    await page.goto('/en');

    const about = page.locator('#about p').first();
    await expect(about).toBeVisible();
    const transform = await about.evaluate((el) => getComputedStyle(el).transform);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
  });

  test('no custom cursor is mounted', async ({ page }) => {
    await arriveIn(page, 'pixel-art');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');
    await expect(page.locator('[data-cursor-kind]')).toHaveCount(0);
  });

  test('the readout holds still instead of cycling', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'the readout is desktop-only');

    await arriveIn(page, 'utilitarian');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');

    const counter = page.locator('[data-hero-readout]').first();
    await expect(counter).toBeVisible();

    const first = await counter.textContent();
    await page.waitForTimeout(3200);
    expect(await counter.textContent()).toBe(first);
  });
});
