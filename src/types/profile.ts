import type { Locale } from '@/config/i18n';

export type { Locale };

export type EvidenceLevel = 'fact' | 'inference' | 'unverified';

export type EvidenceSource =
  | 'ActualSolutions'
  | 'SoftConstruct'
  | 'SmartCode'
  | 'EdEl'
  | 'GitHub'
  | 'LinkedIn'
  | 'career';

export type Personal = {
  firstName: string;
  lastName: string;
  location: {
    city: string;
    country: string;
    countryCode: string;
    timezone: string;
  };
  email: string;
  photo: string | null;
  availability: {
    open: boolean;
    modes: ReadonlyArray<'onsite' | 'hybrid' | 'remote'>;
  };
};

export type Metric = {
  id: string;
  value: number;
  prefix?: string;
  suffix?: string;
  labelKey: string;
  source: EvidenceSource;
  evidence: EvidenceLevel;
  display: boolean;
};

export type EmploymentType = 'full-time' | 'internship' | 'contract';
export type WorkMode = 'onsite' | 'hybrid' | 'remote';

export type ExperienceEntry = {
  id: string;
  company: string;
  companyUrl?: string;
  roleKey: string;
  type: EmploymentType;
  mode: WorkMode;
  location: string;
  start: string;
  end: string | null;
  product?: {
    name: string;
    url?: string;
    publicDescription: boolean;
  };
  highlightKeys: string[];
  technologies: string[];
  featured: boolean;
  evidence: EvidenceLevel;
};

export type SkillDepth = 'core' | 'strong' | 'working' | 'familiar';

export type SkillGroupId =
  | 'frontend'
  | 'state-data'
  | 'architecture'
  | 'ai-engineering'
  | 'tooling-infra'
  | 'design';

export type Skill = {
  id: string;
  name: string;
  depth: SkillDepth;
  usageKey: string;
  evidence: EvidenceSource[];
  personalOnly?: boolean;
};

export type SkillGroup = {
  id: SkillGroupId;
  labelKey: string;
  skills: Skill[];
};

export type ProjectTier = 'commercial' | 'public';

export type ProjectCategory =
  'enterprise-fintech' | 'engineering-practice' | 'architecture-study' | 'public-build';

export type DiagramId = 'fsd-layers' | 'mk-kredit-architecture' | 'ai-workflow-pipeline';

export type ProjectContent = {
  titleKey: string;
  shortDescriptionKey: string;
  overviewKey?: string;
  problemKey?: string;
  contextKey?: string;
  roleDetailKey?: string;
  architectureKey?: string;
  challengeKeys?: string[];
  resultKeys?: string[];
  lessonsKey?: string;
};

export type Project = {
  slug: string;
  tier: ProjectTier;
  category: ProjectCategory;
  featured: boolean;
  hasCaseStudy: boolean;
  company?: string;
  roleKey: string;
  year: string;
  technologies: string[];
  links?: {
    github?: string;
    live?: string;
    noteKey?: string;
  };
  content: ProjectContent;
  diagram?: DiagramId;
  images?: Array<{ src: string; altKey: string; width: number; height: number }>;
  evidence: EvidenceLevel;
  blockedBy?: string;
};

export type EducationEntry = {
  id: string;
  institution: string;
  institutionUrl?: string;
  fieldKey: string;
  start: string;
  end: string;
  location: string;
};

export type Certification = {
  id: string;
  nameKey: string;
  issuer: string;
  issued: string;
  credentialId?: string;
  credentialUrl?: string;
  primary: boolean;
};

export type ProficiencyLevel =
  'native' | 'full-professional' | 'professional' | 'limited' | 'elementary';

export type LanguageProficiency = {
  code: string;
  nameKey: string;
  level: ProficiencyLevel;
};

export type Achievement = {
  id: string;
  textKey: string;
  source: EvidenceSource;
  evidence: EvidenceLevel;
  display: boolean;
};

export type SocialId = 'linkedin' | 'github' | 'telegram' | 'email';

export type SocialLink = {
  id: SocialId;
  url: string;
  labelKey: string;
  handle: string;
  primary: boolean;
};

export type NavItem = {
  id: string;
  href: string;
  labelKey: string;
};

export type DeveloperProfile = {
  personal: Personal;
  metrics: Metric[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: Certification[];
  skills: SkillGroup[];
  projects: Project[];
  achievements: Achievement[];
  languages: LanguageProficiency[];
  socialLinks: SocialLink[];
};
