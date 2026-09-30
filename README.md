# ⚡ SaveSini — Social Intel Vault

> **Personal Social Media Knowledge Vault for High-Signal Thinkers & Coaches**  
> Instantly capture, synthesize, search, and curate high-signal links across **X (Twitter), LinkedIn, Threads, Facebook, and the Web** into a private, distraction-free local repository.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-18181b?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-18181b?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-zinc)](LICENSE)

---

## 📖 Overview

As a coach, consultant, founder, or researcher, you encounter invaluable frameworks, pricing models, and strategic insights across social media daily. However:
- Native bookmarking across 4+ different apps is fragmented and impossible to cross-reference.
- Original posts frequently get deleted, edited, or buried by unpredictable algorithms.
- You lose your executive takeaways and implementation notes because bookmarks only save the raw link.

**SaveSini** solves this through a **Local-First, Distraction-Free Minimalist Architecture**:
- 🔒 **100% Client-Side & Private:** All bookmarks, notes, and collections live securely in your browser's persistent storage. Zero external server dependencies or tracking.
- ☁️ **Seamless Firebase Cloud Sync:** Optional 1-click Google Sign-In with Firebase Firestore for cross-device synchronization and automatic cloud backups.
- ⚡ **Zero Latency:** Instant startup, sub-millisecond real-time search, and smooth keyboard navigation.
- 📶 **Offline Resilience:** Access, read, and manage your intellectual archive without an active internet connection.

---

## 🎨 Minimalist Design Philosophy

SaveSini rejects bloated "AI-slop" designs in favor of an architectural, editorial aesthetic:
- **Monochrome & Zinc Palette:** Clean off-white canvas (`#fafafa`), deep charcoal foregrounds (`#18181b`), and hairline borders (`border-zinc-200/80`).
- **Typographic Discipline:** Built with **Plus Jakarta Sans** for crisp headings and **Inter** for comfortable, long-form reading density.
- **Zero Distraction:** Uncluttered layouts, discreet status banners, and distraction-free reader modals.
- **Keyboard-First Workflow:** Press `⌘K` or `Ctrl+K` anytime to focus the universal search bar.

---

## ✨ Key Features

### 1. ⚡ Quick Capture & Intelligent Auto-Enrichment
- **Instant Platform Recognition:** Automatically detects incoming URLs from **X (Twitter)**, **Threads**, **LinkedIn**, **Facebook**, and **Custom Web Links**.
- **Auto-Enrich Engine:** Extracts creators, cleans URL tracking parameters, suggests curated tags (`#Coaching`, `#Frameworks`, `#Leadership`), and pre-fills executive notes.
- **Smart Duplicate Prevention:** Instantly alerts you if a link has already been saved to prevent vault clutter.
- **Pre-fill Demo Data:** One-click sample presets allow immediate testing across all supported platforms.

### 2. 🔍 Universal Real-Time Multi-Field Search & Filter
- Search in real-time across:
  - **Article / Post Title**
  - **Full Target URL**
  - **Author Name & Handle**
  - **Custom Tags & Pillars** (with or without `#`)
  - **Personal Coaching Takeaways**
- **Safe Keyword Highlighting:** Visual match highlights with regex-safe sanitization.
- **Multi-Dimensional Filters:** Filter by platform pills, date ranges (Last 24h, 7 days, 30 days), asset formats (Frameworks, Breakdowns, Templates), and note presence.
- **Smart Sorting:** Sort instantly by **Relevance**, **Newest Added**, **Oldest**, or **Alphabetical (A–Z)**.
- **Layout Switcher:** Toggle between an **Editorial Card Grid** and a **Compact Density List**.

### 3. 📁 Strategic Collections & Asset Structuring
- Organize bookmarks into thematic focus areas (e.g., *Sales & Client Acquisition*, *Focus & Peak Performance*, *Offer Design*).
- **Curated Link Assignment Modal:** Add or remove links to folders with instant count synchronization.
- **Collection Synthesis:** Attach strategic summaries and guidance notes to each folder.
- **1-Click Collection Sharing:** Generate and copy clean executive summaries formatted for quick team dispatch.

### 4. 📰 Executive Weekly Digest Generator
Compile curated bookmarks into presentation-ready dispatches in under a second:
- **WhatsApp / Telegram Broadcast:** Structured list with formatted headers, key takeaways, and clean emojis.
- **Newsletter / Post Thread:** Editorial prose ready for LinkedIn or email dispatches.
- **Obsidian / Notion Markdown:** Clean Markdown output complete with **YAML Frontmatter** metadata for seamless PKM ingestion.
- 1-click **Copy to Clipboard** and **Download .md File**.

### 5. 📖 Focus Reader Mode
- Click any bookmark card to open a full distraction-free reading overlay.
- Preserves the author's original snapshot quote so wisdom is never lost if the social post is removed.
- One-click copy for quotes or full Markdown citation format.

### 6. 🎙️ Voice-to-Text Note Capture
- Integrated with the **Web Speech API** for rapid capture of thoughts while reading articles.
- Record spontaneous insights directly into the notes field hands-free.

### 7. 🔖 1-Click Desktop Bookmarklet & Mobile PWA
- **Browser Bookmarklet:** Drag the SaveSini bookmarklet button to your browser bar (Chrome, Safari, Edge, Brave). Save any post tab in 1 second.
- **Progressive Web App (PWA):** Installable on iOS (Safari), Android (Chrome), macOS, and Windows.
- **Web Share Target:** Tap "Share" from social media apps on your mobile device and pick SaveSini to ingest links directly.

### 8. 💾 Portable Backups & CSV Export
- **CSV Spreadsheet Export:** Export your entire vault with IDs, platforms, titles, URLs, tags, and notes.
- **Full JSON Archive Backup:** Backup links and collections with one click, and restore them anytime on a new device.

---

## 🛠️ Tech Stack & Architecture

| Layer | Tooling |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) with Fast Refresh |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (Minimalist zinc theme tokens) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animations** | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| **PWA & Offline** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Service Worker cache + Web App Manifest) |
| **Storage Engine** | Browser `localStorage` with automated serialization and fallback seeding |

---

## 📁 Project Structure

```text
savesini/
├── public/
│   ├── icon.svg               # Vector app logo & PWA asset
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── AssignLinksModal.tsx    # Manage and assign bookmarks to collections
│   │   ├── BackupModal.tsx         # JSON backup export and restore manager
│   │   ├── BookmarkletModal.tsx    # Browser bookmarklet setup & drag button
│   │   ├── Footer.tsx              # Minimalist application footer
│   │   ├── Header.tsx              # Main navigation, PWA install prompt, & quick export
│   │   ├── QuickCaptureView.tsx    # Fast URL capture form with voice input & auto-enrich
│   │   ├── ReaderModal.tsx         # Distraction-free reading & quote snapshot viewer
│   │   ├── Toast.tsx               # Minimalist toast notifications
│   │   ├── UnifiedVaultView.tsx    # Real-time search suite, collections, card & list views
│   │   └── WeeklyDigestModal.tsx   # Multi-format digest synthesizer (WA, Newsletter, MD)
│   ├── hooks/
│   │   ├── usePWAInstall.ts        # PWA installation prompt & standalone detection
│   │   └── useVoiceInput.ts        # Web Speech API voice capture hook
│   ├── utils/
│   │   ├── initialData.ts          # Seed data and curated references
│   │   ├── linkEnricher.ts         # Heuristic URL metadata enrichment & digest generator
│   │   ├── platformDetect.ts       # Social platform identifier & handle extractor
│   │   └── storage.ts              # LocalStorage sync, CSV exporter, and JSON backup logic
│   ├── App.tsx                     # Root state container & route controller
│   ├── index.css                   # Tailwind v4 configuration & theme tokens
│   ├── main.tsx                    # React DOM entry point
│   └── types.ts                    # Core TypeScript domain models
├── index.html                      # HTML entry with SEO & OpenGraph meta tags
├── package.json                    # Project dependencies and npm scripts
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build and PWA service worker config
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0 or higher
- `npm` (or `pnpm` / `bun`)

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/your-username/savesini.git
cd savesini
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your web browser.

### 3. Verify Code Quality & Type Safety
```bash
npm run lint
```

### 4. Build for Production
```bash
npm run build
```
Production assets will be generated in the `dist/` directory, ready to be deployed to Cloud Run, Vercel, Netlify, or any static hosting service.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘ + K` or `Ctrl + K` | Focus and select universal search bar |
| `Escape` | Dismiss active search query / close open modals |

---

## 📄 License & Attribution

Crafted for executive clarity and personal intellectual compounding.  
Published under the **MIT License**. Copyright © 2026 SaveSini.
