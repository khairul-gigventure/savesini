import React, { useState } from 'react';
import { SocialLink, CoachingCollection } from '../types';
import { PLATFORM_CONFIGS } from '../utils/platformDetect';
import { Check, X, Search } from 'lucide-react';

interface AssignLinksModalProps {
  isOpen: boolean;
  collection: CoachingCollection | null;
  allLinks: SocialLink[];
  onClose: () => void;
  onSave: (collectionId: string, updatedLinkIds: string[]) => void;
}

export const AssignLinksModal: React.FC<AssignLinksModalProps> = ({
  isOpen,
  collection,
  allLinks,
  onClose,
  onSave,
}) => {
  if (!isOpen || !collection) return null;

  const [selectedIds, setSelectedIds] = useState<string[]>(collection.linkIds || []);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleLink = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filtered = allLinks.filter((l) =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleApply = () => {
    onSave(collection.id, selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Inter']">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
          <div>
            <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-zinc-900">
              Manage Collection Links
            </h3>
            <p className="text-xs text-zinc-500">
              Select bookmarks to organize under <strong className="text-zinc-900">{collection.title}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter bookmarks by title, author, or tag..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-zinc-50 text-xs text-zinc-900 outline-none border border-zinc-200 focus:bg-white focus:border-zinc-900"
          />
        </div>

        {/* Links Checklist */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {filtered.map((link) => {
            const isAssigned = selectedIds.includes(link.id);
            const config = PLATFORM_CONFIGS[link.platform];

            return (
              <div
                key={link.id}
                onClick={() => toggleLink(link.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isAssigned
                    ? 'bg-zinc-50 border-zinc-900 ring-1 ring-zinc-900'
                    : 'bg-white border-zinc-200 hover:bg-zinc-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${config.bgColor}`}
                  >
                    <span>{config.symbol}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 truncate">{link.title}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{link.author} · {link.tags.join(' ')}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                    isAssigned
                      ? 'bg-zinc-900 border-zinc-900 text-white'
                      : 'border-zinc-300 bg-white'
                  }`}
                >
                  {isAssigned && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
          <span className="text-xs text-zinc-500">
            {selectedIds.length} of {allLinks.length} bookmarks selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
