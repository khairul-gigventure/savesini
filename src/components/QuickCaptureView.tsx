import React, { useState, useEffect } from 'react';
import { SocialLink, PlatformType } from '../types';
import { detectPlatform, DEMO_URLS, PLATFORM_CONFIGS, extractHandleFromUrl } from '../utils/platformDetect';
import { enrichUrlMetadata } from '../utils/linkEnricher';
import { useVoiceInput } from '../hooks/useVoiceInput';
import confetti from 'canvas-confetti';
import {
  PlayCircle,
  Clipboard,
  Bookmark,
  ArrowRight,
  Copy,
  ExternalLink,
  Plus,
  Sparkles,
  Mic,
  MicOff,
  AlertCircle,
  BookmarkPlus,
  Check,
} from 'lucide-react';

interface QuickCaptureViewProps {
  links: SocialLink[];
  onSaveLink: (newLink: Omit<SocialLink, 'id' | 'dateAdded'>) => void;
  onNavigateToVault: () => void;
  onCopyLink: (url: string) => void;
  storageFreePercentage?: number;
  onOpenBookmarklet?: () => void;
}

const DEFAULT_TAGS = ['#Coaching', '#Frameworks', '#Business', '#Marketing', '#Leadership', '#Productivity'];

export const QuickCaptureView: React.FC<QuickCaptureViewProps> = ({
  links,
  onSaveLink,
  onNavigateToVault,
  onCopyLink,
  onOpenBookmarklet,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [snapshotText, setSnapshotText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#Coaching']);
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformType | null>(null);
  const [titleError, setTitleError] = useState(false);
  const [customTagInput, setCustomTagInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);

  // Voice-to-text integration for notes
  const {
    isListening,
    isSupported: isVoiceSupported,
    toggleListening,
    errorMessage: voiceError,
  } = useVoiceInput({
    lang: 'en-US',
    onTranscript: (spokenText) => {
      setNotes((prev) => {
        const trimmed = prev.trim();
        return trimmed ? `${trimmed} ${spokenText}` : spokenText;
      });
    },
  });

  // Duplicate link detection
  const existingDuplicate = React.useMemo(() => {
    if (!url.trim()) return null;
    const cleanCurrent = url.trim().toLowerCase();
    return links.find((l) => l.url.trim().toLowerCase() === cleanCurrent) || null;
  }, [url, links]);

  // Auto-detect platform when URL changes
  useEffect(() => {
    if (!url.trim()) {
      setDetectedPlatform(null);
    } else {
      setDetectedPlatform(detectPlatform(url));
    }
  }, [url]);

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Smart Auto-Enrichment Handler
  const handleAutoEnrich = () => {
    if (!url.trim()) return;
    setIsExtracting(true);
    setTimeout(() => {
      const enriched = enrichUrlMetadata(url);
      setTitle(enriched.title);
      if (!notes.trim()) setNotes(enriched.notes);
      if (enriched.originalText && !snapshotText.trim()) setSnapshotText(enriched.originalText);
      setSelectedTags(enriched.tags);
      setTitleError(false);
      setIsExtracting(false);
      setExtractedSuccess(true);
      setTimeout(() => setExtractedSuccess(false), 2000);
    }, 400);
  };

  const handleDemoPaste = () => {
    const randomPick = DEMO_URLS[Math.floor(Math.random() * DEMO_URLS.length)];
    setUrl(randomPick.url);
    setTitle(randomPick.title);
    setNotes(randomPick.notes);
    setSelectedTags(randomPick.tags);
    setSnapshotText('Direct quote preview extracted from social reference for offline preservation.');
    setTitleError(false);
  };

  const handleClipboardPaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          const enriched = enrichUrlMetadata(text);
          if (!title) {
            setTitle(enriched.title);
            if (enriched.originalText) setSnapshotText(enriched.originalText);
            if (enriched.tags) setSelectedTags(enriched.tags);
          }
        }
      }
    } catch {
      // Fallback
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    let clean = customTagInput.trim();
    if (!clean) {
      setShowCustomInput(false);
      return;
    }
    if (!clean.startsWith('#')) clean = `#${clean}`;
    if (!availableTags.includes(clean)) {
      setAvailableTags([...availableTags, clean]);
    }
    if (!selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean]);
    }
    setCustomTagInput('');
    setShowCustomInput(false);
  };

  const clearForm = () => {
    setUrl('');
    setTitle('');
    setNotes('');
    setSnapshotText('');
    setSelectedTags(['#Coaching']);
    setDetectedPlatform(null);
    setTitleError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!title.trim()) {
      setTitleError(true);
      const titleInput = document.getElementById('link-title');
      if (titleInput) titleInput.focus();
      return;
    }
    setTitleError(false);

    const platform = detectPlatform(url || 'https://x.com');
    const authorHandle = extractHandleFromUrl(url, platform);

    onSaveLink({
      url: url.trim() || 'https://x.com',
      platform,
      title: title.trim(),
      notes: notes.trim() || 'No specific notes recorded.',
      originalText: snapshotText.trim() || undefined,
      tags: selectedTags.length > 0 ? selectedTags : ['#Coaching'],
      author: authorHandle.replace('@', ''),
      authorHandle,
      verified: true,
      displayTimeAgo: 'Just now',
    });

    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00685f', '#89f5e7', '#005eb5'],
      });
    } catch {
      // Non-critical
    }

    clearForm();
  };

  const recentCaptures = links.slice(0, 3);
  const platformConfig = detectedPlatform ? PLATFORM_CONFIGS[detectedPlatform] : null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 font-['Inter']">
      {/* 1. Header Section - Minimalist */}
      <div className="max-w-2xl mx-auto text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-800 text-xs font-semibold tracking-wide border border-zinc-200">
          <BookmarkPlus className="w-3.5 h-3.5 text-zinc-600" />
          <span>Quick Capture</span>
        </div>
        <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Capture Social Intel &amp; Frameworks
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
          Instantly save high-signal posts from X, Threads, LinkedIn, or Facebook. Platform detection and metadata extraction are processed client-side.
        </p>

        {onOpenBookmarklet && (
          <div className="pt-1">
            <button
              type="button"
              onClick={onOpenBookmarklet}
              className="text-xs text-zinc-700 hover:text-zinc-900 underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <span>+ Install 1-Click Browser Bookmarklet</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Primary Capture Card - Minimalist Elevation Surface */}
      <div className="w-full bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs relative">
        {/* Duplicate Link Warning Banner */}
        {existingDuplicate && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <span className="font-bold text-amber-900">This URL is already in your vault:</span>
              <p className="text-amber-800">
                "{existingDuplicate.title}" (Saved{' '}
                {new Date(existingDuplicate.dateAdded).toLocaleDateString('en-US')}). You can still save if you wish to record a different insight.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToVault}
              className="px-2.5 py-1 rounded-lg bg-amber-800 text-white font-semibold text-[11px] shrink-0 hover:bg-amber-900 cursor-pointer"
            >
              View in Vault
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Step 1: URL Input Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="link-url" className="text-xs sm:text-sm text-zinc-900 font-bold flex items-center gap-1.5">
                <span>Social Post URL</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDemoPaste}
                  className="text-xs text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>Sample</span>
                </button>
                <button
                  type="button"
                  onClick={handleClipboardPaste}
                  className="text-xs px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition-colors flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Clipboard className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Paste</span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center">
              <input
                id="link-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste post link from X, LinkedIn, Threads, or Facebook..."
                className="w-full h-11 pl-3.5 pr-44 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm rounded-xl border border-zinc-200 outline-none focus:bg-white focus:border-zinc-900 transition-all font-mono"
              />

              {/* Action Buttons inside Input */}
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {url.trim() && (
                  <button
                    type="button"
                    onClick={handleAutoEnrich}
                    disabled={isExtracting}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-semibold transition-all shadow-xs cursor-pointer"
                    title="Auto-extract title and key metadata"
                  >
                    {isExtracting ? (
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : extractedSuccess ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-zinc-300" />
                    )}
                    <span>{isExtracting ? 'Parsing...' : extractedSuccess ? 'Filled' : 'Auto-Fill'}</span>
                  </button>
                )}

                {platformConfig && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 pl-1 font-mono">
                    · {platformConfig.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Title / Core Takeaway */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="link-title" className="text-xs sm:text-sm text-zinc-900 font-bold flex items-center gap-1">
                <span>Title / Primary Takeaway</span>
                <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">Required</span>
            </div>
            <div>
              <input
                id="link-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError && e.target.value.trim()) setTitleError(false);
                }}
                placeholder="e.g. 10 Frameworks for Scaling High-Ticket Advisory / Founder Performance Model"
                className={`w-full h-11 px-3.5 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm rounded-xl border border-zinc-200 outline-none focus:bg-white focus:border-zinc-900 transition-all ${
                  titleError ? 'border-red-500 bg-red-50/50' : ''
                }`}
              />
              {titleError && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">
                  A title is required to save this bookmark.
                </p>
              )}
            </div>
          </div>

          {/* Step 3: Snapshot Quote / Text (Offline Preservation) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="link-snapshot" className="text-xs font-bold text-zinc-900">
                Original Post Excerpt / Quote (Optional)
              </label>
              <span className="text-[11px] text-zinc-500">Preserved offline even if the original post is deleted</span>
            </div>
            <textarea
              id="link-snapshot"
              value={snapshotText}
              onChange={(e) => setSnapshotText(e.target.value)}
              placeholder="Paste exact quote or key sentence for long-term reference..."
              rows={2}
              className="w-full p-3 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-xs rounded-xl border border-zinc-200 outline-none focus:bg-white focus:border-zinc-900 resize-none font-serif italic transition-all leading-relaxed"
            />
          </div>

          {/* Step 4: Tags Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900">Categories &amp; Tags</label>
              <span className="text-[11px] text-zinc-400">Select relevant tags</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}

              {showCustomInput ? (
                <div className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      } else if (e.key === 'Escape') {
                        setShowCustomInput(false);
                      }
                    }}
                    autoFocus
                    placeholder="#Tag..."
                    className="w-24 h-7 px-2.5 text-xs rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-2.5 py-1 text-xs font-semibold text-white bg-zinc-900 rounded-full hover:bg-zinc-800"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="px-3 py-1 rounded-full text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-medium flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-zinc-500" />
                  <span>New Tag</span>
                </button>
              )}
            </div>
          </div>

          {/* Step 5: Notes + Voice Recording */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="link-notes" className="text-xs font-bold text-zinc-900">
                Coach's Synthesis &amp; Action Plan
              </label>

              {/* Voice-to-Text Button */}
              {isVoiceSupported ? (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse shadow-sm'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                  title={isListening ? 'Click to stop recording' : 'Record voice note'}
                >
                  {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-zinc-500" />}
                  <span>{isListening ? 'Listening... Speak now' : 'Voice Note'}</span>
                </button>
              ) : null}
            </div>

            {voiceError && (
              <p className="text-[11px] text-red-500">{voiceError}</p>
            )}

            <div className="relative">
              <textarea
                id="link-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Personal synthesis, client debrief talking points, or roadmap action steps..."
                rows={3}
                className="w-full p-3.5 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 text-xs sm:text-sm rounded-xl border border-zinc-200 outline-none focus:bg-white focus:border-zinc-900 resize-none transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Form Actions Bar */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={clearForm}
              className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold cursor-pointer"
            >
              Clear Form
            </button>

            <button
              type="submit"
              id="submit-vault-btn"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <Bookmark className="w-4 h-4 fill-white" />
              <span>Save to Vault</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono leading-none">
                Ctrl+↵
              </kbd>
            </button>
          </div>
        </form>
      </div>

      {/* 3. Bottom "Recent Captures" - Minimalist Clean List */}
      <div className="w-full space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="font-['Plus_Jakarta_Sans'] text-sm sm:text-base font-bold text-zinc-900">
              Recent Saves
            </h2>
            <span className="text-xs text-zinc-500">· {recentCaptures.length} bookmarks</span>
          </div>
          <button
            onClick={onNavigateToVault}
            className="inline-flex items-center gap-1 text-xs text-zinc-700 hover:text-zinc-950 font-bold transition-colors cursor-pointer"
          >
            <span>View All ({links.length}) in Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {recentCaptures.map((item) => {
            const config = PLATFORM_CONFIGS[item.platform];
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200/80 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${config.bgColor}`}
                  >
                    <span>{config.symbol}</span>
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h3 className="font-semibold text-xs sm:text-sm text-zinc-900 truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                      <span className="font-medium text-zinc-800">{item.author || config.name}</span>
                      <span>·</span>
                      <span className="truncate max-w-[200px] font-mono text-zinc-400">{item.url.replace(/^https?:\/\//, '')}</span>
                      <span>·</span>
                      <span>{item.displayTimeAgo || 'Recently'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-3">
                  <button
                    type="button"
                    onClick={() => onCopyLink(item.url)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Copy Link"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                    title="Open Source Asset"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
