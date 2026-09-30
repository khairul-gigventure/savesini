import React from 'react';
import { SocialLink } from '../types';
import { PLATFORM_CONFIGS } from '../utils/platformDetect';
import { ExternalLink, Copy, Check, X as CloseIcon, Edit3, Bookmark, Share2 } from 'lucide-react';

interface ReaderModalProps {
  isOpen: boolean;
  link: SocialLink | null;
  onClose: () => void;
  onCopyLink: (url: string) => void;
  onDeleteLink?: (id: string) => void;
}

export const ReaderModal: React.FC<ReaderModalProps> = ({
  isOpen,
  link,
  onClose,
  onCopyLink,
}) => {
  const [copiedQuote, setCopiedQuote] = React.useState(false);
  const [copiedMd, setCopiedMd] = React.useState(false);

  if (!isOpen || !link) return null;

  const config = PLATFORM_CONFIGS[link.platform];

  const handleCopyQuote = () => {
    const textToCopy = link.originalText || link.title;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`"${textToCopy}" — ${link.authorHandle || link.author}`);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    }
  };

  const handleCopyMarkdown = () => {
    const md =
      `## [${link.title}](${link.url})\n` +
      `- **Author:** ${link.authorHandle || link.author} (${link.platform})\n` +
      `- **Tags:** ${link.tags.join(', ')}\n\n` +
      (link.originalText ? `> "${link.originalText}"\n\n` : '') +
      `### Coach's Synthesis\n${link.notes}\n`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(md);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 font-['Inter']">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Editorial Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-3 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
            <span className="text-xs font-semibold text-zinc-900 tracking-tight">
              Focus Reader
            </span>
            <span className="text-xs text-zinc-500">· {config.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-200/60 transition-colors flex items-center gap-1 cursor-pointer"
              title="Copy as Markdown"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedMd ? 'Copied' : 'Markdown'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Editorial Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Metadata Byline */}
          <div className="flex items-center justify-between gap-3 text-xs text-zinc-500 border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-900">{link.author}</span>
              <span>·</span>
              <span className="font-mono text-zinc-600">{link.authorHandle || `@${link.platform}`}</span>
            </div>
            <span className="text-[11px]">{link.displayTimeAgo || 'Saved'}</span>
          </div>

          {/* Title */}
          <h2 className="font-['Plus_Jakarta_Sans'] text-xl sm:text-2xl font-bold text-zinc-900 leading-snug tracking-tight">
            {link.title}
          </h2>

          {/* Snapshot Quote (Editorial Styling) */}
          {link.originalText && (
            <div className="relative pl-5 py-3 border-l-2 border-zinc-900 bg-zinc-50 rounded-r-xl pr-4">
              <p className="font-serif italic text-sm sm:text-base text-zinc-800 leading-relaxed">
                "{link.originalText.replace(/^"|"$/g, '')}"
              </p>
              <button
                type="button"
                onClick={handleCopyQuote}
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-zinc-900 hover:underline font-semibold cursor-pointer"
              >
                {copiedQuote ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedQuote ? 'Quote Copied!' : 'Copy Quote'}</span>
              </button>
            </div>
          )}

          {/* Coach's Synthesis / Takeaway */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 uppercase tracking-wider">
              <Edit3 className="w-3.5 h-3.5" />
              <span>Coach's Synthesis &amp; Takeaway</span>
            </div>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200/80">
              <p className="text-sm text-zinc-900 leading-relaxed whitespace-pre-line">
                {link.notes || 'No synthesis recorded for this item.'}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            <span className="text-xs text-zinc-500 font-semibold mr-1">Tags:</span>
            {link.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Canonical URL */}
          <div className="pt-2 text-xs">
            <span className="text-zinc-500 block mb-1 font-semibold">Reference Link:</span>
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-100 font-mono text-zinc-800 break-all text-[11px]">
              <span className="truncate flex-1">{link.url}</span>
              <button
                type="button"
                onClick={() => onCopyLink(link.url)}
                className="shrink-0 text-zinc-500 hover:text-zinc-900 p-1 cursor-pointer"
                title="Copy URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-zinc-50/50 border-t border-zinc-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onCopyLink(link.url)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </button>

          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <span>Open Original Post</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
