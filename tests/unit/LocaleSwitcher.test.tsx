import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import en from '@/content/en.json';
import { locales, type Locale } from '@/config/i18n';

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/projects/mk-kredit',
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const { LocaleSwitcher } = await import('@/components/layout/LocaleSwitcher');

function renderIn(locale: Locale) {
  return render(
    <NextIntlClientProvider locale={locale} messages={en}>
      <LocaleSwitcher />
    </NextIntlClientProvider>,
  );
}

describe('LocaleSwitcher', () => {
  it('offers every enabled locale, named in its own script', () => {
    renderIn('en');

    expect(screen.getAllByRole('link')).toHaveLength(locales.length);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Русский')).toBeInTheDocument();
    expect(screen.getByText('Հայերեն')).toBeInTheDocument();
  });

  it('marks exactly the active locale as current', () => {
    renderIn('ru');

    const current = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current'));

    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Русский');
    expect(current[0]).toHaveAttribute('data-active', 'true');
  });

  it('preserves the current path when switching', () => {
    renderIn('en');

    expect(screen.getByText('Հայերեն').closest('a')).toHaveAttribute(
      'href',
      '/hy/projects/mk-kredit',
    );
  });

  it('tags each option with its own lang, so screen readers switch voice', () => {
    renderIn('en');

    expect(screen.getByText('Հայերեն').closest('a')).toHaveAttribute('lang', 'hy');
    expect(screen.getByText('Русский').closest('a')).toHaveAttribute('lang', 'ru');
  });

  it('names the active locale in the landmark label', () => {
    renderIn('hy');

    expect(screen.getByRole('navigation').getAttribute('aria-label')).toContain(
      'Armenian',
    );
  });
});
