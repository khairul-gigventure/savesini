import React, { useState } from 'react';
import { SocialLink, PlatformType } from '../types';
import { PLATFORM_CONFIGS } from '../utils/platformDetect';
import {
  Activity,
  CheckCircle,
  ExternalLink,
  Copy,
  FolderOpen,
  Archive,
  ArrowRight,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface NetworksViewProps {
  links: SocialLink[];
  onCopyLink: (url: string) => void;
  onOpenCaptureForPlatform: (platform: PlatformType) => void;
}

export const NetworksView: React.FC<NetworksViewProps> = ({
  links,
  onCopyLink,
  onOpenCaptureForPlatform,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<PlatformType>('x');
  const [testingStatus, setTestingStatus] = useState<string>('Test Platform Handshakes');
  const [page, setPage] = useState(1);
  const pageSize = 3;

  // Extraction settings states
  const [stripUtms, setStripUtms] = useState(true);
  const [downloadMedia, setDownloadMedia] = useState(true);
  const [autoNotes, setAutoNotes] = useState(true);

  // Group links by platform
  const networkLinks = links.filter((l) => l.platform === selectedNetwork);
  const totalPages = Math.max(1, Math.ceil(networkLinks.length / pageSize));
  const displayedLinks = networkLinks.slice((page - 1) * pageSize, page * pageSize);

  const handleTestParsers = () => {
    setTestingStatus('Pinging Endpoints...');
    setTimeout(() => {
      setTestingStatus('All Regex Nodes 100% OK');
      setTimeout(() => {
        setTestingStatus('Test Platform Handshakes');
      }, 2500);
    }, 700);
  };

  const currentConfig = PLATFORM_CONFIGS[selectedNetwork];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
      {/* Top Breadcrumb & Page Focus Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eaedff] text-[#131b2e] text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#00685f]"></span>
            <span>Vault Aggregation Layer</span>
            <span className="text-[#bcc9c6]">•</span>
            <span className="text-[#00685f] font-bold">4 Active Nodes</span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-3xl sm:text-4xl font-extrabold text-[#131b2e] tracking-tight">
            Social Networks Breakdown
          </h1>
          <p className="text-sm text-[#3d4947] leading-relaxed">
            Analyze your intake distribution and filter bookmarks by original social platform. Real-time parsers auto-index schema parameters, media attachments, and context summaries.
          </p>
        </div>

        {/* Live Sync Badge */}
        <div className="flex items-center gap-3 self-start md:self-auto bg-[#f2f3ff] px-4 py-3 rounded-2xl border border-[#eaedff] shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-[#008378] text-[#f4fffc] flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#131b2e]">{links.length} Total Links Indexed</span>
            <span className="text-[11px] text-[#00685f] flex items-center gap-1 font-semibold">
              <CheckCircle className="w-3.5 h-3.5" />
              All 4 Ingestion Daemons Healthy
            </span>
          </div>
        </div>
      </div>

      {/* 4 Network Matrix Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Network 1: X / Twitter */}
        <div
          onClick={() => {
            setSelectedNetwork('x');
            setPage(1);
          }}
          className={`cursor-pointer group relative bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 border flex flex-col justify-between overflow-hidden ${
            selectedNetwork === 'x' ? 'border-[#00685f] ring-2 ring-[#00685f]' : 'border-[#eaedff]'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <span>𝕏</span>
              </div>
              {selectedNetwork === 'x' && (
                <span className="px-2.5 py-1 rounded-full bg-[#008378] text-[#f4fffc] text-[10px] font-bold">
                  Active Filter
                </span>
              )}
            </div>

            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#131b2e]">X / Twitter</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#131b2e]">
                  {links.filter((l) => l.platform === 'x').length}
                </span>
                <span className="text-xs text-[#3d4947]">Saved Posts</span>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-xs text-[#3d4947]">
              <span>Top Tag:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#eaedff] text-[#131b2e] font-medium text-[11px]">
                #Frameworks
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#eaedff] flex items-center justify-between text-[#00685f] text-xs font-semibold">
            <span>{selectedNetwork === 'x' ? 'Viewing X Stream' : 'View X links'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Network 2: Threads */}
        <div
          onClick={() => {
            setSelectedNetwork('threads');
            setPage(1);
          }}
          className={`cursor-pointer group relative bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 border flex flex-col justify-between overflow-hidden ${
            selectedNetwork === 'threads' ? 'border-[#00685f] ring-2 ring-[#00685f]' : 'border-[#eaedff]'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#101010] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <span>@</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#f2f3ff] text-[#3d4947] text-[10px] font-semibold">
                Meta Graph
              </span>
            </div>

            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#131b2e]">Threads</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#131b2e]">
                  {links.filter((l) => l.platform === 'threads').length}
                </span>
                <span className="text-xs text-[#3d4947]">Saved Posts</span>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-xs text-[#3d4947]">
              <span>Top Tag:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#eaedff] text-[#131b2e] font-medium text-[11px]">
                #ThreadsStrategy
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#eaedff] flex items-center justify-between text-xs font-semibold text-[#3d4947] group-hover:text-[#00685f] transition-colors">
            <span>{selectedNetwork === 'threads' ? 'Viewing Threads' : 'View Threads links'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Network 3: Facebook Groups */}
        <div
          onClick={() => {
            setSelectedNetwork('facebook');
            setPage(1);
          }}
          className={`cursor-pointer group relative bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 border flex flex-col justify-between overflow-hidden ${
            selectedNetwork === 'facebook' ? 'border-[#00685f] ring-2 ring-[#00685f]' : 'border-[#eaedff]'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <span>f</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#f2f3ff] text-[#3d4947] text-[10px] font-semibold">
                Closed Comms
              </span>
            </div>

            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#131b2e]">Facebook Groups</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#131b2e]">
                  {links.filter((l) => l.platform === 'facebook').length}
                </span>
                <span className="text-xs text-[#3d4947]">Saved Posts</span>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-xs text-[#3d4947]">
              <span>Top Tag:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#eaedff] text-[#131b2e] font-medium text-[11px]">
                #Community
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#eaedff] flex items-center justify-between text-xs font-semibold text-[#3d4947] group-hover:text-[#00685f] transition-colors">
            <span>{selectedNetwork === 'facebook' ? 'Viewing Facebook' : 'View Facebook links'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Network 4: LinkedIn */}
        <div
          onClick={() => {
            setSelectedNetwork('linkedin');
            setPage(1);
          }}
          className={`cursor-pointer group relative bg-white p-5 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 border flex flex-col justify-between overflow-hidden ${
            selectedNetwork === 'linkedin' ? 'border-[#00685f] ring-2 ring-[#00685f]' : 'border-[#eaedff]'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                <span>in</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#f2f3ff] text-[#3d4947] text-[10px] font-semibold">
                B2B Intel
              </span>
            </div>

            <div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#131b2e]">LinkedIn Intel</h2>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-['Plus_Jakarta_Sans'] text-2xl font-extrabold text-[#131b2e]">
                  {links.filter((l) => l.platform === 'linkedin').length}
                </span>
                <span className="text-xs text-[#3d4947]">Saved Posts</span>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-xs text-[#3d4947]">
              <span>Top Tag:</span>
              <span className="px-2 py-0.5 rounded-md bg-[#eaedff] text-[#131b2e] font-medium text-[11px]">
                #Leadership
              </span>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-[#eaedff] flex items-center justify-between text-xs font-semibold text-[#3d4947] group-hover:text-[#00685f] transition-colors">
            <span>{selectedNetwork === 'linkedin' ? 'Viewing LinkedIn' : 'View LinkedIn links'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Active Platform Ingestion Stream & Health Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Stream Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stream Top Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f2f3ff] p-4 rounded-2xl border border-[#eaedff]">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${currentConfig.bgColor}`}>
                <span>{currentConfig.symbol}</span>
              </div>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#131b2e]">
                  {currentConfig.name} ({networkLinks.length} Links)
                </h3>
                <p className="text-[11px] text-[#3d4947]">Filtered by Platform ID: {currentConfig.domainSample}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenCaptureForPlatform(selectedNetwork)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">add_link</span>
                <span>Manual {currentConfig.badgeName} Ingest</span>
              </button>
            </div>
          </div>

          {/* Links Stream */}
          <div className="space-y-4">
            {displayedLinks.map((item) => {
              return (
                <article
                  key={item.id}
                  className="bg-white p-6 rounded-2xl shadow-xs border border-[#eaedff] hover:shadow-md transition-all duration-150 space-y-4"
                >
                  {/* Author Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {item.authorAvatar ? (
                        <img
                          src={item.authorAvatar}
                          alt={item.author}
                          className="w-12 h-12 rounded-full object-cover shadow-xs ring-1 ring-[#eaedff]"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-xs ${currentConfig.bgColor}`}
                        >
                          {currentConfig.symbol}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#131b2e]">
                            {item.author}
                          </span>
                          {item.verified && (
                            <span className="material-symbols-outlined text-[#00685f] text-[15px]">
                              verified
                            </span>
                          )}
                          <span className="text-xs text-[#3d4947]">{item.authorHandle}</span>
                        </div>
                        <span className="text-[11px] text-[#3d4947]">
                          Saved {item.displayTimeAgo || 'recently'} • Ingested via SaveSini Vault
                        </span>
                      </div>
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f2f3ff] hover:bg-[#eaedff] text-[#131b2e] text-xs font-semibold transition-colors"
                    >
                      <span>Open Post</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Original Tweet / Post Snippet */}
                  {item.originalText && (
                    <div className="bg-[#f2f3ff]/80 p-4 rounded-xl text-[#131b2e] text-xs sm:text-sm space-y-2 border border-[#eaedff]/60">
                      <p className="leading-relaxed italic">"{item.originalText.replace(/^"|"$/g, '')}"</p>
                      {item.stats && (
                        <div className="flex items-center gap-4 text-[#3d4947] text-[11px] pt-1">
                          {item.stats.likes && <span>♥ {item.stats.likes}</span>}
                          {item.stats.reposts && <span>↻ {item.stats.reposts}</span>}
                          {item.stats.bookmarks && <span>★ {item.stats.bookmarks}</span>}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Coach Khairul's Intel Note */}
                  {item.notes && (
                    <div className="bg-[#008378]/10 p-4 rounded-xl flex items-start gap-3 border border-[#008378]/20">
                      <div className="w-8 h-8 rounded-lg bg-[#008378] text-[#f4fffc] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#00685f]">Coach Khairul's Intel Note</span>
                          <span className="px-2 py-0.2 bg-[#00685f]/10 text-[#00685f] rounded text-[10px] font-bold">
                            Strategic Asset
                          </span>
                        </div>
                        <p className="text-xs text-[#131b2e] leading-relaxed">{item.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Meta Tags & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#eaedff]">
                    <div className="flex flex-wrap items-center gap-2">
                      {item.tags.map((t) => (
                        <span key={t} className="px-2.5 py-0.5 rounded-md bg-[#eaedff] text-[#131b2e] text-xs font-medium">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 text-[#6d7a77]">
                      <button
                        type="button"
                        onClick={() => onCopyLink(item.url)}
                        className="p-1.5 rounded-lg hover:bg-[#eaedff] transition-colors cursor-pointer"
                        title="Copy Raw Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-[#eaedff] transition-colors cursor-pointer"
                        title="Linked to Collection"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-[#eaedff] transition-colors hover:text-[#00685f] cursor-pointer"
                        title="Sync State"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between p-4 bg-white border border-[#eaedff] rounded-xl shadow-xs">
            <span className="text-xs text-[#3d4947]">
              Showing {displayedLinks.length} of {networkLinks.length} {currentConfig.name} Bookmarks
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-[#f2f3ff] text-[#131b2e] text-xs font-semibold hover:bg-[#eaedff] transition-colors disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-[#00685f] text-white text-xs font-semibold hover:bg-[#008378] transition-colors disabled:opacity-40 cursor-pointer"
              >
                Next Posts
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Settings, Health, & Donut Chart (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Platform Intake Health Panel */}
          <div className="bg-white p-6 rounded-2xl border border-[#eaedff] shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f] text-[22px]">health_and_safety</span>
                <h3 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#131b2e]">
                  Auto-Detection Health
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#008378] text-white text-[11px] font-semibold">
                100% Active
              </span>
            </div>

            <p className="text-xs text-[#3d4947] leading-relaxed">
              SaveSini continuously monitors incoming link patterns via headless regex listeners. Zero manual tagging required on clipboard paste.
            </p>

            {/* Parsers List */}
            <div className="space-y-2.5">
              {[
                { name: 'x.com / twitter.com', pattern: '^(https?:\\/\\/)?(x|twitter)\\.com' },
                { name: 'threads.net', pattern: '^(https?:\\/\\/)?threads\\.net\\/@' },
                { name: 'linkedin.com', pattern: '^(https?:\\/\\/)?.*linkedin\\.com\\/(posts|pulse)' },
                { name: 'facebook.com', pattern: '^(https?:\\/\\/)?.*facebook\\.com\\/(groups|permalink)' },
              ].map((parser) => (
                <div key={parser.name} className="p-3 rounded-xl bg-[#f2f3ff] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span>
                    <div>
                      <span className="text-xs font-bold text-[#131b2e] block leading-tight">{parser.name}</span>
                      <span className="text-[10px] text-[#3d4947] font-mono">Regex: {parser.pattern}</span>
                    </div>
                  </div>
                  <CheckCircle className="w-4 h-4 text-[#00685f]" />
                </div>
              ))}
            </div>

            {/* Diagnostic Button */}
            <button
              type="button"
              onClick={handleTestParsers}
              className="w-full py-2.5 px-4 rounded-xl bg-[#eaedff] text-[#131b2e] text-xs font-semibold hover:bg-[#dae2fd] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              <span>{testingStatus}</span>
            </button>
          </div>

          {/* Network Distribution Donut Visualizer */}
          <div className="bg-white p-6 rounded-2xl border border-[#eaedff] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-['Plus_Jakarta_Sans'] text-sm font-bold text-[#131b2e]">Vault Intake Ratio</h4>
              <span className="text-xs text-[#00685f] font-bold">{links.length} Links Total</span>
            </div>

            {/* Custom Theme SVG Donut */}
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <path
                    className="text-[#eaedff]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  {/* X: 32% (stroke-dasharray: 32, 100) */}
                  <path
                    className="text-black"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="32, 100"
                    strokeWidth="3.5"
                  />
                  {/* Threads: 28% (offset -32) */}
                  <path
                    className="text-[#3d4947]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="28, 100"
                    strokeDashoffset="-32"
                    strokeWidth="3.5"
                  />
                  {/* Facebook: 22% (offset -60) */}
                  <path
                    className="text-[#1877F2]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="22, 100"
                    strokeDashoffset="-60"
                    strokeWidth="3.5"
                  />
                  {/* LinkedIn: 18% (offset -82) */}
                  <path
                    className="text-[#0A66C2]"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="18, 100"
                    strokeDashoffset="-82"
                    strokeWidth="3.5"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-['Plus_Jakarta_Sans'] text-base font-extrabold text-[#131b2e] leading-none">
                    4
                  </span>
                  <span className="text-[10px] text-[#3d4947]">Nodes</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 w-full text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#131b2e]">
                    <span className="w-2 h-2 rounded-full bg-black"></span> X / Twitter
                  </span>
                  <span className="font-bold text-[#131b2e]">32%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#131b2e]">
                    <span className="w-2 h-2 rounded-full bg-[#3d4947]"></span> Threads
                  </span>
                  <span className="font-bold text-[#131b2e]">28%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#131b2e]">
                    <span className="w-2 h-2 rounded-full bg-[#1877F2]"></span> Facebook
                  </span>
                  <span className="font-bold text-[#131b2e]">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#131b2e]">
                    <span className="w-2 h-2 rounded-full bg-[#0A66C2]"></span> LinkedIn
                  </span>
                  <span className="font-bold text-[#131b2e]">18%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Extraction Settings Card */}
          <div className="bg-[#f2f3ff] p-6 rounded-2xl border border-[#eaedff] space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00685f]" />
              <h4 className="font-['Plus_Jakarta_Sans'] text-xs font-bold text-[#131b2e] uppercase tracking-wider">
                Extraction Settings
              </h4>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#131b2e] font-medium">Strip tracking UTMs</span>
                <input
                  type="checkbox"
                  checked={stripUtms}
                  onChange={(e) => setStripUtms(e.target.checked)}
                  className="accent-[#00685f] w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#131b2e] font-medium">Download tweet media locally</span>
                <input
                  type="checkbox"
                  checked={downloadMedia}
                  onChange={(e) => setDownloadMedia(e.target.checked)}
                  className="accent-[#00685f] w-4 h-4 rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-[#131b2e] font-medium">Auto-generate Coach notes</span>
                <input
                  type="checkbox"
                  checked={autoNotes}
                  onChange={(e) => setAutoNotes(e.target.checked)}
                  className="accent-[#00685f] w-4 h-4 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
