import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Reveal } from '@/components/animations/Reveal';
import { MockIntersectionObserver } from '../setup';

describe('Reveal', () => {
  it('renders its children before anything intersects', () => {
    render(<Reveal>Architecture that holds</Reveal>);

    expect(screen.getByText('Architecture that holds')).toBeInTheDocument();
  });

  it('marks itself revealed once, and stops observing', () => {
    const { container } = render(<Reveal>Once</Reveal>);
    const element = container.firstElementChild!;
    const observer = MockIntersectionObserver.instances.at(-1)!;

    expect(element).not.toHaveAttribute('data-revealed');

    act(() => observer.trigger({ isIntersecting: true }));

    expect(element).toHaveAttribute('data-revealed', 'true');
    expect(observer.disconnected).toBe(true);
  });

  it('stays unrevealed while it is out of view', () => {
    const { container } = render(<Reveal>Below the fold</Reveal>);
    act(() =>
      MockIntersectionObserver.instances.at(-1)!.trigger({ isIntersecting: false }),
    );

    expect(container.firstElementChild).not.toHaveAttribute('data-revealed');
  });

  it('honours the requested element and staggers by index', () => {
    const { container } = render(
      <Reveal as="li" index={3}>
        Third
      </Reveal>,
    );
    const element = container.firstElementChild as HTMLElement;

    expect(element.tagName).toBe('LI');
    expect(element.style.getPropertyValue('--reveal-delay')).toBe('180ms');
  });

  it('applies no inline transform, so reduced motion is decidable in CSS', () => {
    const { container } = render(<Reveal>No JS transform</Reveal>);
    const element = container.firstElementChild as HTMLElement;

    expect(element.style.transform).toBe('');
    expect(element.style.opacity).toBe('');
  });
});
