export type PlatformType = 'x' | 'threads' | 'linkedin' | 'facebook' | 'web';

export interface SocialLink {
  id: string;
  userId?: string;
  url: string;
  platform: PlatformType;
  title: string;
  notes: string;
  tags: string[];
  author: string;
  authorHandle: string;
  authorAvatar?: string;
  verified?: boolean;
  badge?: string;
  dateAdded: string; // ISO string
  displayTimeAgo?: string;
  collectionId?: string;
  originalText?: string;
  stats?: {
    likes?: string;
    reposts?: string;
    bookmarks?: string;
  };
  assetFormat?: 'breakdown' | 'framework' | 'template';
  extractedInsight?: string;
  readTime?: string;
}

export interface CoachingCollection {
  id: string;
  userId?: string;
  title: string;
  subtitle: string;
  tags: string[];
  color: 'teal' | 'blue' | 'slate';
  coachSynthesis: string;
  linkIds: string[];
  avatarPreviews: string[];
  readinessScore: number;
  updatedAt: string;
  activePillar?: boolean;
}

export type ViewTab = 'quick-capture' | 'bookmarks';
export type LayoutMode = 'grid' | 'list';
export type SortOption = 'newest' | 'oldest' | 'alpha' | 'relevance';
