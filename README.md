# ⚡ SaveSini — Social Intel Vault

> **Multi-User Social Media Knowledge Vault for High-Signal Thinkers & Coaches**  
> Capture, synthesize, search, and curate high-signal links across **X (Twitter), LinkedIn, Threads, Facebook, and the Web** into a private, cloud-synced, distraction-free repository powered by **Google Firebase**.

[![Live App](https://img.shields.io/badge/Live_App-savesini.ai.studio-09090b?style=for-the-badge&logo=googlechrome&logoColor=white)](https://savesini.ai.studio)

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-18181b?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-18181b?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-zinc)](LICENSE)

---

> 🚀 **Live Production App:** [**https://savesini.ai.studio**](https://savesini.ai.studio)  
> Test the app directly in your browser with 1-click Google Sign-In, real-time Firebase sync, and offline PWA support.

---

## 📖 Overview

As a coach, consultant, founder, or researcher, you encounter invaluable frameworks, pricing models, and strategic insights across social media daily. However:
- Native bookmarking across 4+ different apps is fragmented and impossible to cross-reference.
- Original posts frequently get deleted, edited, or buried by unpredictable algorithms.
- You lose your executive takeaways and implementation notes because bookmarks only save the raw link.
- Teams and multiple users need their own private accounts with cloud access across devices.

**SaveSini** solves this with a **Multi-User, Cloud-Powered, Distraction-Free Architecture**:
- 👥 **Multi-User Isolation:** Every user gets their own dedicated vault. Data is private and segregated per user in Cloud Firestore.
- 🔐 **Authentication Gateway:** Sleek initial Sign In / Sign Up portal featuring 1-click **Google Sign-In** and **Email/Password** support.
- ☁️ **Full Firebase Firestore Persistence:** Every link, collection, note, and tag is stored directly in Google Cloud Firestore.
- 🌱 **Automatic Vault Seeding:** New accounts automatically receive initial high-signal coaching links and frameworks upon registration.
- 🔄 **Real-Time Cross-Device Sync:** Changes on mobile reflect instantly on desktop via Firestore real-time listeners.
- 📶 **Offline-First Resilience:** Integrated with browser caching and PWA service workers for uninterrupted access anywhere.

---

## 🎨 Minimalist Design Philosophy

SaveSini rejects bloated "AI-slop" designs in favor of an architectural, editorial aesthetic:
- **Monochrome & Zinc Palette:** Clean off-white canvas (`#fafafa`), deep charcoal foregrounds (`#18181b`), and hairline borders (`border-zinc-200/80`).
- **Typographic Discipline:** Built with **Plus Jakarta Sans** for crisp headings and **Inter** for comfortable, long-form reading density.
- **Zero Distraction:** Uncluttered layouts, discreet status banners, and distraction-free reader modals.
- **Keyboard-First Workflow:** Press `⌘K` or `Ctrl+K` anytime to focus the universal search bar.

---

## ✨ Key Features

### 1. 🔐 Multi-User Authentication & Gateway
- **Initial Auth Portal:** Unauthenticated visitors are greeted with a clean, distraction-free **Sign In / Create Account** gateway.
- **1-Click Google Sign-In:** Instant authentication using Google OAuth with zero password fatigue.
- **Email & Password Authentication:** Dedicated registration and login tabs with client validation and error handling.
- **User Isolation:** All data is strictly partitioned by user UID (`/users/{userId}/**`) in Firestore.
- **Switch Accounts:** Log out anytime from the header to allow another user to access their separate vault.

### 2. ☁️ Google Cloud Firestore Database & Auto-Seeding
- **Cloud-Native Storage:** All links and collections are permanently stored in Firebase Firestore Enterprise Edition.
- **Auto-Seed on First Login:** When a new user creates an account, SaveSini automatically provisions their empty vault with initial curated frameworks and collections.
- **Real-Time Synchronisation:** Integrated `onSnapshot` listeners push link additions, edits, and deletions across all connected tabs and devices instantly.
- **Live Sync Indicator:** Header displays live connection status ("Cloud Synced" with animated green indicator).

### 3. 🛡️ Hardened Zero-Trust Security Rules (`firestore.rules`)
- **Strict ABAC (Attribute-Based Access Control):** Users can only read, write, or list documents where `request.auth.uid == userId`.
- **Payload Validation Blueprint:** Enforces string boundaries (`url <= 1024`, `title <= 300`, `notes <= 3000`), valid platform enums (`x`, `threads`, `linkedin`, `facebook`, `web`), and array limits.
- **Document ID Protection:** Strict regex constraints (`^[a-zA-Z0-9_\-]+$`) prevent path injection and ID poisoning attacks.
- **Default Deny:** Catch-all rule closes any unmapped Firestore paths.

### 4. ⚡ Quick Capture & Intelligent Auto-Enrichment
- **Instant Platform Recognition:** Automatically detects URLs from **X (Twitter)**, **Threads**, **LinkedIn**, **Facebook**, and **Custom Web Links**.
- **Auto-Enrich Engine:** Extracts creators, cleans tracking parameters, suggests curated tags (`#Coaching`, `#Frameworks`, `#Leadership`), and pre-fills notes.
- **Smart Duplicate Prevention:** Instantly alerts you if a link has already been saved to prevent vault clutter.
- **Pre-fill Demo Data:** One-click presets allow immediate testing across all supported platforms.

### 5. 🔍 Universal Real-Time Multi-Field Search & Filter
- Search in real-time across **Title**, **URL**, **Author Name & Handle**, **Tags**, and **Personal Notes**.
- **Safe Keyword Highlighting:** Visual match highlights with regex-safe sanitization.
- **Multi-Dimensional Filters:** Filter by platform pills, date ranges, asset formats, and note presence.
- **Smart Sorting:** Sort by **Relevance**, **Newest Added**, **Oldest**, or **Alphabetical (A–Z)**.
- **Layout Switcher:** Toggle between an **Editorial Card Grid** and a **Compact Density List**.

### 6. 📁 Strategic Collections & Asset Structuring
- Organize bookmarks into thematic focus areas (e.g., *Sales & Client Acquisition*, *Focus & Peak Performance*, *Offer Design*).
- **Curated Link Assignment Modal:** Add or remove links to folders with instant count synchronization.
- **Collection Synthesis:** Attach strategic summaries and guidance notes to each folder.
- **1-Click Collection Sharing:** Generate and copy clean executive summaries formatted for quick team dispatch.

### 7. 📰 Executive Weekly Digest Generator
Compile curated bookmarks into presentation-ready dispatches in under a second:
- **WhatsApp / Telegram Broadcast:** Structured list with formatted headers, key takeaways, and clean emojis.
- **Newsletter / Post Thread:** Editorial prose ready for LinkedIn or email dispatches.
- **Obsidian / Notion Markdown:** Clean Markdown output complete with **YAML Frontmatter** metadata for seamless PKM ingestion.
- 1-click **Copy to Clipboard** and **Download .md File**.

### 8. 📖 Focus Reader Mode
- Click any bookmark card to open a full distraction-free reading overlay.
- Preserves the author's original snapshot quote so wisdom is never lost if the social post is removed.
- One-click copy for quotes or full Markdown citation format.

### 9. 🎙️ Voice-to-Text Note Capture
- Integrated with the **Web Speech API** for rapid capture of thoughts while reviewing articles.
- Record spontaneous insights directly into the notes field hands-free.

### 10. 🔖 1-Click Desktop Bookmarklet & Mobile PWA
- **Browser Bookmarklet:** Drag the SaveSini bookmarklet button to your browser bar (Chrome, Safari, Edge, Brave). Save any post tab in 1 second.
- **Progressive Web App (PWA):** Installable on iOS (Safari), Android (Chrome), macOS, and Windows.
- **Web Share Target:** Tap "Share" from social media apps on your mobile device and pick SaveSini to ingest links directly.

### 11. 💾 Portable Backups & CSV Export
- **CSV Spreadsheet Export:** Export your entire vault with IDs, platforms, titles, URLs, tags, and notes.
- **Full JSON Archive Backup:** Backup links and collections with one click, and restore them anytime on a new device.

---

## 🛠️ Tech Stack & Architecture

| Layer | Tooling |
| :--- | :--- |
| **Frontend Framework** | [React 19](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/) |
| **Database** | [Google Cloud Firestore](https://firebase.google.com/docs/firestore) (Enterprise Edition) |
| **Authentication** | [Firebase Authentication](https://firebase.google.com/docs/auth) (Google OAuth & Email/Password) |
| **Security** | Zero-Trust Attribute-Based Access Control (`firestore.rules`) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) with Fast Refresh |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (Minimalist zinc theme tokens) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animations** | [canvas-confetti](https://www.npmjs.com/package/canvas-confetti) |
| **PWA & Offline** | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Service Worker + Web App Manifest) |

---

## 📁 Project Structure

```text
savesini/
├── public/
│   ├── icon.svg                    # Vector app logo & PWA asset
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── AuthView.tsx            # Initial Sign In / Sign Up gateway
│   │   ├── AssignLinksModal.tsx    # Manage and assign bookmarks to collections
│   │   ├── BackupModal.tsx         # JSON backup export and restore manager
│   │   ├── BookmarkletModal.tsx    # Browser bookmarklet setup & drag button
│   │   ├── Footer.tsx              # Minimalist application footer
│   │   ├── Header.tsx              # Navigation, user profile, cloud sync status, & PWA install
│   │   ├── QuickCaptureView.tsx    # Fast URL capture form with voice input & auto-enrich
│   │   ├── ReaderModal.tsx         # Distraction-free reading & quote snapshot viewer
│   │   ├── Toast.tsx               # Minimalist toast notifications
│   │   ├── UnifiedVaultView.tsx    # Real-time search suite, collections, card & list views
│   │   └── WeeklyDigestModal.tsx   # Multi-format digest synthesizer (WA, Newsletter, MD)
│   ├── hooks/
│   │   ├── usePWAInstall.ts        # PWA installation prompt & standalone detection
│   │   └── useVoiceInput.ts        # Web Speech API voice capture hook
│   ├── utils/
│   │   ├── firebase.ts             # Firebase Auth, Firestore queries, and real-time sync
│   │   ├── initialData.ts          # Seed data and curated references
│   │   ├── linkEnricher.ts         # Heuristic URL metadata enrichment & digest generator
│   │   ├── platformDetect.ts       # Social platform identifier & handle extractor
│   │   └── storage.ts              # LocalStorage cache, CSV exporter, and JSON backup logic
│   ├── App.tsx                     # Root state container, auth routing, & Firestore listeners
│   ├── index.css                   # Tailwind v4 configuration & theme tokens
│   ├── main.tsx                    # React DOM entry point
│   └── types.ts                    # Core TypeScript domain models
├── firebase-applet-config.json     # Provisioned Firebase app configuration
├── firebase-blueprint.json         # Data model intermediate representation (IR)
├── firestore.rules                 # Hardened Firestore security rules
├── security_spec.md                # Security invariants and payload rejection specifications
├── index.html                      # HTML entry with SEO & OpenGraph meta tags
├── package.json                    # Project dependencies and npm scripts
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build and PWA service worker config
```

---

## 🚀 Getting Started

### 🌐 Live Access & Instant Testing (No Setup Required)

You can immediately try and test the live application without running any local code:

👉 **[https://savesini.ai.studio](https://savesini.ai.studio)**

- **1-Click Google Sign-In:** Authenticate instantly to access your personal cloud vault.
- **Pre-Seeded Frameworks:** New accounts automatically load sample high-signal coaching links in their Firebase vault.
- **Installable PWA:** Open the URL on your mobile phone (Safari > *Add to Home Screen* or Chrome > *Install App*) to test it as a standalone app.

---

### Local Development Setup

#### Prerequisites
- [Node.js](https://nodejs.org/) v18.0 or higher
- `npm` (or `pnpm` / `bun`)

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/<your-username>/savesini.git
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
Production assets will be generated in the `dist/` directory, ready to deploy to Cloud Run, Vercel, Firebase Hosting, Netlify, or any static hosting service.

---

## 📤 Pushing Updates to GitHub

To sync this commit and the updated README to your GitHub repository:

```bash
# Add your GitHub repository as the remote origin (if not already set)
git remote add origin https://github.com/<your-github-username>/<your-repo-name>.git

# Push the main branch with all latest commits and README
git push -u origin main
```

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
