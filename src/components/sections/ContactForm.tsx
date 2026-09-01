'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';

import { contactSchema, type ContactInput } from '@/lib/contact-schema';

import styles from './ContactForm.module.scss';

type Status = 'idle' | 'sending' | 'success' | 'error';

export function ContactForm({ email }: { email: string }) {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<Status>('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: 'onBlur',
  });

  async function onSubmit(values: ContactInput) {
    setStatus('sending');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error(String(response.status));

      setStatus('success');
      reset();
    } catch {
      setStatus('error');
    }
  }

  const message = (key?: string) =>
    key ? t(`validation.${key}` as 'validation.nameRequired') : undefined;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.field}>
        <label htmlFor="contact-name" className={styles.label}>
          {t('form.name')}
        </label>
        <input
          id="contact-name"
          className={styles.input}
          placeholder={t('form.namePlaceholder')}
          autoComplete="name"
          aria-invalid={errors.name ? 'true' : undefined}
          aria-describedby={errors.name ? 'contact-name-error' : undefined}
          {...register('name')}
        />
        {errors.name ? (
          <p id="contact-name-error" className={styles.error}>
            {message(errors.name.message)}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-email" className={styles.label}>
          {t('form.email')}
        </label>
        <input
          id="contact-email"
          type="email"
          className={styles.input}
          placeholder={t('form.emailPlaceholder')}
          autoComplete="email"
          aria-invalid={errors.email ? 'true' : undefined}
          aria-describedby={errors.email ? 'contact-email-error' : undefined}
          {...register('email')}
        />
        {errors.email ? (
          <p id="contact-email-error" className={styles.error}>
            {message(errors.email.message)}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message" className={styles.label}>
          {t('form.message')}
        </label>
        <textarea
          id="contact-message"
          rows={5}
          className={styles.textarea}
          placeholder={t('form.messagePlaceholder')}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? 'contact-message-error' : undefined}
          {...register('message')}
        />
        {errors.message ? (
          <p id="contact-message-error" className={styles.error}>
            {message(errors.message.message)}
          </p>
        ) : null}
      </div>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input
          id="contact-company"
          tabIndex={-1}
          autoComplete="off"
          {...register('company')}
        />
      </div>

      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending' ? t('form.sending') : t('form.submit')}
      </button>

      <p className={styles.status} role="status" aria-live="polite">
        {status === 'success' ? <span className={styles.ok}>{t('success')}</span> : null}
        {status === 'error' ? (
          <span className={styles.fail}>{t('error', { email })}</span>
        ) : null}
      </p>
    </form>
  );
}
