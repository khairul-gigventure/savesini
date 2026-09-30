import React from 'react';
import { Lock, ShieldCheck, WifiOff } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#fbfbfb] border-t border-zinc-200/80 py-6 mt-auto font-['Inter']">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="font-['Plus_Jakarta_Sans'] font-bold text-zinc-900">SaveSini</span>
          <span>·</span>
          <span>High-Signal Social Media Vault</span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline text-zinc-600 font-medium">Coach Khairul</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Offline Capable
          </span>
          <span className="inline-flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-zinc-600" />
            Local Browser Storage
          </span>
          <span className="hidden md:inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-600" />
            100% Private &amp; Zero Cloud Leaks
          </span>
        </div>
      </div>
    </footer>
  );
};

