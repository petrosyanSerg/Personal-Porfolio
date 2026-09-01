import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import { ContactForm } from '@/components/sections/ContactForm';
import en from '@/content/en.json';

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={en}>
      <ContactForm email="hello@example.com" />
    </NextIntlClientProvider>,
  );
}

describe('ContactForm', () => {
  it('reports a translated, associated error for a missing name', async () => {
    const user = userEvent.setup();
    renderForm();

    const name = screen.getByLabelText(en.contact.form.name);
    await user.click(name);
    await user.tab();

    const error = await screen.findByText(en.contact.validation.nameRequired);

    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAttribute('aria-describedby', error.id);
  });

  it('rejects a malformed email', async () => {
    const user = userEvent.setup();
    renderForm();

    const email = screen.getByLabelText(en.contact.form.email);
    await user.type(email, 'not-an-address');
    await user.tab();

    expect(
      await screen.findByText(en.contact.validation.emailInvalid),
    ).toBeInTheDocument();
  });

  it('rejects a message that is too short to answer', async () => {
    const user = userEvent.setup();
    renderForm();

    const message = screen.getByLabelText(en.contact.form.message);
    await user.type(message, 'hi');
    await user.tab();

    expect(
      await screen.findByText(en.contact.validation.messageTooShort),
    ).toBeInTheDocument();
  });

  it('does not submit while any field is invalid', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: en.contact.form.submit }));

    await waitFor(() =>
      expect(screen.getByText(en.contact.validation.nameRequired)).toBeInTheDocument(),
    );
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('posts valid input and confirms in the live region', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(null, { status: 200 }));
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(en.contact.form.name), 'Anna Grigoryan');
    await user.type(screen.getByLabelText(en.contact.form.email), 'anna@example.com');
    await user.type(
      screen.getByLabelText(en.contact.form.message),
      'We are hiring a frontend engineer and your architecture work looks relevant.',
    );
    await user.click(screen.getByRole('button', { name: en.contact.form.submit }));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledOnce());
    expect(await screen.findByText(en.contact.success)).toBeInTheDocument();

    fetchSpy.mockRestore();
  });

  it('surfaces a fallback address when the request fails', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockRejectedValue(new Error('offline'));
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(en.contact.form.name), 'Anna Grigoryan');
    await user.type(screen.getByLabelText(en.contact.form.email), 'anna@example.com');
    await user.type(
      screen.getByLabelText(en.contact.form.message),
      'We are hiring a frontend engineer and your architecture work looks relevant.',
    );
    await user.click(screen.getByRole('button', { name: en.contact.form.submit }));

    expect(await screen.findByText(/hello@example\.com/)).toBeInTheDocument();

    fetchSpy.mockRestore();
  });
});
