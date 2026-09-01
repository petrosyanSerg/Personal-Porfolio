import type { Certification, EducationEntry, LanguageProficiency } from '@/types/profile';

export const education: EducationEntry[] = [
  {
    id: 'ysci',
    institution: 'Yerevan State College of Informatics',
    fieldKey: 'education.ysci.field',
    start: '2017-09',
    end: '2023-06',
    location: 'Yerevan, Armenia',
  },
  {
    id: 'smartcode-program',
    institution: 'SmartCode',
    fieldKey: 'education.smartcode.field',
    start: '2022-08',
    end: '2023-05',
    location: 'Yerevan, Armenia',
  },
];

export const certifications: Certification[] = [
  {
    id: 'ysci-se',
    nameKey: 'certifications.ysci-se.name',
    issuer: 'Yerevan State College of Informatics',
    issued: '2023-06',
    primary: true,
  },
  {
    id: 'smartcode-fe',
    nameKey: 'certifications.smartcode-fe.name',
    issuer: 'SmartCode',
    issued: '2023-05',
    primary: true,
  },
  {
    id: 'sololearn-react',
    nameKey: 'certifications.sololearn-react.name',
    issuer: 'Sololearn',
    issued: '2023-04',
    credentialId: 'CT-DIEUYKHI',
    primary: false,
  },
  {
    id: 'sololearn-css',
    nameKey: 'certifications.sololearn-css.name',
    issuer: 'Sololearn',
    issued: '2023-03',
    credentialId: 'CT-8FOMYLNS',
    primary: false,
  },
  {
    id: 'sololearn-html',
    nameKey: 'certifications.sololearn-html.name',
    issuer: 'Sololearn',
    issued: '2023-03',
    credentialId: 'CT-LUEFRVIR',
    primary: false,
  },
  {
    id: 'sololearn-js',
    nameKey: 'certifications.sololearn-js.name',
    issuer: 'Sololearn',
    issued: '2023-02',
    credentialId: 'CT-7INFQH6G',
    primary: false,
  },
];

export const languages: LanguageProficiency[] = [
  { code: 'hy', nameKey: 'languages.hy', level: 'native' },
  { code: 'ru', nameKey: 'languages.ru', level: 'full-professional' },
  { code: 'en', nameKey: 'languages.en', level: 'elementary' },
];

export const primaryCertifications = certifications.filter((c) => c.primary);
export const secondaryCertifications = certifications.filter((c) => !c.primary);
