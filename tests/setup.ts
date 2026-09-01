import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';

type IOEntryInit = { isIntersecting: boolean };

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];

  disconnected = false;
  elements: Element[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }

  observe(element: Element) {
    this.elements.push(element);
  }

  unobserve(element: Element) {
    this.elements = this.elements.filter((candidate) => candidate !== element);
  }

  disconnect() {
    this.disconnected = true;
    this.elements = [];
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger({ isIntersecting }: IOEntryInit) {
    const entries = this.elements.map(
      (target) => ({ target, isIntersecting }) as unknown as IntersectionObserverEntry,
    );
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

export { MockIntersectionObserver };

let reducedMotion = false;

export function setReducedMotion(value: boolean) {
  reducedMotion = value;
}

vi.stubGlobal(
  'matchMedia',
  (query: string) =>
    ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList,
);

beforeEach(() => {
  MockIntersectionObserver.instances = [];
  reducedMotion = false;
});
