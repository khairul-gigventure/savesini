import { CoachingCollection, SocialLink } from '../types';
import { INITIAL_COLLECTIONS, INITIAL_LINKS } from './initialData';

const LINKS_KEY = 'savesini_links_v2';
const COLLECTIONS_KEY = 'savesini_collections_v2';

export function loadLinks(): SocialLink[] {
  try {
    const raw = localStorage.getItem(LINKS_KEY);
    if (!raw) {
      saveLinks(INITIAL_LINKS);
      return INITIAL_LINKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load links from storage', err);
  }
  return INITIAL_LINKS;
}

export function saveLinks(links: SocialLink[]): void {
  try {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
  } catch (err) {
    console.error('Failed to save links to storage', err);
  }
}

export function loadCollections(): CoachingCollection[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (!raw) {
      saveCollections(INITIAL_COLLECTIONS);
      return INITIAL_COLLECTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load collections from storage', err);
  }
  return INITIAL_COLLECTIONS;
}

export function saveCollections(collections: CoachingCollection[]): void {
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (err) {
    console.error('Failed to save collections to storage', err);
  }
}

export function getStorageStats(): { usedKb: number; totalKb: number; percentage: number } {
  try {
    const linksData = localStorage.getItem(LINKS_KEY) || '';
    const collectionsData = localStorage.getItem(COLLECTIONS_KEY) || '';
    const totalBytes = new Blob([linksData, collectionsData]).size;
    const usedKb = Math.round((totalBytes / 1024) * 10) / 10;
    const totalKb = 5120; // 5 MB standard browser limit
    const percentage = Math.max(1, Math.min(100, Math.round((usedKb / totalKb) * 100)));
    return { usedKb, totalKb, percentage };
  } catch {
    return { usedKb: 24.5, totalKb: 5120, percentage: 1 };
  }
}

export function exportToCSV(links: SocialLink[], filename = 'SaveSini_Vault_Export.csv'): void {
  const headers = ['Link ID', 'Platform', 'Title', 'URL', 'Tags', 'Notes', 'Date Added'];
  
  const escapeCsv = (val: string) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = links.map((link) => [
    escapeCsv(link.id),
    escapeCsv(link.platform.toUpperCase()),
    escapeCsv(link.title),
    escapeCsv(link.url),
    escapeCsv(link.tags.join(' ')),
    escapeCsv(link.notes),
    escapeCsv(link.dateAdded),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJSON(links: SocialLink[], collections: CoachingCollection[]): void {
  const data = {
    app: 'SaveSini',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    user: 'Coach Khairul',
    totalLinks: links.length,
    links,
    collections,
  };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `SaveSini_Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function resetVault(): { links: SocialLink[]; collections: CoachingCollection[] } {
  saveLinks(INITIAL_LINKS);
  saveCollections(INITIAL_COLLECTIONS);
  return { links: INITIAL_LINKS, collections: INITIAL_COLLECTIONS };
}
