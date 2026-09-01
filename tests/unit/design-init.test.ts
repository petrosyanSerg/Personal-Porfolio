import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DESIGN_ATTRIBUTE,
  DESIGN_SESSION_KEY,
  DESIGN_STORAGE_KEY,
  designInitScript,
  designSystemIds,
} from '@/design-system';

function arrive(): string | null {
  new Function(designInitScript)();
  return document.documentElement.getAttribute(DESIGN_ATTRIBUTE);
}

function forget(): void {
  localStorage.clear();
  sessionStorage.clear();
  document.documentElement.removeAttribute(DESIGN_ATTRIBUTE);
}

function newSession(): void {
  sessionStorage.clear();
  document.documentElement.removeAttribute(DESIGN_ATTRIBUTE);
}

afterEach(() => {
  vi.restoreAllMocks();
  forget();
});

describe('a visitor who has never chosen a world', () => {
  it('is dealt one of the fifty', () => {
    forget();
    expect(designSystemIds).toContain(arrive());
  });

  it('draws from the whole registry, not a hand-maintained subset', () => {
    expect(designInitScript).toContain(JSON.stringify(designSystemIds));
  });

  it('is not always dealt the same world', () => {
    const drawn = new Set<string>();

    for (let visit = 0; visit < 200; visit += 1) {
      forget();
      drawn.add(arrive() ?? '');
    }

    expect(drawn.size).toBeGreaterThan(10);
  });

  it('is not quietly pinned to the first world in the tuple', () => {
    const first = designSystemIds[0];
    let elsewhere = 0;

    for (let visit = 0; visit < 50; visit += 1) {
      forget();
      if (arrive() !== first) elsewhere += 1;
    }

    expect(elsewhere).toBeGreaterThan(0);
  });

  it('is NOT recorded as having chosen anything', () => {
    forget();
    arrive();

    expect(localStorage.getItem(DESIGN_STORAGE_KEY)).toBeNull();
  });
});

describe('the drawn world holds still for the rest of the visit', () => {
  it('survives a refresh', () => {
    forget();
    const first = arrive();

    document.documentElement.removeAttribute(DESIGN_ATTRIBUTE);
    expect(arrive()).toBe(first);
  });

  it('is remembered in the session key, and only there', () => {
    forget();
    const drawn = arrive();

    expect(sessionStorage.getItem(DESIGN_SESSION_KEY)).toBe(drawn);
    expect(localStorage.getItem(DESIGN_STORAGE_KEY)).toBeNull();
  });

  it('is redrawn in a new session', () => {
    forget();
    arrive();

    newSession();
    expect(sessionStorage.getItem(DESIGN_SESSION_KEY)).toBeNull();
    expect(designSystemIds).toContain(arrive());
    expect(sessionStorage.getItem(DESIGN_SESSION_KEY)).not.toBeNull();
  });
});

describe('an explicit choice outranks the draw', () => {
  it('wins over a world already drawn for this session', () => {
    forget();
    sessionStorage.setItem(DESIGN_SESSION_KEY, 'gothic');
    localStorage.setItem(DESIGN_STORAGE_KEY, 'cybercore');

    expect(arrive()).toBe('cybercore');
  });

  it('survives every future session', () => {
    forget();
    localStorage.setItem(DESIGN_STORAGE_KEY, 'cybercore');

    for (let session = 0; session < 20; session += 1) {
      newSession();
      expect(arrive()).toBe('cybercore');
    }
  });
});

describe('nonsense in storage costs a world, never the page', () => {
  it('falls through to the draw when the saved choice is not a world', () => {
    forget();
    localStorage.setItem(DESIGN_STORAGE_KEY, 'not-a-real-world');

    expect(designSystemIds).toContain(arrive());
  });

  it('redraws when the session value is not a world', () => {
    forget();
    sessionStorage.setItem(DESIGN_SESSION_KEY, 'not-a-real-world');

    const drawn = arrive();
    expect(designSystemIds).toContain(drawn);
    expect(sessionStorage.getItem(DESIGN_SESSION_KEY)).toBe(drawn);
  });

  it('still deals a world when storage itself throws', () => {
    forget();
    const denied = () => {
      throw new Error('storage denied');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(denied);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(denied);

    expect(designSystemIds).toContain(arrive());
  });
});
