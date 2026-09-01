'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

import styles from './ContactForm.module.scss';

const ContactForm = dynamic(() => import('./ContactForm').then((m) => m.ContactForm), {
  ssr: false,
  loading: () => <div className={styles.placeholder} aria-hidden="true" />,
});

export function ContactFormMount({ email }: { email: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container}>
      {near ? (
        <ContactForm email={email} />
      ) : (
        <div className={styles.placeholder} aria-hidden="true" />
      )}
    </div>
  );
}
