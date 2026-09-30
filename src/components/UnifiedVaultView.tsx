import React, { useState, useMemo, useEffect } from 'react';
import { SocialLink, CoachingCollection, PlatformType, LayoutMode, SortOption } from '../types';
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
  Folder,
  FolderPlus,
  Share2,
  Sparkles,
  Zap,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
} from 'lucide-react';

interface UnifiedVaultViewProps {
  links: SocialLink[];
  collections: CoachingCollection[];
  onSaveLink: (newLink: Omit<SocialLink, 'id' | 'dateAdded'>) => void;
  onDeleteLink: (id: string) => void;
  onCopyLink: (url: string) => void;
  onExportCSV: () => void;
  onUpdateCollections: (newCols: CoachingCollection[]) => void;
  onOpenAssignModal: (collectionId: string) => void;
  onShareCollection: (collection: CoachingCollection) => void;
  storageUsage: { usedKb: number; totalKb: number; percentage: number };
  onOpenReader?: (link: SocialLink) => void;
  onOpenWeeklyDigest?: () => void;
  onOpenBookmarklet?: () => void;
}

export const UnifiedVaultView: React.FC<UnifiedVaultViewProps> = ({
  links,
  collections,
  onSaveLink,
  onDeleteLink,
  onCopyLink,
  onExportCSV,
  onUpdateCollections,
  onOpenAssignModal,
  onShareCollection,
  storageUsage,
  onOpenReader,
  onOpenWeeklyDigest,
  onOpenBookmarklet,
}) => {
  // Core Filter & View states
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | 'all'>('all');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('list');
  const [activePlatform, setActivePlatform] = useState<PlatformType | 'all'>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Advanced Filters
  const [dateRange, setDateRange] = useState('all');
  const [assetFormat, setAssetFormat] = useState('all');
  const [hasTakeaways, setHasTakeaways] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Inline Quick Capture Card state
  const [showInlineCapture, setShowInlineCapture] = useState(false);
  const [quickUrl, setQuickUrl] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickNotes, setQuickNotes] = useState('');
  const [quickTags, setQuickTags] = useState<string[]>(['#Coaching']);
  const [quickTagInput, setQuickTagInput] = useState('');
  const [quickTitleError, setQuickTitleError] = useState(false);

  // Modal state for creating new collection binder
  const [showNewColModal, setShowNewColModal] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [newColSubtitle, setNewColSubtitle] = useState('');
  const [newColTag, setNewColTag] = useState('#Coaching');
  const [newColColor, setNewColColor] = useState<'teal' | 'blue' | 'slate'>('teal');

  // Command + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('vaultSearchInput');
        if (input) {
          input.focus();
          (input as HTMLInputElement).select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active collection object if selected
  const activeCollection = useMemo(() => {
    if (selectedCollectionId === 'all') return null;
    return collections.find((c) => c.id === selectedCollectionId) || null;
  }, [collections, selectedCollectionId]);

  // Derived counts
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

  // Tag Cloud with counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    links.forEach((l) => {
      l.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
  }, [links]);

  // Filter & Sort Pipeline
  const filteredLinks = useMemo(() => {
    let result = [...links];

    // Collection filter
    if (activeCollection) {
      const allowedIds = new Set(activeCollection.linkIds);
      result = result.filter((l) => allowedIds.has(l.id));
    }

    // Platform filter
    if (activePlatform !== 'all') {
      result = result.filter((l) => l.platform === activePlatform);
    }

    // Tag filter
    if (activeTag) {
      result = result.filter((l) => l.tags.some((t) => t.toLowerCase() === activeTag.toLowerCase()));
    }

    // Takeaways filter
    if (hasTakeaways) {
      result = result.filter((l) => l.notes && l.notes.trim().length > 0);
    }

    // Asset Format filter
    if (assetFormat !== 'all') {
      result = result.filter((l) => l.assetFormat === assetFormat);
    }

    // Date Range
    if (dateRange === '7d') {
      const cut = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter((l) => new Date(l.dateAdded).getTime() >= cut);
    } else if (dateRange === '30d') {
      const cut = Date.now() - 30 * 24 * 60 * 60 * 1000;
      result = result.filter((l) => new Date(l.dateAdded).getTime() >= cut);
    }

    // Search query: filters in real-time based on title, URL, or tags
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const cleanTagQ = q.startsWith('#') ? q.slice(1) : q;
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.tags.some(
            (t) =>
              t.toLowerCase().includes(q) ||
              t.toLowerCase().replace(/^#/, '').includes(cleanTagQ)
          ) ||
          (l.notes && l.notes.toLowerCase().includes(q)) ||
          (l.author && l.author.toLowerCase().includes(q)) ||
          (l.authorHandle && l.authorHandle.toLowerCase().includes(q)) ||
          (l.extractedInsight && l.extractedInsight.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
    } else if (sortOption === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'relevance' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result.sort((a, b) => {
        const getScore = (item: SocialLink) => {
          let score = 0;
          if (item.title.toLowerCase().includes(q)) score += 5;
          if (item.url.toLowerCase().includes(q)) score += 4;
          if (item.tags.some((t) => t.toLowerCase().includes(q))) score += 4;
          if (item.notes && item.notes.toLowerCase().includes(q)) score += 2;
          return score;
        };
        return getScore(b) - getScore(a);
      });
    }

    return result;
  }, [links, activeCollection, activePlatform, activeTag, hasTakeaways, assetFormat, dateRange, searchQuery, sortOption]);

  // Quick Preset Handlers
  const handlePresetClick = (presetQuery: string) => {
    setSearchQuery(presetQuery);
    setActiveTag(presetQuery.startsWith('#') ? presetQuery : null);
  };

  const clearAllFilters = () => {
    setSelectedCollectionId('all');
    setActivePlatform('all');
    setActiveTag(null);
    setSearchQuery('');
    setDateRange('all');
    setAssetFormat('all');
    setHasTakeaways(false);
  };

  // Inline Quick Submit Handler
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
    setShowInlineCapture(false);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;

    const newCol: CoachingCollection = {
      id: `col-${Date.now()}`,
      title: newColTitle.trim(),
      subtitle: newColSubtitle.trim() || 'Personal knowledge collection.',
      tags: [newColTag.startsWith('#') ? newColTag : `#${newColTag}`],
      color: newColColor,
      coachSynthesis: 'Collection for strategic frameworks and references.',
      linkIds: links.slice(0, 4).map((l) => l.id),
      avatarPreviews: [],
      readinessScore: 70,
      updatedAt: 'Just now',
      activePillar: false,
    };

    onUpdateCollections([newCol, ...collections]);
    setSelectedCollectionId(newCol.id);
    setShowNewColModal(false);
    setNewColTitle('');
    setNewColSubtitle('');
  };

  const detectedQuickPlatform = quickUrl.trim() ? detectPlatform(quickUrl) : null;
  const quickConfig = detectedQuickPlatform ? PLATFORM_CONFIGS[detectedQuickPlatform] : null;

  // Search keyword highlighter with regex escaping
  const renderHighlighted = (text: string, term: string) => {
    if (!text || !term || !term.trim()) return text;
    const cleanTerm = term.trim();
    if (!cleanTerm) return text;

    try {
      // Escape regex special characters
      const escapedTerm = cleanTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedTerm})`, 'gi');
      const parts = text.split(regex);
      return parts.map((part, i) =>
        part.toLowerCase() === cleanTerm.toLowerCase() ? (
          <mark key={i} className="bg-amber-200/70 text-zinc-950 px-0.5 rounded font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  const isFilteringActive =
    selectedCollectionId !== 'all' ||
    activePlatform !== 'all' ||
    activeTag !== null ||
    searchQuery.trim() !== '' ||
    dateRange !== 'all' ||
    assetFormat !== 'all' ||
    hasTakeaways;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6 font-['Inter']">
      {/* Top Header & Overview */}
      <div className="pt-6 pb-2 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[10px] font-bold uppercase tracking-wider border border-zinc-200">
              Personal Vault
            </span>
            <span className="text-zinc-500 text-xs">· SaveSini</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            All Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl leading-relaxed">
            All captured framework links and strategic notes across social platforms. Search across title, URL, author, and tags.
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-zinc-500">Total:</span>
            <span className="text-xs text-zinc-900 font-bold">{links.length} Links</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center gap-2">
            <Folder className="w-3.5 h-3.5 text-zinc-600" />
            <span className="text-xs text-zinc-500">Collections:</span>
            <span className="text-xs text-zinc-900 font-bold">{collections.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-xs flex items-center gap-2">
            <span className="text-xs text-zinc-500">Tags:</span>
            <span className="text-xs text-zinc-900 font-bold">{allTags.length}</span>
          </div>
        </div>
      </div>

      {/* 1. Collections Selector Bar */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-zinc-700" />
            <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-zinc-900">
              Curated Collections
            </span>
            <span className="text-[11px] text-zinc-400 hidden sm:inline">
              (Filter vault by topic binder)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowNewColModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-colors cursor-pointer border border-zinc-200"
          >
            <FolderPlus className="w-3.5 h-3.5 text-zinc-600" />
            <span>+ New Collection</span>
          </button>
        </div>

        {/* Binder Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCollectionId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              selectedCollectionId === 'all'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
            }`}
          >
            <span>All Bookmarks</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${selectedCollectionId === 'all' ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-200 text-zinc-700'}`}>
              {links.length}
            </span>
          </button>

          {collections.map((col) => {
            const isSelected = selectedCollectionId === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setSelectedCollectionId(col.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                <span>{col.title}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-zinc-800 text-zinc-200 font-bold' : 'bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {col.linkIds.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Binder Inspector Banner */}
        {activeCollection && (
          <div className="mt-3 p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-zinc-900">
                    {activeCollection.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-800 text-[10px] font-bold">
                    Active Collection
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{activeCollection.subtitle}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onShareCollection(activeCollection)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Share Summary</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAssignModal(activeCollection.id)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manage Links</span>
                </button>
              </div>
            </div>

            {/* Note Callout */}
            <div className="p-3 bg-white rounded-lg border border-zinc-200 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-zinc-900">Coach's Focus:</span>
                <p className="text-zinc-600 leading-relaxed">{activeCollection.coachSynthesis}</p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="text-[11px] text-zinc-500">
                {activeCollection.linkIds.length} bookmarks assigned to this collection
              </span>
            </div>
          </div>
        )}
      </section>

      {/* 2. Integrated Search, Presets & Filter Command Suite */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200/80 shadow-xs space-y-4">
        {/* Top Search Bar & Inline Ingest Trigger */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <label htmlFor="vaultSearchInput" className="sr-only">
              Search bookmarks by title, URL, author, or tag
            </label>
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <input
              id="vaultSearchInput"
              type="search"
              role="searchbox"
              data-testid="vault-search-input"
              aria-label="Search bookmarks by title, URL, author, or tag"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookmarks by title, URL, author, or tag... (⌘K / Ctrl+K)"
              className="w-full h-11 pl-10 pr-24 rounded-xl bg-zinc-50 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none border border-zinc-200 focus:bg-white focus:border-zinc-900 transition-all font-sans"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              )}
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600 text-[10px] font-mono font-semibold">
                ⌘K
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowInlineCapture(!showInlineCapture)}
            className={`h-11 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
              showInlineCapture
                ? 'bg-zinc-200 text-zinc-900'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white'
            }`}
          >
            <BookmarkPlus className="w-4 h-4" />
            <span className="hidden sm:inline">{showInlineCapture ? 'Close' : '+ Add Link'}</span>
          </button>
        </div>

        {/* Real-time Search Filter Status Banner */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between bg-zinc-50 px-3.5 py-2 rounded-xl border border-zinc-200 text-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-zinc-500 font-medium">Filter active:</span>
              <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-900 font-bold inline-flex items-center gap-1">
                "{searchQuery}"
              </span>
              <span className="text-zinc-500">
                · {filteredLinks.length} matching bookmarks across title, URL, or tags
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-zinc-900 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Collapsible Quick Ingest Form */}
        {showInlineCapture && (
          <form
            onSubmit={handleQuickSubmit}
            className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3 animate-in fade-in zoom-in duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                <BookmarkPlus className="w-4 h-4 text-zinc-700" />
                Quick Save
              </span>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-zinc-500" />
                Stored locally
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-6 relative">
                <input
                  type="url"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  placeholder="Paste URL here..."
                  className="w-full h-10 px-3 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 font-mono"
                />
                {quickConfig && (
                  <span className="absolute right-2 top-2.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-white">
                    {quickConfig.badgeName}
                  </span>
                )}
              </div>

              <div className="sm:col-span-6">
                <input
                  type="text"
                  value={quickTitle}
                  onChange={(e) => {
                    setQuickTitle(e.target.value);
                    if (quickTitleError && e.target.value.trim()) setQuickTitleError(false);
                  }}
                  placeholder="Title / Key Takeaway (Required)*"
                  className={`w-full h-10 px-3 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 ${
                    quickTitleError ? 'border-red-500 bg-red-50/40' : ''
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Coaching notes & synthesis (optional)..."
                  className="w-full h-9 px-3 rounded-lg bg-white border border-zinc-200 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900"
                />
              </div>

              <div className="sm:col-span-4 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const pick = DEMO_URLS[Math.floor(Math.random() * DEMO_URLS.length)];
                    setQuickUrl(pick.url);
                    setQuickTitle(pick.title);
                    setQuickNotes(pick.notes);
                    setQuickTags(pick.tags);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-200 text-zinc-700 text-[11px] font-semibold hover:bg-zinc-300"
                >
                  Sample
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Presets & Platform Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-zinc-100">
          {/* Platform Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActivePlatform('all')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'all'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <span>All</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-700 text-[10px] font-bold text-zinc-100">
                {platformCounts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('x')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'x'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
              <span>X / Twitter</span>
              <span className="text-zinc-500 text-[10px] font-medium">{platformCounts.x}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('threads')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'threads'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
              <span>Threads</span>
              <span className="text-zinc-500 text-[10px] font-medium">{platformCounts.threads}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('linkedin')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'linkedin'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              <span>LinkedIn</span>
              <span className="text-zinc-500 text-[10px] font-medium">{platformCounts.linkedin}</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('facebook')}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activePlatform === 'facebook'
                  ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              <span>Facebook</span>
              <span className="text-zinc-500 text-[10px] font-medium">{platformCounts.facebook}</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-zinc-400 font-semibold shrink-0">Presets:</span>
            {['#Coaching', '#Frameworks', '#Business', '#Marketing', '#Pricing'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePresetClick(p)}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-zinc-500" />
                <span>{p}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-2 py-1 text-[11px] text-zinc-700 hover:text-zinc-950 font-semibold flex items-center gap-0.5 cursor-pointer ml-1"
            >
              <span>{showAdvancedFilters ? 'Close' : 'Filters'}</span>
              {showAdvancedFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Taxonomy Tag Matrix */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-zinc-400 font-semibold">Popular Tags:</span>
          {tagCounts.map(({ tag, count }) => {
            const isSel = activeTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(isSel ? null : tag)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all flex items-center gap-1 cursor-pointer ${
                  isSel
                    ? 'bg-zinc-900 text-white font-bold shadow-xs'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <span>{tag}</span>
                <span className={`text-[10px] ${isSel ? 'text-zinc-300' : 'text-zinc-400'}`}>{count}</span>
              </button>
            );
          })}

          {isFilteringActive && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-2.5 py-0.5 rounded-full text-[11px] text-red-600 hover:bg-red-50 font-bold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Advanced Filters Expandable Grid */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-100 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Timeframe</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 outline-none"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Asset Format</label>
              <select
                value={assetFormat}
                onChange={(e) => setAssetFormat(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 outline-none"
              >
                <option value="all">All Formats</option>
                <option value="breakdown">Deep Breakdown</option>
                <option value="framework">Framework / Model</option>
                <option value="template">Template / Script</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="h-9 flex items-center justify-between px-3 bg-zinc-50 border border-zinc-200 rounded-lg cursor-pointer hover:bg-zinc-100">
                <span className="text-xs font-semibold text-zinc-900">Only With Takeaways</span>
                <input
                  type="checkbox"
                  checked={hasTakeaways}
                  onChange={(e) => setHasTakeaways(e.target.checked)}
                  className="accent-zinc-900 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}
      </section>

      {/* 3. Results Header: Count, Sort & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-zinc-900">
            Showing {filteredLinks.length} {filteredLinks.length === 1 ? 'bookmark' : 'bookmarks'}
          </span>
          {activeCollection && (
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-semibold">
              Collection: {activeCollection.title}
            </span>
          )}
          {searchQuery && (
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-900 text-xs font-semibold">
              Query: "{searchQuery}"
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 justify-between sm:justify-end shrink-0 flex-wrap">
          {onOpenWeeklyDigest && (
            <button
              type="button"
              onClick={onOpenWeeklyDigest}
              className="h-9 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              title="Generate weekly digest in WhatsApp, Newsletter, or Markdown format"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>Weekly Digest</span>
            </button>
          )}

          {/* Sort */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="h-9 pl-3 pr-8 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-semibold shadow-xs focus:outline-none cursor-pointer appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="relevance">Most Relevant</option>
              <option value="alpha">Title (A-Z)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 text-[16px] pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Cards vs List View Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 border border-zinc-200">
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                layoutMode === 'grid'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                layoutMode === 'list'
                  ? 'bg-white text-zinc-900 shadow-xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Showcase: Grid (Cards) or List View */}
      <section>
        {filteredLinks.length === 0 ? (
          <div className="w-full py-16 px-6 text-center rounded-2xl bg-white border border-zinc-200/80 shadow-xs my-4">
            <div className="w-12 h-12 rounded-full bg-zinc-100 mx-auto flex items-center justify-center text-zinc-400 mb-3">
              <Search className="w-5 h-5 text-zinc-400" />
            </div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-zinc-900">
              No bookmarks found
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1 mb-5">
              {searchQuery.trim()
                ? `No items matched your query "${searchQuery}" across title, URL, author, or tags.`
                : 'No links match the selected filters. Try clearing your filters to view all bookmarks.'}
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-all shadow-xs cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : layoutMode === 'grid' ? (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLinks.map((item) => {
              const config = PLATFORM_CONFIGS[item.platform];
              return (
                <article
                  key={item.id}
                  className="group rounded-xl bg-white border border-zinc-200/80 p-5 shadow-xs hover:border-zinc-300 transition-all duration-150 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${config.bgColor}`}
                        >
                          <span>{config.symbol}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-zinc-900">
                              {item.author || config.name}
                            </span>
                            {item.verified && (
                              <span className="material-symbols-outlined text-[14px] text-blue-600">
                                verified
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-500">
                            {item.authorHandle || `@${item.platform}`} · {config.name}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium shrink-0">
                        {item.displayTimeAgo || 'Recent'}
                      </span>
                    </div>

                    {/* Original Quote Banner Preview */}
                    {item.originalText && (
                      <div
                        className={`w-full rounded-xl p-3.5 mb-3 text-xs ${
                          item.platform === 'x'
                            ? 'bg-zinc-900 text-white'
                            : item.platform === 'threads'
                            ? 'bg-zinc-100 text-zinc-900'
                            : item.platform === 'linkedin'
                            ? 'bg-blue-50 text-blue-900 border border-blue-100'
                            : 'bg-zinc-100 text-zinc-900'
                        }`}
                      >
                        <p className="italic leading-relaxed font-serif">
                          "{renderHighlighted(item.originalText.replace(/^"|"$/g, ''), searchQuery)}"
                        </p>
                        {item.stats && (
                          <div className="mt-2 flex items-center gap-3 text-[10px] opacity-75 font-mono">
                            {item.stats.reposts && <span>{item.stats.reposts} Reposts</span>}
                            {item.stats.likes && <span>{item.stats.likes} Likes</span>}
                            {item.stats.bookmarks && <span>{item.stats.bookmarks} Saves</span>}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-zinc-900 leading-snug group-hover:text-zinc-700 transition-colors mb-1.5">
                      {renderHighlighted(item.title, searchQuery)}
                    </h3>

                    {/* URL Snippet */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 hover:text-zinc-900 font-mono truncate max-w-full mb-2.5">
                      <span className="material-symbols-outlined text-[13px] text-zinc-400 shrink-0">link</span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate hover:underline"
                        title={item.url}
                      >
                        {renderHighlighted(item.url, searchQuery)}
                      </a>
                    </div>

                    {/* Notes */}
                    {item.notes && (
                      <div className="p-3 rounded-lg bg-zinc-50 mb-3 border border-zinc-200/80">
                        <div className="flex items-center gap-1 text-zinc-500 text-[11px] font-semibold mb-1">
                          <Edit3 className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Takeaway:</span>
                        </div>
                        <p className="text-xs text-zinc-800 leading-relaxed">
                          {renderHighlighted(item.notes, searchQuery)}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      {item.tags.map((tag) => {
                        const isMatchedTag =
                          searchQuery.trim() !== '' &&
                          (tag.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                            tag
                              .toLowerCase()
                              .replace(/^#/, '')
                              .includes(searchQuery.toLowerCase().trim().replace(/^#/, '')));
                        return (
                          <span
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                              isMatchedTag
                                ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {renderHighlighted(tag, searchQuery)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onCopyLink(item.url)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLink(item.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onOpenReader && (
                        <button
                          type="button"
                          onClick={() => onOpenReader(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-all cursor-pointer border border-zinc-200"
                          title="Open focus reader"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-zinc-600" />
                          <span>Focus</span>
                        </button>
                      )}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all"
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col gap-2 w-full">
            {/* Headers */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-[11px] text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-200/80">
              <div className="col-span-5">Platform &amp; Title</div>
              <div className="col-span-4">Notes &amp; Synthesis</div>
              <div className="col-span-2">Tags &amp; Date</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Rows */}
            {filteredLinks.map((item) => {
              const config = PLATFORM_CONFIGS[item.platform];
              return (
                <div
                  key={item.id}
                  className="group flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 items-start md:items-center p-3.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition-all duration-150"
                >
                  {/* Col 5: Platform & Title */}
                  <div className="md:col-span-5 flex items-center gap-3 min-w-0 w-full">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${config.bgColor}`}
                    >
                      <span>{config.symbol}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-zinc-900 truncate group-hover:text-zinc-700 transition-colors">
                        {renderHighlighted(item.title, searchQuery)}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 truncate mt-0.5">
                        <span className="font-semibold text-zinc-900">{item.author || config.name}</span>
                        {item.verified && (
                          <span className="material-symbols-outlined text-[13px] text-blue-600">
                            verified
                          </span>
                        )}
                        <span>· {item.authorHandle || `@${item.platform}`} · {config.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono truncate mt-0.5">
                        <span className="material-symbols-outlined text-[13px] text-zinc-400 shrink-0">link</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate hover:underline text-zinc-500 hover:text-zinc-900"
                          title={item.url}
                        >
                          {renderHighlighted(item.url, searchQuery)}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Col 4: Synthesis */}
                  <div className="md:col-span-4 min-w-0 w-full">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 text-xs text-zinc-800 w-full truncate border border-zinc-200">
                      <Edit3 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="truncate">
                        {item.notes ? renderHighlighted(item.notes, searchQuery) : 'No notes recorded.'}
                      </span>
                    </div>
                  </div>

                  {/* Col 2: Tags & Date */}
                  <div className="md:col-span-2 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-1 min-w-0 w-full">
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.tags.slice(0, 2).map((tag) => {
                        const isMatchedTag =
                          searchQuery.trim() !== '' &&
                          (tag.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                            tag
                              .toLowerCase()
                              .replace(/^#/, '')
                              .includes(searchQuery.toLowerCase().trim().replace(/^#/, '')));
                        return (
                          <span
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors ${
                              isMatchedTag
                                ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-300'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            {renderHighlighted(tag, searchQuery)}
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-[11px] text-zinc-400 whitespace-nowrap">
                      {item.displayTimeAgo || 'Recent'}
                    </span>
                  </div>

                  {/* Col 1: Actions */}
                  <div className="md:col-span-1 flex items-center justify-end gap-1 w-full shrink-0">
                    {onOpenReader && (
                      <button
                        type="button"
                        onClick={() => onOpenReader(item)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                        title="Open focus reader"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onCopyLink(item.url)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteLink(item.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-colors"
                      title="Open source URL"
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

      {/* 5. Curation & Productivity Action Strip */}
      <section className="mt-8 rounded-2xl bg-white border border-zinc-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-zinc-900">
              Vault Operations &amp; Exports
            </h3>
            <p className="text-xs text-zinc-500">
              Generate a weekly executive broadcast digest or export your curated links to CSV.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            {onOpenBookmarklet && (
              <button
                type="button"
                onClick={onOpenBookmarklet}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-all cursor-pointer border border-zinc-200"
              >
                <span>+ Bookmarklet</span>
              </button>
            )}

            {onOpenWeeklyDigest && (
              <button
                type="button"
                onClick={onOpenWeeklyDigest}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                <span>Weekly Digest</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </section>

      {/* New Collection Modal */}
      {showNewColModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-150 border border-zinc-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5 text-zinc-700" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-zinc-900">
                  Create New Collection
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewColModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-900">Collection Name</label>
                <input
                  type="text"
                  required
                  value={newColTitle}
                  onChange={(e) => setNewColTitle(e.target.value)}
                  placeholder="e.g. Sales & Client Acquisition Frameworks"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-xs border border-zinc-200 focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-900">Brief Description</label>
                <textarea
                  value={newColSubtitle}
                  onChange={(e) => setNewColSubtitle(e.target.value)}
                  placeholder="Describe the focus and goals of this collection..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-xs border border-zinc-200 focus:bg-white focus:outline-none focus:border-zinc-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900">Primary Tag</label>
                  <input
                    type="text"
                    value={newColTag}
                    onChange={(e) => setNewColTag(e.target.value)}
                    placeholder="#Business"
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-xs border border-zinc-200 focus:bg-white focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-900">Color Theme</label>
                  <select
                    value={newColColor}
                    onChange={(e) => setNewColColor(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 text-zinc-900 text-xs border border-zinc-200 focus:bg-white focus:outline-none focus:border-zinc-900 cursor-pointer"
                  >
                    <option value="teal">Emerald</option>
                    <option value="blue">Blue</option>
                    <option value="slate">Slate Carbon</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNewColModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
