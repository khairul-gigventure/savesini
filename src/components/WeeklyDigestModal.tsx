import React, { useState, useMemo } from 'react';
import { SocialLink, CoachingCollection } from '../types';
import { generateWeeklyDigest } from '../utils/linkEnricher';
import { X as CloseIcon, Copy, Check, Download, FileText, Send, Sparkles } from 'lucide-react';

interface WeeklyDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: SocialLink[];
  collections: CoachingCollection[];
}

export const WeeklyDigestModal: React.FC<WeeklyDigestModalProps> = ({
  isOpen,
  onClose,
  links,
  collections,
}) => {
  const [format, setFormat] = useState<'whatsapp' | 'newsletter' | 'markdown'>('whatsapp');
  const [filterScope, setFilterScope] = useState<'all' | '7d' | '30d'>('7d');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [isCopied, setIsCopied] = useState(false);

  const candidateLinks = useMemo(() => {
    let result = [...links];

    // Filter by Folder
    if (selectedFolderId !== 'all') {
      const col = collections.find((c) => c.id === selectedFolderId);
      if (col) {
        const allowedIds = new Set(col.linkIds);
        result = result.filter((l) => allowedIds.has(l.id));
      }
    }

    // Filter by date
    if (filterScope === '7d') {
      const cut = Date.now() - 7 * 24 * 60 * 60 * 1000;
      result = result.filter((l) => new Date(l.dateAdded).getTime() >= cut);
    } else if (filterScope === '30d') {
      const cut = Date.now() - 30 * 24 * 60 * 60 * 1000;
      result = result.filter((l) => new Date(l.dateAdded).getTime() >= cut);
    }

    return result;
  }, [links, collections, selectedFolderId, filterScope]);

  const activeColTitle =
    selectedFolderId !== 'all' ? collections.find((c) => c.id === selectedFolderId)?.title : undefined;

  const digestContent = useMemo(() => {
    return generateWeeklyDigest(candidateLinks, format, activeColTitle);
  }, [candidateLinks, format, activeColTitle]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(digestContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([digestContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SaveSini_Digest_${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 font-['Inter']">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-3 bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-zinc-900 leading-tight">
                Weekly Intel Digest Generator
              </h3>
              <p className="text-xs text-zinc-500">
                Synthesize selected bookmarks into ready-to-share broadcasts or Notion/Obsidian Markdown docs.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Controls Toolbar */}
        <div className="p-4 sm:p-6 bg-white border-b border-zinc-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Format Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-900 mb-1">
                Output Format:
              </label>
              <div className="flex rounded-xl bg-zinc-100 p-0.5 border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setFormat('whatsapp')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    format === 'whatsapp'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Send className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('newsletter')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    format === 'newsletter'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <FileText className="w-3 h-3 text-blue-600" />
                  <span>Newsletter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('markdown')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    format === 'markdown'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold">.md</span>
                  <span>Notion</span>
                </button>
              </div>
            </div>

            {/* Scope selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-900 mb-1">Timeframe:</label>
              <select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value as any)}
                className="w-full h-9 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium outline-none cursor-pointer focus:bg-white"
              >
                <option value="7d">Last 7 Days (This Week)</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Vault Bookmarks</option>
              </select>
            </div>

            {/* Folder selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-900 mb-1">Filter Collection:</label>
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="w-full h-9 px-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-900 font-medium outline-none cursor-pointer focus:bg-white"
              >
                <option value="all">All Collections ({links.length} links)</option>
                {collections.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title} ({col.linkIds.length} links)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
            <span>
              Curating <strong>{candidateLinks.length}</strong> high-signal bookmarks.
            </span>
            <span className="text-[11px]">Ready for one-click copy or export.</span>
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-zinc-50">
          <textarea
            readOnly
            value={digestContent}
            rows={12}
            className="w-full h-full min-h-[220px] p-4 rounded-xl bg-white border border-zinc-200 font-mono text-xs sm:text-sm text-zinc-800 leading-relaxed resize-none focus:outline-none shadow-xs"
          />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-zinc-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold transition-all border border-zinc-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-600" />
              <span>Download .md</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-300" />}
              <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Digest'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
