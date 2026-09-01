import { env } from '@/lib/env';

const rawUrl = env.NEXT_PUBLIC_SITE_URL ?? 'https://petrosyanserg.vercel.app';

export const site = {
  url: rawUrl.replace(/\/+$/, ''),
  name: 'Sergey Petrosyan',
  shortName: 'S. Petrosyan',
  twitter: undefined,
  themeColor: '#0A0B0F',
  backgroundColor: '#0A0B0F',
  resumePdf: '/resume/Sergey_Petrosyan_Software_Engineer_Resume.pdf',
} as const;
