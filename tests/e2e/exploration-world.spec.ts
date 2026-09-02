import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

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

async function blockWebGL(page: Page) {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patched(
      this: HTMLCanvasElement,
      kind: string,
      ...rest: unknown[]
    ) {
      if (String(kind).startsWith('webgl')) return null;
      return (original as (...args: unknown[]) => unknown).call(this, kind, ...rest);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
}

function railButton(page: Page, name: string) {
  return page.getByRole('button', { name, exact: true });
}

function panel(page: Page, name: string) {
  return page.getByRole('region', { name, exact: true });
}

test.describe('the exploration world is navigable without a pointer', () => {
  test('a rail button opens its node, names it, and hands focus to the panel', async ({
    page,
  }) => {
    await arriveIn(page, 'aurora');
    await page.goto('/en');

    const rail = railButton(page, 'Architecture');
    await expect(rail).toBeVisible();
    await rail.focus();
    await page.keyboard.press('Enter');

    const open = panel(page, 'Architecture');
    await expect(open).toBeVisible();

    // The panel carries the real dependency stack, not a picture of one.
    await expect(open).toContainText('entities');
    await expect(open).toContainText('shared');
    await expect(rail).toHaveAttribute('aria-expanded', 'true');
    await expect(open).toBeFocused();
  });

  test('escape closes the node and gives focus back to the map', async ({ page }) => {
    await arriveIn(page, 'aurora');
    await page.goto('/en');

    const rail = railButton(page, 'Projects');
    await rail.focus();
    await page.keyboard.press('Enter');
    await expect(panel(page, 'Projects')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel(page, 'Projects')).toHaveCount(0);
    await expect(rail).toBeFocused();
  });

  test('every node is reachable and carries data from the profile', async ({ page }) => {
    await arriveIn(page, 'aurora');
    await page.goto('/en');

    const expected: Array<[string, RegExp]> = [
      ['About', /Yerevan/],
      ['Experience', /ActualSolutions/],
      ['Architecture', /widgets/],
      ['Stack', /React 19/],
      ['Projects', /MK Kredit/],
      ['Contact', /Yerevan/],
    ];

    for (const [name, content] of expected) {
      await railButton(page, name).click();
      await expect(panel(page, name)).toContainText(content);
    }
  });
});

test.describe('a world node is addressable', () => {
  test('an arriving deep link opens that node', async ({ page }) => {
    await arriveIn(page, 'aurora');
    await page.goto('/en#explore-stack');

    await expect(panel(page, 'Stack')).toBeVisible();
    await expect(panel(page, 'Stack')).toContainText('React 19');
  });

  test('opening and closing a node writes and clears the link', async ({ page }) => {
    await arriveIn(page, 'aurora');
    await page.goto('/en');

    await railButton(page, 'Experience').click();
    await expect(page).toHaveURL(/#explore-experience$/);

    await page.keyboard.press('Escape');
    await expect(page).not.toHaveURL(/#explore/);
  });
});

test.describe('the world is an enhancement, never a dependency', () => {
  test('without WebGL the map, the panels and the way out all survive', async ({
    page,
  }) => {
    await arriveIn(page, 'aurora');
    await blockWebGL(page);
    await page.goto('/en');

    await expect(page.locator('[data-scene-slot] canvas')).toHaveCount(0);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('navigation', { name: /world map/i })).toBeVisible();

    await railButton(page, 'Projects').click();
    await expect(panel(page, 'Projects')).toContainText('MK Kredit');

    await expect(page.getByRole('link', { name: /portfolio/i })).toBeVisible();
  });

  test('the recruiter can leave the world in one click', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'anchor scrolling is desktop-stable');

    await arriveIn(page, 'aurora');
    await page.goto('/en');

    await page.getByRole('link', { name: /portfolio/i }).click();
    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator('#about')).toBeInViewport();
  });

  test('the page still scrolls with the pointer over the canvas', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'wheel input is desktop only');

    await arriveIn(page, 'aurora');
    await page.goto('/en');
    await expect(page.locator('[data-scene-slot] canvas')).toBeVisible({
      timeout: 20_000,
    });

    const box = await page.locator('[data-scene-slot]').boundingBox();
    await page.mouse.move((box?.width ?? 800) * 0.8, 400);
    await page.mouse.wheel(0, 600);

    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 5_000 })
      .toBeGreaterThan(300);
  });
});

test.describe('accessibility holds in the focused state', () => {
  test('axe is clean with a node open', async ({ page }) => {
    await arriveIn(page, 'aurora');
    await page.goto('/en');

    await railButton(page, 'Stack').click();
    await expect(panel(page, 'Stack')).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe('reduced motion keeps the world, and its exits', () => {
  test.use({ reducedMotion: 'reduce' });

  test('a node still opens and still closes', async ({ page }) => {
    await arriveIn(page, 'aurora');
    await page.goto('/en');

    await railButton(page, 'Contact').click();
    await expect(panel(page, 'Contact')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(panel(page, 'Contact')).toHaveCount(0);
  });
});
