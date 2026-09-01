import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const LOCALES = ['en', 'ru', 'hy'] as const;

const ROUTES = [
  '',
  '/projects',
  '/projects/mk-kredit',
  '/projects/ai-native-workflow',
  '/resume',
] as const;

test.describe('routing and content', () => {
  for (const locale of LOCALES) {
    test(`${locale}: home renders the headline as the only h1`, async ({ page }) => {
      await page.goto(`/${locale}`);
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).not.toBeEmpty();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
    });
  }

  test('root redirects to the default locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });

  test('every home section is present', async ({ page }) => {
    await page.goto('/en');
    for (const id of [
      'about',
      'experience',
      'architecture',
      'ai-native',
      'stack',
      'projects',
      'journey',
      'contact',
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });

  test('a blocked case study has no route', async ({ page }) => {
    const response = await page.goto('/en/projects/springbme');
    expect(response?.status()).toBe(404);
  });

  test('navigating to a case study and back preserves locale', async ({ page }) => {
    await page.goto('/ru/projects');
    await page
      .getByRole('link', { name: /MK Kredit/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/ru\/projects\/mk-kredit$/);
  });
});

test.describe('language switching', () => {
  async function openSwitcher(page: Page) {
    const menu = page.locator('header button[aria-controls="mobile-nav"]');
    if (await menu.isVisible()) await menu.click();
  }

  test('preserves the current path', async ({ page }) => {
    await page.goto('/en/projects/mk-kredit');
    await openSwitcher(page);
    await page.getByRole('link', { name: 'Русский' }).click();
    await expect(page).toHaveURL(/\/ru\/projects\/mk-kredit$/);
  });

  test('marks the active locale', async ({ page }) => {
    await page.goto('/en');
    await openSwitcher(page);
    await expect(page.getByRole('link', { name: 'English' })).toHaveAttribute(
      'aria-current',
      'true',
    );
  });
});

test.describe('contact form', () => {
  test('surfaces validation errors and does not submit', async ({ page }) => {
    await page.goto('/en');
    await page.evaluate(() =>
      document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' }),
    );
    const submit = page.getByRole('button', { name: 'Send message' });
    await expect(submit).toBeVisible({ timeout: 20_000 });
    await submit.click();
    await expect(page.getByText('Please enter your name.')).toBeVisible();
    await expect(page.getByText('Please enter your email address.')).toBeVisible();
  });

  test('accepts a valid submission', async ({ page }) => {
    await page.route('**/api/contact', (route) =>
      route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) }),
    );
    await page.goto('/en');
    await page.evaluate(() =>
      document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' }),
    );
    await expect(page.getByLabel('Name')).toBeVisible({ timeout: 20_000 });
    await page.getByLabel('Name').fill('Test Person');
    await page.getByLabel('Email').fill('test@example.com');
    await page
      .getByLabel('Message')
      .fill('This is a message long enough to pass validation checks.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText(/I'll reply within a couple of days/)).toBeVisible();
  });
});

test.describe('3D scene', () => {
  test('mounts a canvas on desktop', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop only');
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 12 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 16 });
    });
    await page.goto('/en');
    await expect(page.locator('[data-scene-slot] canvas')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('degrades to the world itself without WebGL', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function patched(
        this: HTMLCanvasElement,
        type: string,
        ...rest: unknown[]
      ) {
        if (type === 'webgl2' || type === 'webgl') return null;
        return (original as never as (...a: unknown[]) => unknown).call(
          this,
          type,
          ...rest,
        );
      } as typeof HTMLCanvasElement.prototype.getContext;
    });
    await page.goto('/en');
    await page.waitForTimeout(1200);

    await expect(page.locator('[data-scene-slot] canvas')).toHaveCount(0);
    await expect(page.locator('h1')).toBeVisible();

    const ground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );
    expect(ground).not.toBe('rgba(0, 0, 0, 0)');

    const heroHeight = await page
      .locator('section[aria-labelledby="hero-heading"]')
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(heroHeight).toBeGreaterThan(400);
  });
});

test.describe('hero', () => {
  test('the six modules are real text, not only geometry', async ({ page }) => {
    await page.goto('/en');

    const alternative = page.locator('section .visually-hidden li');
    await expect(alternative).toHaveCount(6);
    await expect(alternative.first()).toContainText('React 19');
  });

  test('the headline is server-rendered text', async ({ page }) => {
    const response = await page.request.get('/en');
    const html = await response.text();
    expect(html).toContain('I build enterprise frontends that hold their shape.');
    expect(html).toContain('Sergey Petrosyan');
  });

  test('the instrument readout names every module in turn', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop only');
    await page.addInitScript(() => {
      window.localStorage.setItem('sp-design', 'utilitarian');
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 12 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 16 });
    });
    await page.goto('/en');

    const readout = page.locator('[data-hero-readout]');
    await expect(readout).toBeVisible();
    await expect(readout).toContainText('01/06');

    await expect(readout).toContainText('02/06', { timeout: 6000 });
    await expect(readout).toContainText(/State & data|Frontend|Quality/);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('renders content with no entrance transform', async ({ page }) => {
    await page.goto('/en');
    const about = page.locator('#about p').first();
    await expect(about).toBeVisible();
    const transform = await about.evaluate((el) => getComputedStyle(el).transform);
    expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(transform);
  });
});

test.describe('responsive', () => {
  for (const width of [320, 375, 390, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'desktop', 'viewport driven by the test');
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/en');
      await page.waitForTimeout(400);

      const documentOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(documentOverflow).toBeLessThanOrEqual(0);

      const overflow = await page.evaluate(() => {
        const limit = document.documentElement.clientWidth;
        return [...document.querySelectorAll('*')]
          .filter((el) => {
            if (el.closest('[data-bleed]')) return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.right > limit + 1;
          })
          .map(
            (el) => el.tagName + '.' + (el.className?.toString?.() ?? '').slice(0, 40),
          );
      });
      expect(overflow).toEqual([]);
    });
  }
});

test.describe('accessibility', () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      test(`axe: /${locale}${route}`, async ({ page }) => {
        await page.goto(`/${locale}${route}`);
        await page.waitForTimeout(500);

        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        expect(results.violations).toEqual([]);
      });
    }
  }
});

test.describe('themes', () => {
  const THEMES = ['dark', 'light', 'cinematic'] as const;

  for (const theme of THEMES) {
    test(`${theme}: axe is clean and the ground is painted`, async ({ page }) => {
      await page.addInitScript((value) => {
        window.localStorage.setItem('sp-theme', value);
      }, theme);
      await page.goto('/en');
      await page.waitForTimeout(1600);

      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }

  test('the toggle cycles dark → light → cinematic and remembers the choice', async ({
    page,
  }) => {
    await page.goto('/en');
    const html = page.locator('html');
    const toggle = page.locator('header button[aria-label*="theme" i]').first();

    await expect(html).toHaveAttribute('data-theme', 'dark');
    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'cinematic');
    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await page.reload();
    await expect(html).toHaveAttribute('data-theme', 'light');
  });

  test('the cinematic atmosphere is off in every other theme', async ({ page }) => {
    await page.goto('/en');

    const fogOpacity = () =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue('--atmos-fog').trim(),
      );

    expect(await fogOpacity()).toBe('0');

    await page.locator('header button[aria-label*="theme" i]').first().click();
    await page.locator('header button[aria-label*="theme" i]').first().click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cinematic');

    expect(await fogOpacity()).toBe('1');
  });
});

test.describe('interaction', () => {
  test('the diagram explains the dependency rule on hover', async ({ page }) => {
    await page.goto('/en');
    await page.locator('#architecture').scrollIntoViewIfNeeded();

    const slabs = page.locator('#architecture button');
    await expect(slabs).toHaveCount(6);

    await slabs.nth(2).hover();
    await expect(slabs.nth(2)).toHaveAttribute('data-active', 'true');
    await expect(page.locator('#architecture button[data-permitted]')).toHaveCount(3);
    await expect(slabs.nth(0)).not.toHaveAttribute('data-permitted', /.*/);
  });

  test('a card carries the label the cursor shows', async ({ page }) => {
    await page.goto('/en/projects');
    const labelled = page.locator('[data-cursor-label]').first();
    await expect(labelled).toHaveAttribute('data-cursor-label', /\S/);
  });

  test('scroll progress advances', async ({ page }) => {
    await page.goto('/en');
    const progress = () =>
      page.evaluate(() =>
        Number(
          getComputedStyle(document.documentElement).getPropertyValue(
            '--scroll-progress',
          ),
        ),
      );

    expect(await progress()).toBeLessThan(0.05);

    for (let i = 0; i < 3; i += 1) {
      await page.evaluate(() =>
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }),
      );
      await page.waitForTimeout(250);
    }

    expect(await progress()).toBeGreaterThan(0.9);
  });
});

test.describe('seo', () => {
  test('canonical and reciprocal hreflang on every locale', async ({ page }) => {
    for (const locale of LOCALES) {
      await page.goto(`/${locale}`);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        new RegExp(`/${locale}$`),
      );
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hreflang="hy"]')).toHaveCount(1);
      await expect(
        page.locator('link[rel="alternate"][hreflang="x-default"]'),
      ).toHaveCount(1);
    }
  });

  test('JSON-LD parses and identifies the person', async ({ page }) => {
    await page.goto('/en');
    const raw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    const parsed = JSON.parse(raw ?? '{}');
    const person = parsed['@graph'].find(
      (n: { '@type': string }) => n['@type'] === 'Person',
    );
    expect(person.name).toBe('Sergey Petrosyan');
    expect(JSON.stringify(person.knowsAbout)).not.toContain('Full-Stack');
  });

  test('sitemap and robots are reachable', async ({ request }) => {
    expect((await request.get('/sitemap.xml')).status()).toBe(200);
    expect((await request.get('/robots.txt')).status()).toBe(200);
  });
});
