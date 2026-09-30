import React, { useState } from 'react';
import { ViewTab } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Cloud, DownloadCloud, Sparkles, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onExportCSV: () => void;
  onOpenBackupModal: () => void;
  onOpenWeeklyDigest?: () => void;
  onOpenBookmarklet?: () => void;
  currentUser?: User | null;
  isSyncing?: boolean;
  onSignInWithGoogle?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onExportCSV,
  onOpenBackupModal,
  onOpenWeeklyDigest,
  currentUser,
  isSyncing,
  onSignInWithGoogle,
  onSignOut,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  const navItems: { id: ViewTab; label: string }[] = [
    { id: 'quick-capture', label: 'Quick Capture' },
    { id: 'bookmarks', label: 'Vault' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 font-['Inter']">
        <div className="h-15 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
            <button
              onClick={() => onTabChange('quick-capture')}
              className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
            >
              <img
                src="https://lh3.googleusercontent.com/aida/AEtjO1UeH9IZix3PAV1iFfYF3f1H7g2daGTPgMif9HTtQNw2l_yFiNs2LJjnI2bha5kxW97XpiBjrUyguAwR73Gw3W2Hn_x3RPNXJPh2QuRBZ0A7O7Ou871XDXjA8iWU3dIv_7e40VwfpGbfJM9zPl9Lw2I0Pwssjb8o86aqwpvbvTUqA9G9EbvJ1Jrle5GRi2l8wyPzndBnaGPUbp8p9cT5Vs0sYDgyGqKVy0Ux3xmcLtCdzf6bKVtD9_2wjlE"
                alt="SaveSini Logo"
                className="h-7 w-7 rounded-md object-contain group-hover:opacity-90 transition-opacity"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-['Plus_Jakarta_Sans'] text-base font-bold tracking-tight text-zinc-900 leading-tight">
                    SaveSini
                  </span>
                  {currentUser ? (
                    <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Cloud Synced
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                      Local Mode
                    </span>
                  )}
                </div>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* PWA Install Button */}
            {!isInstalled && isInstallable && (
              <button
                onClick={install}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold border border-zinc-200 transition-all cursor-pointer"
                title="Install SaveSini to your device"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {!isInstalled && isIOS && (
              <button
                onClick={() => setShowIOSGuide(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium border border-zinc-200 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">iOS App</span>
              </button>
            )}

            {/* Weekly Digest Trigger */}
            {onOpenWeeklyDigest && (
              <button
                onClick={onOpenWeeklyDigest}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
                title="Generate executive weekly digest"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                <span>Weekly Digest</span>
              </button>
            )}

            {/* Export CSV Button */}
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-all cursor-pointer"
              title="Download bookmarks CSV export"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Backup / Restore Button */}
            <button
              onClick={onOpenBackupModal}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-all cursor-pointer"
              title="Backup & restore JSON database"
            >
              <Cloud className="w-3.5 h-3.5 text-zinc-500" />
              <span>Backup</span>
            </button>

            {/* Firebase Auth Controls */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-200 ml-1">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-zinc-900 leading-tight truncate max-w-[120px]">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium leading-none flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {isSyncing ? 'Syncing...' : 'Connected'}
                  </span>
                </div>
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="User Avatar"
                    className="w-7 h-7 rounded-full object-cover border border-zinc-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                    {(currentUser.displayName || currentUser.email || 'K').charAt(0).toUpperCase()}
                  </div>
                )}
                {onSignOut && (
                  <button
                    onClick={onSignOut}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 pl-1 border-l border-zinc-200 ml-1">
                {onSignInWithGoogle && (
                  <button
                    onClick={onSignInWithGoogle}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold border border-zinc-300 shadow-2xs transition-all cursor-pointer"
                    title="Sign in with Google to sync bookmarks across all your devices"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-zinc-200 bg-white gap-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex-1 text-center py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* iOS Installation Instructions Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl space-y-4 border border-zinc-200">
            <div className="flex items-center gap-2 text-zinc-900">
              <Sparkles className="w-4 h-4 text-zinc-600" />
              <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold">
                Install SaveSini on iPhone
              </h3>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              1. Tap the <strong className="text-zinc-900">Share</strong> button in Safari's bottom toolbar.<br />
              2. Scroll down and choose <strong className="text-zinc-900">Add to Home Screen</strong>.<br />
              3. Launch SaveSini anytime directly with offline capabilities!
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-lg bg-zinc-900 text-white font-semibold text-xs hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
