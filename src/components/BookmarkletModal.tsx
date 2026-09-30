import React, { useState } from 'react';
import { getBookmarkletCode } from '../utils/linkEnricher';
import { X as CloseIcon, Bookmark, Copy, Check, ArrowRight, MousePointerClick } from 'lucide-react';

interface BookmarkletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookmarkletModal: React.FC<BookmarkletModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const bookmarkletCode = getBookmarkletCode();

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bookmarkletCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 font-['Inter']">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-3 bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-zinc-900 leading-tight">
                Browser 1-Click Bookmarklet
              </h3>
              <p className="text-xs text-zinc-500">Capture links from any browser tab into your vault in 1 second.</p>
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

        <div className="p-6 space-y-5">
          {/* Visual Step 1 */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-center space-y-3">
            <span className="text-xs font-semibold text-zinc-700 block">
              Drag the button below directly to your browser's Bookmarks Bar:
            </span>

            {/* Draggable Anchor */}
            <div className="py-2">
              <a
                href={bookmarkletCode}
                onClick={(e) => e.preventDefault()}
                title="Drag to your browser bookmarks bar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-semibold text-xs shadow-sm hover:bg-zinc-800 active:scale-95 transition-transform cursor-grab active:cursor-grabbing border border-zinc-700"
              >
                <MousePointerClick className="w-4 h-4 text-zinc-300" />
                <span>+ Save to SaveSini</span>
              </a>
            </div>

            <p className="text-[11px] text-zinc-500">
              (Or right-click &gt; "Bookmark this link" if dragging is disabled in your browser)
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-2 text-xs text-zinc-600">
            <h4 className="font-bold text-zinc-900">How It Works:</h4>
            <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
              <li>When browsing a valuable post on X, LinkedIn, or Threads...</li>
              <li>Click the <strong className="text-zinc-900">+ Save to SaveSini</strong> button in your bookmarks bar.</li>
              <li>SaveSini will instantly open with the URL, title, and platform pre-filled for you!</li>
            </ol>
          </div>

          {/* Fallback copy */}
          <div className="pt-2 border-t border-zinc-200">
            <span className="text-[11px] font-semibold text-zinc-900 block mb-1.5">
              Manual code option (Copy JavaScript URI):
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={bookmarkletCode}
                className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-100 text-[11px] font-mono text-zinc-700 outline-none border border-zinc-200"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-900 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-zinc-50/50 border-t border-zinc-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
