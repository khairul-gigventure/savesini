import React, { useState, useMemo } from 'react';
import { SocialLink, PlatformType, LayoutMode, SortOption } from '../types';
import { PLATFORM_CONFIGS, detectPlatform, DEMO_URLS, extractHandleFromUrl } from '../utils/platformDetect';
import {
  Search,
  X as CloseIcon,
  Grid,
  List,
  Copy,
  Trash2,
  ExternalLink,
  Edit3,
  BookmarkPlus,
  Lock,
  Database,
  Download,
  Plus,
} from 'lucide-react';

interface VaultViewProps {
  links: SocialLink[];
  onSaveLink: (newLink: Omit<SocialLink, 'id' | 'dateAdded'>) => void;
  onDeleteLink: (id: string) => void;
  onCopyLink: (url: string) => void;
  onExportCSV: () => void;
  storageUsage: { usedKb: number; totalKb: number; percentage: number };
}

export const VaultView: React.FC<VaultViewProps> = ({
  links,
  onSaveLink,
  onDeleteLink,
  onCopyLink,
  onExportCSV,
  storageUsage,
}) => {
  // View states
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('list');
  const [activePlatform, setActivePlatform] = useState<PlatformType | 'all'>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Inline Quick Capture Card states
  const [quickUrl, setQuickUrl] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickNotes, setQuickNotes] = useState('');
  const [quickTags, setQuickTags] = useState<string[]>(['#Coaching']);
  const [quickTagInput, setQuickTagInput] = useState('');
  const [quickTitleError, setQuickTitleError] = useState(false);

  // Derive counts and tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    links.forEach((link) => link.tags.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet);
  }, [links]);

  const platformCounts = useMemo(() => {
    const counts = { all: links.length, facebook: 0, threads: 0, x: 0, linkedin: 0, web: 0 };
    links.forEach((l) => {
      if (counts[l.platform] !== undefined) {
        counts[l.platform]++;
      }
    });
    return counts;
  }, [links]);

  // Filter & Sort
  const filteredLinks = useMemo(() => {
    let result = [...links];

    // Platform filter
    if (activePlatform !== 'all') {
      result = result.filter((l) => l.platform === activePlatform);
    }

    // Tag filter
    if (activeTag) {
      result = result.filter((l) => l.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase()));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.notes.toLowerCase().includes(q) ||
          l.author.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
    } else if (sortOption === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [links, activePlatform, activeTag, searchQuery, sortOption]);

  // Inline Quick Capture Handlers
  const handleQuickDemo = () => {
    const pick = DEMO_URLS[Math.floor(Math.random() * DEMO_URLS.length)];
    setQuickUrl(pick.url);
    setQuickTitle(pick.title);
    setQuickNotes(pick.notes);
    setQuickTags(pick.tags);
    setQuickTitleError(false);
  };

  const toggleQuickTag = (tag: string) => {
    if (quickTags.includes(tag)) {
      setQuickTags(quickTags.filter((t) => t !== tag));
    } else {
      setQuickTags([...quickTags, tag]);
    }
  };

  const addCustomQuickTag = () => {
    let clean = quickTagInput.trim();
    if (!clean) return;
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!quickTags.includes(clean)) {
      setQuickTags([...quickTags, clean]);
    }
    setQuickTagInput('');
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) {
      setQuickTitleError(true);
      return;
    }
    setQuickTitleError(false);
    const platform = detectPlatform(quickUrl || 'https://x.com');
    const handle = extractHandleFromUrl(quickUrl, platform);

    onSaveLink({
      url: quickUrl.trim() || 'https://x.com',
      platform,
      title: quickTitle.trim(),
      notes: quickNotes.trim() || 'Executive synthesis note recorded in vault.',
      tags: quickTags.length > 0 ? quickTags : ['#Coaching'],
      author: handle.replace('@', ''),
      authorHandle: handle,
      verified: true,
      displayTimeAgo: 'Just now',
    });

    setQuickUrl('');
    setQuickTitle('');
    setQuickNotes('');
    setQuickTags(['#Coaching']);
  };

  const clearAllFilters = () => {
    setActivePlatform('all');
    setActiveTag(null);
    setSearchQuery('');
  };

  const detectedQuickPlatform = quickUrl.trim() ? detectPlatform(quickUrl) : null;
  const quickConfig = detectedQuickPlatform ? PLATFORM_CONFIGS[detectedQuickPlatform] : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Top KPI & Vault Summary Header Strip */}
      <div className="w-full pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaedff] mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-[#eaedff] text-[#3d4947] text-[11px] font-semibold uppercase tracking-wider">
              Curator Vault
            </span>
            <span className="text-[#3d4947] text-[12px]">· LocalStorage Synchronized</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight">
            Social Intel Vault
          </h1>
          <p className="text-xs sm:text-sm text-[#3d4947] max-w-xl">
            Capture, synthesize, and retrieve high-signal coaching posts across X, LinkedIn, Threads, and Facebook.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center">
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#eaedff] shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00685f] animate-pulse"></span>
            <span className="text-xs text-[#3d4947]">Total:</span>
            <span className="text-xs text-[#131b2e] font-bold">{links.length} Links</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#eaedff] shadow-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005eb5] text-[16px]">label</span>
            <span className="text-xs text-[#3d4947]">Tags:</span>
            <span className="text-xs text-[#131b2e] font-bold">{allTags.length}</span>
          </div>
        </div>
      </div>

      {/* Section 1: Prominent Quick Capture Card (PRD Stage 1 & 2) */}
      <section className="w-full mb-6">
        <div className="rounded-2xl bg-white border border-[#eaedff] p-4 sm:p-5 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#89f5e7]/40 flex items-center justify-center text-[#00685f]">
                <BookmarkPlus className="w-4 h-4" />
              </div>
              <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-[#131b2e]">
                Quick Capture Post
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                quickConfig ? quickConfig.bgColor : 'bg-[#eaedff] text-[#3d4947]'
              }`}
            >
              <span className="text-[13px] font-bold">{quickConfig ? quickConfig.symbol : '🔗'}</span>
              <span>{quickConfig ? `Detected: ${quickConfig.badgeName}` : 'Ready for URL'}</span>
            </div>
          </div>

          <form onSubmit={handleQuickSubmit} className="space-y-3">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[18px] text-[#6d7a77] pointer-events-none">
                link
              </span>
              <input
                type="url"
                value={quickUrl}
                onChange={(e) => setQuickUrl(e.target.value)}
                placeholder="Paste post URL (X, LinkedIn, Threads, Facebook)..."
                className="w-full h-11 pl-10 pr-24 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[#131b2e] placeholder:text-[#bcc9c6] text-xs sm:text-sm focus:bg-white focus:border-[#00685f] focus:outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={handleQuickDemo}
                className="absolute right-2 px-2.5 py-1 rounded-lg bg-[#eaedff] text-[#3d4947] hover:text-[#131b2e] hover:bg-[#dae2fd] text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[13px]">content_paste</span>
                Demo
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-7">
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => {
                    setQuickTitle(e.target.value);
                    if (quickTitleError && e.target.value.trim()) setQuickTitleError(false);
                  }}
                  placeholder="Key Takeaway / Title (Required)*"
                  className={`w-full h-10 px-3.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[#131b2e] placeholder:text-[#bcc9c6] text-xs sm:text-sm focus:bg-white focus:border-[#00685f] focus:outline-none transition-all shadow-inner ${
                    quickTitleError ? 'border-[#ba1a1a] bg-[#ffdad6]/20' : ''
                  }`}
                />
                {quickTitleError && (
                  <span className="text-[#ba1a1a] text-[11px] mt-1 block">Title is required to save link.</span>
                )}
              </div>

              <div className="md:col-span-5 flex items-center gap-1.5 flex-wrap">
                {['#Coaching', '#Marketing', '#Frameworks'].map((t) => {
                  const isSel = quickTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleQuickTag(t)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shadow-xs cursor-pointer ${
                        isSel
                          ? 'bg-[#89f5e7] text-[#00201d] font-semibold'
                          : 'bg-[#faf8ff] border border-[#eaedff] text-[#3d4947] hover:text-[#131b2e]'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}

                <input
                  type="text"
                  value={quickTagInput}
                  onChange={(e) => setQuickTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomQuickTag();
                    }
                  }}
                  placeholder="+ Tag"
                  className="w-16 h-7 px-2 rounded-full bg-[#eaedff] text-[#131b2e] placeholder:text-[#6d7a77] text-[11px] focus:w-20 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder="Executive synthesis note or client takeaway (optional)..."
                className="w-full h-10 px-3.5 rounded-xl bg-[#faf8ff] border border-[#eaedff] text-[#131b2e] placeholder:text-[#bcc9c6] text-xs sm:text-sm focus:bg-white focus:border-[#00685f] focus:outline-none transition-all shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[12px] text-[#3d4947] hidden sm:inline-flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#00685f]" />
                Encrypted client-side
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setQuickUrl('');
                    setQuickTitle('');
                    setQuickNotes('');
                    setQuickTags(['#Coaching']);
                    setQuickTitleError(false);
                  }}
                  className="px-3 py-1.5 rounded-xl text-[#3d4947] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors text-xs font-semibold cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-[#00685f] text-white hover:bg-[#008378] shadow-xs transition-all text-xs font-semibold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px]">bookmark</span>
                  Save to Vault
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Section 2: Universal Search, Platform Filters & View Toggle */}
      <section className="w-full space-y-3 mb-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7a77] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search titles, notes, tags..."
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-white border border-[#eaedff] text-[#131b2e] placeholder:text-[#bcc9c6] text-xs sm:text-sm shadow-xs focus:border-[#00685f] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7a77] hover:text-[#131b2e] transition-colors cursor-pointer"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort & View toggles */}
          <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="h-10 pl-3 pr-8 rounded-xl bg-white border border-[#eaedff] text-[#131b2e] text-xs font-semibold shadow-xs focus:outline-none cursor-pointer appearance-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alpha">A-Z</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#6d7a77] text-[16px] pointer-events-none">
                expand_more
              </span>
            </div>

            <div className="flex items-center p-0.5 rounded-xl bg-[#eaedff] border border-[#eaedff]">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  layoutMode === 'grid'
                    ? 'bg-white text-[#131b2e] shadow-xs font-semibold'
                    : 'text-[#3d4947] hover:text-[#131b2e]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  layoutMode === 'list'
                    ? 'bg-white text-[#131b2e] shadow-xs font-semibold'
                    : 'text-[#3d4947] hover:text-[#131b2e]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Platform filter pills & tag filter chips */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
          {/* Platform Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full scrollbar-none">
            <button
              type="button"
              onClick={() => setActivePlatform('all')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'all'
                  ? 'bg-[#283044] text-[#eef0ff] font-semibold shadow-xs'
                  : 'bg-white border border-[#eaedff] text-[#131b2e] hover:bg-[#eaedff]'
              }`}
            >
              <span>All</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-bold">
                {platformCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('facebook')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'facebook'
                  ? 'bg-[#283044] text-[#eef0ff] font-semibold shadow-xs'
                  : 'bg-white border border-[#eaedff] text-[#131b2e] hover:bg-[#eaedff]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1877F2]"></span>
              <span>Facebook</span>
              <span className="text-[#3d4947] text-[10px] font-medium">{platformCounts.facebook}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('threads')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'threads'
                  ? 'bg-[#283044] text-[#eef0ff] font-semibold shadow-xs'
                  : 'bg-white border border-[#eaedff] text-[#131b2e] hover:bg-[#eaedff]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#101010]"></span>
              <span>Threads</span>
              <span className="text-[#3d4947] text-[10px] font-medium">{platformCounts.threads}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('x')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'x'
                  ? 'bg-[#283044] text-[#eef0ff] font-semibold shadow-xs'
                  : 'bg-white border border-[#eaedff] text-[#131b2e] hover:bg-[#eaedff]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span>X / Twitter</span>
              <span className="text-[#3d4947] text-[10px] font-medium">{platformCounts.x}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('linkedin')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'linkedin'
                  ? 'bg-[#283044] text-[#eef0ff] font-semibold shadow-xs'
                  : 'bg-white border border-[#eaedff] text-[#131b2e] hover:bg-[#eaedff]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#0A66C2]"></span>
              <span>LinkedIn</span>
              <span className="text-[#3d4947] text-[10px] font-medium">{platformCounts.linkedin}</span>
            </button>
          </div>

          {/* Quick Tag Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[#3d4947] text-[11px]">Tags:</span>
            {['#Coaching', '#Frameworks', '#Leadership'].map((t) => {
              const isSel = activeTag === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTag(isSel ? null : t)}
                  className={`px-2 py-0.5 rounded-md text-[11px] transition-colors cursor-pointer ${
                    isSel
                      ? 'bg-[#89f5e7] text-[#00201d] font-semibold shadow-xs'
                      : 'bg-[#eaedff] text-[#131b2e] hover:bg-[#dae2fd]'
                  }`}
                >
                  {t}
                </button>
              );
            })}

            {(activePlatform !== 'all' || activeTag !== null || searchQuery.trim() !== '') && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-2 py-0.5 rounded-md text-[#ba1a1a] hover:bg-[#ffdad6]/40 text-[11px] font-semibold transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Section 3: Link Collection Showcase (Grid & List View) */}
      <section className="mt-4">
        {filteredLinks.length === 0 ? (
          /* Empty State */
          <div className="w-full py-16 px-6 text-center rounded-2xl bg-white border border-[#eaedff] shadow-xs my-6">
            <div className="w-16 h-16 rounded-full bg-[#eaedff] mx-auto flex items-center justify-center text-[#6d7a77] mb-4">
              <span className="material-symbols-outlined text-[32px]">manage_search</span>
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#131b2e]">
              No saved links match this filter
            </h3>
            <p className="text-xs sm:text-sm text-[#3d4947] max-w-md mx-auto mt-2 mb-6">
              We couldn't locate any bookmarks with that query or platform filter. Clear your filters or capture a new link above.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-5 py-2.5 rounded-xl bg-[#00685f] text-white text-xs font-semibold hover:bg-[#008378] transition-all shadow-xs cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : layoutMode === 'grid' ? (
          /* 3A. GRID VIEW MODE (Cards) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredLinks.map((item) => {
              const config = PLATFORM_CONFIGS[item.platform];
              return (
                <article
                  key={item.id}
                  className="group rounded-2xl bg-white border border-[#eaedff] p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${config.bgColor}`}
                        >
                          <span>{config.symbol}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#131b2e]">
                              {item.author || config.name}
                            </span>
                            {item.verified && (
                              <span className="material-symbols-outlined text-[15px] text-[#005eb5]">
                                verified
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#3d4947]">
                            {item.authorHandle || `@${item.platform}`} · {config.name}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#eaedff] text-[#3d4947] font-medium shrink-0">
                        {item.displayTimeAgo || 'Recently'}
                      </span>
                    </div>

                    {/* Visual Banner Preview */}
                    {item.originalText && (
                      <div
                        className={`w-full rounded-xl p-3.5 mb-3 text-xs ${
                          item.platform === 'x'
                            ? 'bg-[#283044] text-white'
                            : item.platform === 'threads'
                            ? 'bg-[#f2f3ff] text-[#131b2e]'
                            : item.platform === 'linkedin'
                            ? 'bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/20'
                            : 'bg-[#1877F2]/10 text-[#131b2e]'
                        }`}
                      >
                        <p className="italic leading-relaxed">"{item.originalText.replace(/^"|"$/g, '')}"</p>
                        {item.stats && (
                          <div className="mt-2.5 flex items-center gap-3 text-[10px] opacity-80 font-mono">
                            {item.stats.reposts && <span>{item.stats.reposts} Reposts</span>}
                            {item.stats.likes && <span>{item.stats.likes} Likes</span>}
                            {item.stats.bookmarks && <span>{item.stats.bookmarks} Bookmarks</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#131b2e] leading-snug group-hover:text-[#00685f] transition-colors mb-2">
                      {item.title}
                    </h3>

                    {/* Coach's Synthesis */}
                    {item.notes && (
                      <div className="p-3 rounded-xl bg-[#f2f3ff] mb-3">
                        <div className="flex items-center gap-1 text-[#3d4947] text-[11px] font-semibold mb-1">
                          <Edit3 className="w-3.5 h-3.5 text-[#00685f]" />
                          <span>Coach's Synthesis</span>
                        </div>
                        <p className="text-xs text-[#131b2e] leading-relaxed">{item.notes}</p>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          onClick={() => setActiveTag(tag)}
                          className="px-2.5 py-0.5 rounded-md bg-[#eaedff] text-[11px] text-[#3d4947] font-medium cursor-pointer hover:bg-[#dae2fd] transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Strip */}
                  <div className="pt-3 border-t border-[#eaedff] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onCopyLink(item.url)}
                        className="p-2 rounded-lg text-[#6d7a77] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors cursor-pointer"
                        title="Copy original link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLink(item.id)}
                        className="p-2 rounded-lg text-[#6d7a77] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] text-xs font-semibold transition-all"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* 3B. LIST VIEW MODE (High-density compact layout as per PRD) */
          <div className="flex flex-col gap-2.5 w-full">
            {/* List Column Headers */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] text-[#3d4947] uppercase tracking-wider font-semibold border-b border-[#eaedff]">
              <div className="col-span-5">Platform &amp; Resource Title</div>
              <div className="col-span-4">Coach's Synthesis &amp; Takeaway</div>
              <div className="col-span-2">Tags &amp; Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* List Rows */}
            {filteredLinks.map((item) => {
              const config = PLATFORM_CONFIGS[item.platform];
              return (
                <div
                  key={item.id}
                  className="group flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center p-3.5 rounded-xl bg-white hover:bg-[#f2f3ff] border border-[#eaedff]/80 shadow-xs hover:shadow-md transition-all duration-150"
                >
                  {/* Col 5: Platform & Title */}
                  <div className="md:col-span-5 flex items-center gap-3 min-w-0 w-full">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${config.bgColor}`}
                    >
                      <span>{config.symbol}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#131b2e] truncate group-hover:text-[#00685f] transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-[#3d4947] truncate mt-0.5">
                        <span className="font-semibold text-[#131b2e]">{item.author || config.name}</span>
                        {item.verified && (
                          <span className="material-symbols-outlined text-[13px] text-[#005eb5]">
                            verified
                          </span>
                        )}
                        <span>· {item.authorHandle || `@${item.platform}`} · {config.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Col 4: Synthesis */}
                  <div className="md:col-span-4 min-w-0 w-full">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eaedff] text-xs text-[#131b2e] w-full truncate">
                      <Edit3 className="w-3.5 h-3.5 text-[#00685f] shrink-0" />
                      <span className="truncate">{item.notes || 'No synthesis recorded.'}</span>
                    </div>
                  </div>

                  {/* Col 2: Tags & Date */}
                  <div className="md:col-span-2 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-1 min-w-0 w-full">
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#3d4947] text-[10px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] text-[#3d4947] whitespace-nowrap">
                      {item.displayTimeAgo || 'Recently'}
                    </span>
                  </div>

                  {/* Col 1: Actions */}
                  <div className="md:col-span-1 flex items-center justify-end gap-1 w-full shrink-0">
                    <button
                      type="button"
                      onClick={() => onCopyLink(item.url)}
                      className="p-1.5 rounded-lg text-[#6d7a77] hover:text-[#131b2e] hover:bg-[#eaedff] transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteLink(item.id)}
                      className="p-1.5 rounded-lg text-[#6d7a77] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-[#eaedff] hover:bg-[#dae2fd] text-[#131b2e] transition-colors"
                      title="Open external link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Section 4: Vault Storage & Health Diagnostics Bar */}
      <section className="mt-8 rounded-xl bg-white border border-[#eaedff] p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#89f5e7] flex items-center justify-center text-[#00685f] shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="font-['Plus_Jakarta_Sans'] text-xs sm:text-sm font-bold text-[#131b2e]">
                LocalStorage Status: Healthy &amp; Ready
              </p>
              <p className="text-[11px] text-[#3d4947]">
                {storageUsage.usedKb} KB used of {storageUsage.totalKb} KB quota. Zero network dependence for retrieval.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#eaedff] text-[#131b2e] hover:bg-[#dae2fd] text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#00685f]" />
            <span>Backup CSV</span>
          </button>
        </div>
      </section>
    </div>
  );
};
