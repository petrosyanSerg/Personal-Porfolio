import type { Metric } from '@/types/profile';

export const metrics: Metric[] = [
  {
    id: 'modules',
    value: 50,
    prefix: '~',
    labelKey: 'metrics.modules',
    source: 'ActualSolutions',
    evidence: 'fact',
    display: true,
  },
  {
    id: 'endpoints',
    value: 190,
    suffix: '+',
    labelKey: 'metrics.endpoints',
    source: 'ActualSolutions',
    evidence: 'fact',
    display: true,
  },
  {
    id: 'services',
    value: 36,
    labelKey: 'metrics.services',
    source: 'ActualSolutions',
    evidence: 'fact',
    display: true,
  },
  {
    id: 'years',
    value: 4,
    labelKey: 'metrics.years',
    source: 'career',
    evidence: 'fact',
    display: true,
  },
  {
    id: 'loc',
    value: 106_000,
    labelKey: 'metrics.loc',
    source: 'ActualSolutions',
    evidence: 'unverified',
    display: false,
  },
];

export const displayedMetrics = metrics.filter((metric) => metric.display);
