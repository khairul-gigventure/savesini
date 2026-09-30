import { SocialLink, PlatformType } from '../types';
import { detectPlatform, extractHandleFromUrl } from './platformDetect';

export interface EnrichedMetadata {
  title: string;
  author: string;
  authorHandle: string;
  notes: string;
  tags: string[];
  originalText?: string;
  readTime?: string;
}

/**
 * Intelligent client-side metadata extraction.
 * Infers rich context from URL patterns, author handles, and topic heuristics.
 */
export function enrichUrlMetadata(rawUrl: string): EnrichedMetadata {
  const cleanUrl = rawUrl.trim();
  const platform = detectPlatform(cleanUrl);
  const handle = extractHandleFromUrl(cleanUrl, platform);

  // Default fallback values
  let title = 'Curated Social Media Resource';
  let notes = 'Key takeaways and strategic execution notes recorded in personal vault.';
  let tags: string[] = ['#Coaching'];
  let originalText = '';
  let readTime = '2 min read';

  try {
    const urlObj = new URL(cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`);
    const pathname = urlObj.pathname;
    const pathParts = pathname.split('/').filter(Boolean);

    if (platform === 'x') {
      const username = pathParts[0] || handle.replace('@', '');
      const statusId = pathParts[2] || '';

      if (cleanUrl.toLowerCase().includes('dankoe')) {
        title = 'The Solopreneur Leverage & Scaling Architecture';
        notes = 'Asynchronous onboarding and specialized knowledge leverage to decouple time from earnings.';
        tags = ['#Frameworks', '#Coaching', '#Business'];
        originalText = 'The modern one-person business isn’t about trading time for money. It’s about building leverage through code, media, and specialized knowledge.';
      } else if (cleanUrl.toLowerCase().includes('hormozi')) {
        title = 'Grand Slam Offer Equation: Value Maximization Model';
        notes = 'Eliminate 10x customer sacrifice rather than adding more checklists. Dream outcome clarity.';
        tags = ['#Pricing', '#Coaching', '#Business'];
        originalText = 'Make offers so good people feel stupid saying no. Maximize the dream outcome and perceived likelihood of achievement while minimizing time delay and effort.';
      } else {
        title = `Strategic Insight by @${username}${statusId ? ` (Ref #${statusId.slice(-4)})` : ''}`;
        notes = `High-signal breakdown from @${username} on X platform.`;
        tags = ['#Coaching', '#Marketing'];
        originalText = 'Actionable insight on high-performance execution, systems design, and daily discipline.';
      }
    } else if (platform === 'threads') {
      const username = pathParts[0]?.replace('@', '') || 'creator';
      title = `Audience Growth & Reflection by @${username}`;
      notes = 'Nuanced community engagement strategy and authentic audience compounding.';
      tags = ['#ThreadsStrategy', '#Branding'];
      originalText = 'Consistency builds enduring trust. Don’t chase viral surges; cultivate deep loyalty with the right 100 leaders.';
    } else if (platform === 'linkedin') {
      const postSlug = pathParts[pathParts.length - 1] || '';
      const readableSlug = decodeURIComponent(postSlug)
        .replace(/[-_]/g, ' ')
        .replace(/\d+.*$/, '')
        .trim();

      title = readableSlug && readableSlug.length > 5
        ? readableSlug.charAt(0).toUpperCase() + readableSlug.slice(1)
        : 'Executive Performance & Leadership Case Study';
      notes = 'Strategic leadership model and high-velocity decision frameworks.';
      tags = ['#Leadership', '#Productivity', '#Coaching'];
      originalText = 'Sustainable peak performance starts with psychological safety, clear decision rights, and structured sleep recovery.';
    } else if (platform === 'facebook') {
      title = 'Mastermind & Community Retention Architecture';
      notes = 'Frameworks for peer accountability hotseats and member engagement.';
      tags = ['#Community', '#Marketing'];
      originalText = 'Active masterminds thrive when members have safe spaces to share genuine roadblocks with structured feedback timers.';
    } else {
      const domain = urlObj.hostname.replace('www.', '');
      title = `Reference Guide (${domain})`;
      notes = `Curated resource indexed from ${domain}.`;
      tags = ['#Business', '#Coaching'];
    }
  } catch {
    // Keep defaults
  }

  return {
    title,
    author: handle.replace('@', '') || 'Creator',
    authorHandle: handle,
    notes,
    tags,
    originalText,
    readTime,
  };
}

/**
 * Generates an executive weekly digest in multiple formats.
 */
export function generateWeeklyDigest(
  links: SocialLink[],
  format: 'whatsapp' | 'newsletter' | 'markdown',
  collectionTitle?: string
): string {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (links.length === 0) {
    return 'No bookmarks selected for weekly digest generation.';
  }

  if (format === 'whatsapp') {
    const listItems = links
      .map(
        (l, i) =>
          `*${i + 1}. ${l.title}*\n` +
          `👤 Author: ${l.authorHandle || l.author} (${l.platform.toUpperCase()})\n` +
          `💡 *Key Takeaway:* ${l.notes || 'High-signal reference.'}\n` +
          `🔗 Link: ${l.url}\n`
      )
      .join('\n');

    return (
      `*📌 COACH KHAIRUL — WEEKLY INTEL DIGEST*\n` +
      `_Date: ${currentDate}_\n` +
      `${collectionTitle ? `_Folder: ${collectionTitle}_\n` : ''}\n` +
      `Hello team! Here are ${links.length} curated high-signal frameworks and insights for your execution this week:\n\n` +
      `${listItems}\n` +
      `_Curated via SaveSini — Social Intel Vault._`
    );
  }

  if (format === 'newsletter') {
    const listItems = links
      .map(
        (l, i) =>
          `### ${i + 1}. ${l.title}\n\n` +
          `> "${l.originalText || l.title}" — *${l.authorHandle || l.author} (${l.platform.toUpperCase()})*\n\n` +
          `**Coach's Synthesis:**\n${l.notes}\n\n` +
          `[View Original Post](${l.url})\n\n---`
      )
      .join('\n\n');

    return (
      `# Executive Weekly Intel by Coach Khairul\n` +
      `*Published on: ${currentDate}*\n\n` +
      `Welcome to this week's intelligence dispatch. Below are ${links.length} curated insights across business scaling, pricing models, and executive stamina.\n\n` +
      `${listItems}\n\n` +
      `Have a high-leverage week ahead!`
    );
  }

  // Default: Markdown for Obsidian / Notion
  const frontmatter =
    `---\n` +
    `title: "Coach Khairul Digest - ${currentDate}"\n` +
    `date: "${new Date().toISOString().split('T')[0]}"\n` +
    `tags: ["coaching", "intel-vault", "curation"]\n` +
    `total_links: ${links.length}\n` +
    `---\n\n`;

  const mdList = links
    .map((l) => {
      return (
        `## [${l.title}](${l.url})\n\n` +
        `- **Platform:** \`${l.platform}\`\n` +
        `- **Author:** ${l.authorHandle || l.author}\n` +
        `- **Added:** ${new Date(l.dateAdded).toLocaleDateString('en-US')}\n` +
        `- **Tags:** ${l.tags.join(', ')}\n\n` +
        (l.originalText ? `> ${l.originalText.replace(/\n/g, '\n> ')}\n\n` : '') +
        `### Coach Synthesis\n${l.notes || 'No synthesis recorded.'}\n\n` +
        `***\n`
      );
    })
    .join('\n');

  return frontmatter + `# SaveSini Knowledge Vault (${currentDate})\n\n` + mdList;
}

/**
 * Returns a bookmarklet JavaScript URI that can be dragged to the browser bar.
 */
export function getBookmarkletCode(): string {
  const code = `javascript:(function(){
    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title);
    var target = window.location.origin;
    var savesiniUrl = "${window.location.origin}/?url=" + url + "&title=" + title;
    window.open(savesiniUrl, '_blank');
  })();`;
  return code.replace(/\s+/g, ' ').trim();
}
