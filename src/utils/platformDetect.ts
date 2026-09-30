import { PlatformType } from '../types';

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  badgeName: string;
  brandColor: string;
  bgColor: string;
  textColor: string;
  symbol: string;
  iconName: string;
  regexPattern: RegExp;
  domainSample: string;
}

export const PLATFORM_CONFIGS: Record<PlatformType, PlatformConfig> = {
  x: {
    id: 'x',
    name: 'X / Twitter',
    badgeName: 'X (Twitter)',
    brandColor: '#000000',
    bgColor: 'bg-black text-white',
    textColor: 'text-black',
    symbol: '𝕏',
    iconName: 'tag',
    regexPattern: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?(x\.com|twitter\.com)\/.+/i,
    domainSample: 'x.com / twitter.com',
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    badgeName: 'Threads',
    brandColor: '#101010',
    bgColor: 'bg-[#101010] text-white',
    textColor: 'text-[#101010]',
    symbol: '@',
    iconName: 'alternate_email',
    regexPattern: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?threads\.net\/@.+/i,
    domainSample: 'threads.net/@user',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    badgeName: 'LinkedIn',
    brandColor: '#0A66C2',
    bgColor: 'bg-[#0A66C2] text-white',
    textColor: 'text-[#0A66C2]',
    symbol: 'in',
    iconName: 'share',
    regexPattern: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?linkedin\.com\/.+/i,
    domainSample: 'linkedin.com/posts/...',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    badgeName: 'Facebook',
    brandColor: '#1877F2',
    bgColor: 'bg-[#1877F2] text-white',
    textColor: 'text-[#1877F2]',
    symbol: 'f',
    iconName: 'public',
    regexPattern: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)?(facebook\.com|fb\.com|fb\.watch)\/.+/i,
    domainSample: 'facebook.com/groups/...',
  },
  web: {
    id: 'web',
    name: 'Web Link',
    badgeName: 'Web Asset',
    brandColor: '#00685f',
    bgColor: 'bg-[#00685f] text-white',
    textColor: 'text-[#00685f]',
    symbol: '↗',
    iconName: 'language',
    regexPattern: /^https?:\/\/.+/i,
    domainSample: 'Custom Web Link',
  },
};

export function detectPlatform(url: string): PlatformType {
  const clean = url.trim().toLowerCase();
  if (!clean) return 'web';

  if (clean.includes('x.com') || clean.includes('twitter.com')) {
    return 'x';
  }
  if (clean.includes('threads.net')) {
    return 'threads';
  }
  if (clean.includes('linkedin.com')) {
    return 'linkedin';
  }
  if (clean.includes('facebook.com') || clean.includes('fb.com') || clean.includes('fb.watch')) {
    return 'facebook';
  }
  return 'web';
}

export function extractHandleFromUrl(url: string, platform: PlatformType): string {
  try {
    const clean = url.trim();
    if (platform === 'x') {
      const match = clean.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/i);
      return match ? `@${match[1]}` : '@creator';
    }
    if (platform === 'threads') {
      const match = clean.match(/threads\.net\/@([a-zA-Z0-9_.]+)/i);
      return match ? `@${match[1]}` : '@creator';
    }
    if (platform === 'linkedin') {
      const match = clean.match(/linkedin\.com\/(?:in|posts)\/([a-zA-Z0-9_-]+)/i);
      return match ? `${match[1]}` : 'LinkedIn Post';
    }
    if (platform === 'facebook') {
      const match = clean.match(/facebook\.com\/(?:groups\/)?([a-zA-Z0-9_.-]+)/i);
      return match ? `${match[1]}` : 'Facebook Community';
    }
  } catch {
    // fallback
  }
  return 'Web Asset';
}

export const DEMO_URLS = [
  {
    url: 'https://x.com/DanKoe/status/1784920448102941',
    title: '10 Frameworks for Scaling High-Ticket Coaching in 2025',
    notes: 'Section 4 on asynchronous client onboarding is pure leverage. Essential for Q2 roadmap.',
    tags: ['#Coaching', '#Frameworks', '#Business'],
  },
  {
    url: 'https://threads.net/@shane_mac/post/8821932',
    title: 'Why 90% of Personal Brands Fail in the First 90 Days',
    notes: 'Consistency over novelty. Focus on building micro-audiences that retain value.',
    tags: ['#ThreadsStrategy', '#Branding', '#Marketing'],
  },
  {
    url: 'https://linkedin.com/posts/sarah-jenkins-neuro/89201',
    title: 'The Executive Guide to Sustainable Peak Performance',
    notes: 'Sleep metrics vs cognitive output study. Outstanding data for founder coaching sessions.',
    tags: ['#Health', '#Productivity', '#Leadership'],
  },
  {
    url: 'https://facebook.com/groups/growthlab/permalink/91028371',
    title: 'Community Building Masterclass: 0 to 15k Active Members Case Study',
    notes: 'Weekly live Q&A framework structure with 5-minute problem pitches.',
    tags: ['#Community', '#Growth', '#Facebook'],
  },
  {
    url: 'https://x.com/AlexHormozi/status/1781209384',
    title: 'The Grand Slam Offer Blueprint: Pricing vs Value Equation',
    notes: 'The 4 leverage pillars: Code, Media, Capital, Labor. Use for client offer audits.',
    tags: ['#Business', '#Coaching', '#Pricing'],
  },
];
