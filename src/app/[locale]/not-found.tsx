import { getTranslations } from 'next-intl/server';

import { Container } from '@/components/ui/Container';
import { Link } from '@/i18n/navigation';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <main id="content">
      <Container width="sm" as="section">
        <div style={{ paddingBlock: 'var(--space-13)' }}>
          <h1 style={{ fontSize: 'var(--fs-display-2)', marginBottom: 'var(--space-4)' }}>
            {t('title')}
          </h1>
          <p style={{ marginBottom: 'var(--space-6)' }}>{t('body')}</p>
          <Link href="/" style={{ color: 'var(--color-accent-text)' }}>
            {t('cta')}
          </Link>
        </div>
      </Container>
    </main>
  );
}
