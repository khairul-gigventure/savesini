import React, { useState, useMemo, useEffect } from 'react';
import { SocialLink, PlatformType } from '../types';
import { exportToCSV } from '../utils/storage';
import { Search, X as CloseIcon, ArrowUpRight, Zap, RefreshCw, Download, HelpCircle } from 'lucide-react';

interface SearchFilterViewProps {
  links: SocialLink[];
  onOpenLink: (url: string) => void;
  onFilterUntagged: () => void;
}

export const SearchFilterView: React.FC<SearchFilterViewProps> = ({
  links,
  onOpenLink,
  onFilterUntagged,
}) => {
  const [query, setQuery] = useState('#Coaching');
  const [dateRange, setDateRange] = useState('all');
  const [platformNetwork, setPlatformNetwork] = useState('all');
  const [assetFormat, setAssetFormat] = useState('all');
  const [hasTakeaways, setHasTakeaways] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string | null>('#Coaching');
  const [sortOrder, setSortOrder] = useState<'relevance' | 'newest' | 'platform'>('relevance');

  // Command + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.getElementById('mainSearchInput');
        if (input) {
          input.focus();
          (input as HTMLInputElement).select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Preset pill clicks
  const handlePresetClick = (presetQuery: string) => {
    setQuery(presetQuery);
    setSelectedTag(presetQuery.startsWith('#') ? presetQuery : null);
  };

  // Tag Matrix with counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    links.forEach((l) => {
      l.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });
    // Ensure primary coaching tags are present
    const primaryTags = ['#Coaching', '#Frameworks', '#Marketing', '#ThreadsStrategy', '#Leadership', '#Business', '#Productivity', '#Health'];
    return primaryTags.map((tag) => ({
      tag,
      count: counts[tag] || 0,
    }));
  }, [links]);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
      setQuery('');
    } else {
      setSelectedTag(tag);
      setQuery(tag);
    }
  };

  const handleResetTags = () => {
    setSelectedTag(null);
    setQuery('');
  };

  // Filtered Results
  const searchResults = useMemo(() => {
    let list = [...links];

    // Platform Network
    if (platformNetwork !== 'all') {
      list = list.filter((l) => l.platform === platformNetwork);
    }

    // Has Takeaways toggle
    if (hasTakeaways) {
      list = list.filter((l) => l.notes && l.notes.trim().length > 0);
    }

    // Asset Format
    if (assetFormat !== 'all') {
      list = list.filter((l) => l.assetFormat === assetFormat);
    }

    // Date Range
    if (dateRange === '7d') {
      const cut = Date.now() - 7 * 24 * 60 * 60 * 1000;
      list = list.filter((l) => new Date(l.dateAdded).getTime() >= cut);
    } else if (dateRange === '30d') {
      const cut = Date.now() - 30 * 24 * 60 * 60 * 1000;
      list = list.filter((l) => new Date(l.dateAdded).getTime() >= cut);
    }

    // Query text match
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.notes.toLowerCase().includes(q) ||
          l.author.toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          (l.extractedInsight && l.extractedInsight.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    } else if (sortOrder === 'platform') {
      list.sort((a, b) => a.platform.localeCompare(b.platform));
    }

    return list;
  }, [links, platformNetwork, hasTakeaways, assetFormat, dateRange, query, sortOrder]);

  const handleExportFiltered = () => {
    exportToCSV(searchResults, `SaveSini_Search_${query.replace(/[^a-zA-Z0-9]/g, '_') || 'All'}.csv`);
  };

  // Helper to highlight matching keywords in titles and descriptions
  const renderHighlighted = (text: string, term: string) => {
    if (!term || !term.trim()) return text;
    const cleanTerm = term.replace(/^#/, '').trim();
    if (!cleanTerm) return text;

    const regex = new RegExp(`(${cleanTerm})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === cleanTerm.toLowerCase() ? (
        <mark key={i} className="bg-[#89f5e7]/50 text-[#131b2e] px-1 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Heading */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eaedff] text-[#131b2e] text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00685f]"></span>
            <span>INTELLIGENCE DISCOVERY • {links.length} CURATED ASSETS</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-extrabold text-[#131b2e] tracking-tight">
            Vault Query Engine
          </h1>
          <p className="text-sm text-[#3d4947] max-w-2xl leading-relaxed">
            Surgically filter coaching mental models, thread breakdowns, and high-signal execution templates indexed across Coach Khairul's ecosystem.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] uppercase tracking-wider text-[#3d4947] shrink-0 mr-1 font-semibold">
            Presets:
          </span>
          <button
            type="button"
            onClick={() => handlePresetClick('Client Onboarding')}
            className="px-3 py-1.5 rounded-full bg-white border border-[#eaedff] text-[#131b2e] hover:bg-[#008378] hover:text-white transition-all shadow-xs text-xs font-medium shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#00685f]" />
            <span>Client Onboarding</span>
          </button>

          <button
            type="button"
            onClick={() => handlePresetClick('Pricing Blueprint')}
            className="px-3 py-1.5 rounded-full bg-white border border-[#eaedff] text-[#131b2e] hover:bg-[#008378] hover:text-white transition-all shadow-xs text-xs font-medium shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#00685f]">monetization_on</span>
            <span>Pricing &amp; Offer Blueprints</span>
          </button>

          <button
            type="button"
            onClick={() => handlePresetClick('#ThreadsStrategy')}
            className="px-3 py-1.5 rounded-full bg-white border border-[#eaedff] text-[#131b2e] hover:bg-[#008378] hover:text-white transition-all shadow-xs text-xs font-medium shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-[#005eb5]">auto_graph</span>
            <span>High-Signal Threads</span>
          </button>
        </div>
      </div>

      {/* Main Filter Command Center */}
      <div className="bg-white rounded-2xl shadow-xl border border-[#eaedff] p-4 sm:p-6 transition-shadow">
        {/* Search Bar */}
        <div className="relative flex items-center mb-5">
          <Search className="w-6 h-6 absolute left-4 text-[#6d7a77] pointer-events-none" />
          <input
            id="mainSearchInput"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search frameworks, key takeaways, creators, or tags..."
            className="w-full pl-13 pr-28 py-3.5 sm:py-4 bg-[#f2f3ff] rounded-xl text-[#131b2e] font-['Plus_Jakarta_Sans'] text-base sm:text-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#00685f] shadow-inner placeholder:text-[#bcc9c6] transition-all"
          />
          <div className="absolute right-3 flex items-center gap-2">
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="w-8 h-8 rounded-lg bg-[#eaedff] text-[#3d4947] hover:text-[#131b2e] flex items-center justify-center transition-colors cursor-pointer"
                title="Clear input"
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
            <div className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-[#dae2fd] text-[#3d4947] text-[11px] font-mono font-semibold shadow-xs">
              ⌘K
            </div>
          </div>
        </div>

        {/* 4 Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-[#3d4947] mb-1">Date Range</label>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full appearance-none bg-[#f2f3ff] text-[#131b2e] text-xs font-medium py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00685f] cursor-pointer"
              >
                <option value="all">All time ({links.length} links)</option>
                <option value="7d">Past 7 days</option>
                <option value="30d">Past 30 days</option>
                <option value="quarter">This Quarter</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6d7a77] pointer-events-none text-[18px]">
                expand_more
              </span>
            </div>
          </div>

          {/* Platform Network */}
          <div>
            <label className="block text-xs font-semibold text-[#3d4947] mb-1">Platform Network</label>
            <div className="relative">
              <select
                value={platformNetwork}
                onChange={(e) => setPlatformNetwork(e.target.value)}
                className="w-full appearance-none bg-[#f2f3ff] text-[#131b2e] text-xs font-medium py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00685f] cursor-pointer"
              >
                <option value="all">All Platforms (4)</option>
                <option value="x">X / Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="threads">Threads</option>
                <option value="facebook">Facebook</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6d7a77] pointer-events-none text-[18px]">
                tune
              </span>
            </div>
          </div>

          {/* Asset Format */}
          <div>
            <label className="block text-xs font-semibold text-[#3d4947] mb-1">Asset Format</label>
            <div className="relative">
              <select
                value={assetFormat}
                onChange={(e) => setAssetFormat(e.target.value)}
                className="w-full appearance-none bg-[#f2f3ff] text-[#131b2e] text-xs font-medium py-2.5 pl-3.5 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00685f] cursor-pointer"
              >
                <option value="all">All Formats</option>
                <option value="breakdown">Deep Breakdown</option>
                <option value="framework">Visual Framework</option>
                <option value="template">Swipe Template</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-[#6d7a77] pointer-events-none text-[18px]">
                category
              </span>
            </div>
          </div>

          {/* Has Takeaways Toggle */}
          <div className="flex flex-col justify-end">
            <label className="h-10 flex items-center justify-between px-3.5 bg-[#f2f3ff] rounded-xl cursor-pointer hover:bg-[#eaedff] transition-colors shadow-xs">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[18px]">verified</span>
                <span className="text-xs font-semibold text-[#131b2e]">Has Takeaways</span>
              </span>
              <input
                type="checkbox"
                checked={hasTakeaways}
                onChange={(e) => setHasTakeaways(e.target.checked)}
                className="w-4 h-4 text-[#00685f] rounded accent-[#00685f] cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Taxonomy Matrix • Coaching Pillars */}
      <div className="bg-[#f2f3ff] rounded-2xl p-5 border border-[#eaedff]">
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685f] text-[20px]">segment</span>
            <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#131b2e]">
              Taxonomy Matrix • Coaching Pillars
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetTags}
            className="text-xs text-[#00685f] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <span>Reset tags</span>
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tagCounts.map(({ tag, count }) => {
            const isActive = selectedTag === tag;
            return (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#008378] text-[#f4fffc] font-semibold'
                    : 'bg-white text-[#3d4947] hover:text-[#131b2e] hover:bg-[#eaedff]'
                }`}
              >
                <span>{tag}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-[#89f5e7]/30 text-white' : 'bg-[#eaedff] text-[#3d4947]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Count and Sort Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div className="flex items-center gap-3">
          <span className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-[#131b2e]">
            Showing {searchResults.length} matching results
          </span>
          {query && (
            <span className="px-2 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] text-xs font-semibold">
              Query: {query}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#3d4947]">
            <span>Sort:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="bg-white border border-[#eaedff] text-[#131b2e] text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xs focus:outline-none cursor-pointer"
            >
              <option value="relevance">Highest Relevance</option>
              <option value="newest">Newest First</option>
              <option value="platform">By Platform</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportFiltered}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-xs font-semibold shadow-xs transition-opacity cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ({searchResults.length}) CSV</span>
          </button>
        </div>
      </div>

      {/* Results Grid (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {searchResults.map((item) => {
          let badgeBg = 'bg-black text-white';
          let symbol = 'X';
          if (item.platform === 'linkedin') {
            badgeBg = 'bg-[#0A66C2] text-white';
            symbol = 'in';
          } else if (item.platform === 'threads') {
            badgeBg = 'bg-[#101010] text-white';
            symbol = '@';
          } else if (item.platform === 'facebook') {
            badgeBg = 'bg-[#1877F2] text-white';
            symbol = 'f';
          }

          return (
            <article
              key={item.id}
              className="bg-white rounded-2xl p-5 shadow-xs border border-[#eaedff] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${badgeBg}`}>
                      <span>{symbol}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-[#131b2e]">{item.author}</span>
                        {item.verified && (
                          <span className="material-symbols-outlined text-[#00685f] text-[14px]">
                            verified
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#3d4947]">
                        {item.displayTimeAgo || 'Recently'} • {item.authorHandle}
                      </span>
                    </div>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-[#d6e3ff] text-[#001b3d] text-[11px] font-semibold">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Title with Highlight */}
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#131b2e] mb-2 leading-snug">
                  {renderHighlighted(item.title, query)}
                </h3>

                {/* Body Notes */}
                <p className="text-xs text-[#3d4947] mb-4 leading-relaxed line-clamp-3">
                  {renderHighlighted(item.notes, query)}
                </p>

                {/* Extracted Vault Insight Box */}
                {item.extractedInsight && (
                  <div className="p-3 bg-[#f2f3ff] rounded-xl mb-4 border border-[#eaedff]">
                    <span className="text-[10px] text-[#00685f] font-bold uppercase tracking-wider block mb-1">
                      Extracted Vault Insight
                    </span>
                    <p className="text-xs text-[#131b2e] italic leading-relaxed">
                      "{item.extractedInsight.replace(/^"|"$/g, '')}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Tags & Link Out */}
              <div className="flex items-center justify-between pt-3 border-t border-[#eaedff]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      onClick={() => handleTagClick(t)}
                      className="px-2 py-0.5 rounded-md bg-[#eaedff] text-[11px] text-[#3d4947] font-medium cursor-pointer hover:bg-[#dae2fd] transition-colors"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#eaedff] flex items-center justify-center text-[#131b2e] hover:bg-[#00685f] hover:text-white transition-colors cursor-pointer"
                  title="Open source asset"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </article>
          );
        })}
      </div>

      {/* Untagged Links Reminder Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#eaedff] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#008378] text-[#f4fffc] flex items-center justify-center shrink-0 shadow-xs">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-[#131b2e]">
              Looking for uncategorized bookmarks?
            </h4>
            <p className="text-xs sm:text-sm text-[#3d4947] mt-0.5">
              There are currently 3 raw items awaiting automated taxonomy tags in your quick inbox.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onFilterUntagged}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-[#e2e7ff] hover:bg-[#dae2fd] text-[#131b2e] text-xs font-semibold transition-colors shrink-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Review 3 Untagged Links</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
