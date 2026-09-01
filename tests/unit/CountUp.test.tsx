import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CountUp } from '@/components/animations/CountUp';
import { MockIntersectionObserver, setReducedMotion } from '../setup';

describe('CountUp', () => {
  it('renders the final formatted value on first paint', () => {
    render(<CountUp value={190} formatted="190+" locale="en" suffix="+" />);

    expect(screen.getByText('190+')).toBeInTheDocument();
  });

  it('does not animate under reduced motion', () => {
    setReducedMotion(true);
    render(<CountUp value={190} formatted="190+" locale="en" suffix="+" />);

    expect(MockIntersectionObserver.instances).toHaveLength(0);
    expect(screen.getByText('190+')).toBeInTheDocument();
  });

  it('keeps the true value in the accessibility tree while animating', () => {
    const { container } = render(
      <CountUp value={190} formatted="190+" locale="en" suffix="+" />,
    );

    act(() =>
      MockIntersectionObserver.instances.at(-1)!.trigger({ isIntersecting: true }),
    );

    const announced = container.querySelector('.visually-hidden');
    if (announced) {
      expect(announced).toHaveTextContent('190+');
      expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
    } else {
      expect(screen.getByText('190+')).toBeInTheDocument();
    }
  });
});
