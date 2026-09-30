import React, { useState } from 'react';
import { CoachingCollection, SocialLink } from '../types';
import {
  FolderPlus,
  Share2,
  ExternalLink,
  ChevronRight,
  GripVertical,
  Link as LinkIcon,
  CheckCircle,
  Folder,
  ArrowUp,
  ArrowDown,
  Plus,
  Sparkles,
} from 'lucide-react';

interface CollectionsViewProps {
  collections: CoachingCollection[];
  links: SocialLink[];
  onUpdateCollections: (newCols: CoachingCollection[]) => void;
  onOpenAssignModal: (collectionId: string) => void;
  onShareCollection: (collection: CoachingCollection) => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  links,
  onUpdateCollections,
  onOpenAssignModal,
  onShareCollection,
}) => {
  const [selectedBinderId, setSelectedBinderId] = useState<string>(collections[0]?.id || 'col-1');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newTag, setNewTag] = useState('#Operations');
  const [newColor, setNewColor] = useState<'teal' | 'blue' | 'slate'>('teal');

  const activeCollection = collections.find((c) => c.id === selectedBinderId) || collections[0];

  // Resolve links for the active collection in order
  const activeLinks = (activeCollection?.linkIds || [])
    .map((id) => links.find((l) => l.id === id))
    .filter(Boolean) as SocialLink[];

  // Re-ordering logic
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!activeCollection) return;
    const newLinkIds = [...activeCollection.linkIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newLinkIds.length) return;

    const temp = newLinkIds[index];
    newLinkIds[index] = newLinkIds[targetIndex];
    newLinkIds[targetIndex] = temp;

    const updated = collections.map((col) =>
      col.id === activeCollection.id ? { ...col, linkIds: newLinkIds } : col
    );
    onUpdateCollections(updated);
  };

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newCol: CoachingCollection = {
      id: `col-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Curated coaching intelligence binder.',
      tags: [newTag.startsWith('#') ? newTag : `#${newTag}`, '#Frameworks'],
      color: newColor,
      coachSynthesis: 'Active intelligence binder created for Coach Khairul client programs.',
      linkIds: links.slice(0, 4).map((l) => l.id),
      avatarPreviews: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDdUIAd6MwRSMwscowusnHfkkWUk7zkgNEAgunx7tZvbg1hrGY6VAjfqZ6zbQ722MJSHYlkY-wHc4t7dAd6YpXI6zpg4fdMcNCIAdf2KyeltPKbNxce41LWvriYSzmUk4PE2GM2v9WtCF_InTpmeTWsg8IUYiO11v6IjLzmfmknzhAijjJl3e3izvUKWahqCHzqTQqYXggBgJKBQ4WaNx5RgW5Gto9F-53DWkal96XCG3WFN3rlmVth',
      ],
      readinessScore: 60,
      updatedAt: 'Just now',
      activePillar: false,
    };

    onUpdateCollections([newCol, ...collections]);
    setSelectedBinderId(newCol.id);
    setShowNewModal(false);
    setNewTitle('');
    setNewSubtitle('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Action Bar & Stat Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#89f5e7] text-[#00201d] text-[11px] font-semibold uppercase tracking-wider">
              Curation Architecture
            </span>
            <span className="text-[#bcc9c6] text-[12px]">•</span>
            <span className="text-[#3d4947] text-xs">Coach Khairul Vault</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-extrabold text-[#131b2e] tracking-tight">
            Collections &amp; Coaching Pillars
          </h1>
          <p className="text-sm text-[#3d4947] max-w-2xl leading-relaxed">
            Curated binders grouping your saved intelligence for specific coaching cohorts, live masterminds, and client execution frameworks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ New Collection</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#eaedff] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#89f5e7]/40 flex items-center justify-center text-[#00685f] shrink-0">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#3d4947] uppercase tracking-wider font-semibold block">
              Active Pillars
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#131b2e]">
                {collections.length}
              </span>
              <span className="text-xs text-[#00685f] font-medium">All cohorts synced</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#eaedff] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#d6e3ff]/40 flex items-center justify-center text-[#005eb5] shrink-0">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#3d4947] uppercase tracking-wider font-semibold block">
              Total Synced Links
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#131b2e]">
                {links.length}
              </span>
              <span className="text-xs text-[#3d4947]">Across 4 platforms</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#eaedff] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eaedff] flex items-center justify-center text-[#00685f] shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] text-[#3d4947] uppercase tracking-wider font-semibold block">
              Vault Hygiene
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Plus_Jakarta_Sans'] text-2xl font-bold text-[#00685f]">0</span>
              <span className="text-xs text-[#3d4947]">Uncategorized links left</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Split: Collection Cards & Live Binder Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 4 Interactive Pillar Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs text-[#3d4947] uppercase tracking-wider font-semibold">
              Active Coaching Binders
            </span>
            <span className="text-xs text-[#00685f] font-medium">Click binder to preview files</span>
          </div>

          {collections.map((col) => {
            const isSelected = col.id === selectedBinderId;
            let iconSymbol = 'target';
            if (col.color === 'blue') iconSymbol = 'psychology';
            if (col.color === 'slate') iconSymbol = 'podcasts';

            return (
              <div
                key={col.id}
                onClick={() => setSelectedBinderId(col.id)}
                className={`cursor-pointer p-5 rounded-2xl bg-white border transition-all duration-200 relative overflow-hidden group ${
                  isSelected
                    ? 'border-[#00685f] shadow-md ring-2 ring-[#00685f]/20'
                    : 'border-[#eaedff] shadow-xs hover:shadow-md'
                }`}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors ${
                    isSelected ? 'bg-[#00685f]' : 'bg-transparent group-hover:bg-[#eaedff]'
                  }`}
                />

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#89f5e7]/30 text-[#00685f] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">{iconSymbol}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#131b2e] group-hover:text-[#00685f] transition-colors">
                          {col.title}
                        </h3>
                        {col.activePillar && (
                          <span className="px-2 py-0.5 rounded-full bg-[#008378] text-white text-[10px] font-semibold">
                            Active Pillar
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#3d4947] line-clamp-2 leading-relaxed">
                        {col.subtitle}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-2">
                        {col.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-[#eaedff] text-[#3d4947] text-[11px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Count & Time */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                    <span className="px-2.5 py-1 rounded-full bg-[#eaedff] text-xs text-[#131b2e] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-[#00685f]">bookmark</span>
                      {col.linkIds.length} Links
                    </span>
                    <span className="text-[11px] text-[#3d4947]">{col.updatedAt}</span>
                  </div>
                </div>

                {/* Avatar Preview Stack */}
                <div className="mt-4 pt-3 flex items-center justify-between bg-[#f2f3ff]/60 rounded-xl p-2.5">
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    {col.avatarPreviews.slice(0, 3).map((imgUrl, i) => (
                      <img
                        key={i}
                        src={imgUrl}
                        alt="Preview thumbnail"
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                      />
                    ))}
                    {col.linkIds.length > col.avatarPreviews.length && (
                      <div className="h-7 w-7 rounded-full bg-[#eaedff] text-[#131b2e] text-[10px] font-bold flex items-center justify-center">
                        +{col.linkIds.length - col.avatarPreviews.length}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[#00685f] text-xs font-semibold">
                    <span>View Contents</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Inside Selected Collection Preview Drawer (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-[#eaedff] shadow-md space-y-6">
            {/* Binder Header */}
            <div className="space-y-3 pb-4 border-b border-[#eaedff]">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[#89f5e7]/40 text-[#00685f] text-xs font-semibold">
                  Active Inspector
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onShareCollection(activeCollection)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#3d4947] hover:text-[#131b2e] transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share / Export</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#131b2e]">
                  {activeCollection?.title}
                </h2>
                <p className="text-xs text-[#3d4947] leading-relaxed">
                  {activeCollection?.subtitle}
                </p>
              </div>

              {/* Coach Synthesis Box */}
              <div className="p-3.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#00685f] text-xs font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Coach Khairul's Synthesis Note</span>
                </div>
                <p className="text-xs text-[#3d4947] leading-relaxed">
                  {activeCollection?.coachSynthesis}
                </p>
              </div>
            </div>

            {/* Draggable / Re-order Item List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#3d4947] uppercase tracking-wider font-semibold">
                  Curation Sequence (Re-orderable)
                </span>
                <span className="text-[11px] text-[#6d7a77]">Use arrows to prioritize</span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {activeLinks.map((item, index) => {
                  let badgeBg = 'bg-black text-white';
                  let symbol = '𝕏';
                  if (item.platform === 'linkedin') {
                    badgeBg = 'bg-[#0A66C2] text-white';
                    symbol = 'in';
                  } else if (item.platform === 'threads') {
                    badgeBg = 'bg-[#101010] text-white';
                    symbol = '@';
                  } else if (item.platform === 'facebook') {
                    badgeBg = 'bg-[#1877F2] text-white';
                    symbol = 'fb';
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-[#f2f3ff]/70 hover:bg-[#eaedff] border border-[#eaedff]/60 transition-colors group"
                    >
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5 text-[#6d7a77]">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveItem(index, 'up')}
                          className="p-0.5 hover:text-[#131b2e] disabled:opacity-20 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === activeLinks.length - 1}
                          onClick={() => moveItem(index, 'down')}
                          className="p-0.5 hover:text-[#131b2e] disabled:opacity-20 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-7 h-7 rounded-lg ${badgeBg} flex items-center justify-center shrink-0 font-bold text-[11px]`}
                      >
                        {symbol}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-[#131b2e] truncate">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-[#3d4947] truncate">
                          {item.author} • {item.notes?.slice(0, 40)}...
                        </p>
                      </div>

                      {/* Open Link */}
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-[#6d7a77] hover:text-[#00685f] transition-colors shrink-0"
                        title="Open source"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onOpenAssignModal(activeCollection.id)}
                className="w-full py-2 rounded-xl bg-[#eaedff] text-[#131b2e] hover:bg-[#dae2fd] text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#00685f]" />
                <span>Assign More Saved Links</span>
              </button>
            </div>

            {/* Cohort Readiness Index */}
            <div className="p-4 rounded-xl bg-[#f2f3ff] space-y-2 border border-[#eaedff]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#131b2e]">Cohort Readiness Index</span>
                <span className="text-[#00685f] font-bold">{activeCollection.readinessScore}% Complete</span>
              </div>
              <div className="w-full bg-[#dae2fd] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#00685f] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${activeCollection.readinessScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#3d4947]">
                <span>{activeLinks.length} resources reviewed by coach</span>
                <span>Target: 100% before kickoff</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Collection Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#89f5e7]/40 text-[#00685f] flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#131b2e]">
                  Create Coaching Pillar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1 rounded-lg text-[#6d7a77] hover:bg-[#eaedff] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#131b2e]">Pillar / Binder Name</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Scaling Mastermind Ops 2025"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#bcc9c6] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#131b2e]">Cohort Context &amp; Objective</label>
                <textarea
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Explain how clients will use this curated intel..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#bcc9c6] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00685f] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#131b2e]">Primary Pillar Tag</label>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="#Operations"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f2f3ff] text-[#131b2e] placeholder:text-[#bcc9c6] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#131b2e]">Color Token</label>
                  <select
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#f2f3ff] text-[#131b2e] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00685f] cursor-pointer"
                  >
                    <option value="teal">Teal (Primary Focus)</option>
                    <option value="blue">Blue (Systems &amp; Growth)</option>
                    <option value="slate">Dark Slate (Mindset)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#3d4947] hover:text-[#131b2e] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Initialize Pillar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
