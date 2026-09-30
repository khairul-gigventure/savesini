import React, { useRef, useState } from 'react';
import { SocialLink, CoachingCollection } from '../types';
import { exportToJSON, resetVault } from '../utils/storage';
import { Cloud, Download, Upload, RotateCcw, AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  links: SocialLink[];
  collections: CoachingCollection[];
  onDataRestored: (newLinks: SocialLink[], newCollections: CoachingCollection[]) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  links,
  collections,
  onDataRestored,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBackup = () => {
    exportToJSON(links, collections);
    setFeedback({ message: 'JSON backup file successfully exported!', type: 'success' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.links && Array.isArray(parsed.links)) {
          onDataRestored(parsed.links, parsed.collections || collections);
          setFeedback({
            message: `Successfully restored ${parsed.links.length} bookmarks and ${parsed.collections?.length || 0} collections!`,
            type: 'success',
          });
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setFeedback({ message: 'Invalid file format. Please choose a valid SaveSini JSON export.', type: 'error' });
        }
      } catch {
        setFeedback({ message: 'Failed to parse JSON file.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDemo = () => {
    const resetData = resetVault();
    onDataRestored(resetData.links, resetData.collections);
    setConfirmReset(false);
    setFeedback({ message: 'Database reset to initial sample data.', type: 'success' });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-['Inter']">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in duration-150 border border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-zinc-700" />
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-zinc-900">
                Backup &amp; Restore Vault
              </h3>
              <p className="text-[11px] text-zinc-500">Export or restore your bookmarks and collections</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Options */}
        <div className="space-y-3">
          {/* Download JSON */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Export JSON Backup</h4>
              <p className="text-[11px] text-zinc-500">
                Save all {links.length} bookmarks, notes, and {collections.length} collections.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {/* Restore JSON */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-zinc-900">Restore from File</h4>
              <p className="text-[11px] text-zinc-500">Upload an existing SaveSini .json file.</p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-600" />
              <span>Choose File</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-red-700 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Reset to Default Seed Data
                </h4>
                <p className="text-[11px] text-zinc-500">Restore the initial curated coaching links.</p>
              </div>
              {!confirmReset && (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {confirmReset && (
              <div className="pt-2 border-t border-red-200 flex items-center justify-between gap-2">
                <span className="text-[11px] text-red-700 font-medium">Are you sure you want to reset?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDemo}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-red-600 text-white font-semibold hover:bg-red-700"
                  >
                    Yes, Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-semibold hover:bg-zinc-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
