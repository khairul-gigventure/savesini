import { useState, useEffect, useCallback, useRef } from 'react';
import { ViewTab, SocialLink, CoachingCollection } from './types';
import { loadLinks, saveLinks, loadCollections, saveCollections, getStorageStats, exportToCSV } from './utils/storage';
import { Header } from './components/Header';
import { Toast, ToastState } from './components/Toast';
import { QuickCaptureView } from './components/QuickCaptureView';
import { UnifiedVaultView } from './components/UnifiedVaultView';
import { BackupModal } from './components/BackupModal';
import { AssignLinksModal } from './components/AssignLinksModal';
import { ReaderModal } from './components/ReaderModal';
import { WeeklyDigestModal } from './components/WeeklyDigestModal';
import { BookmarkletModal } from './components/BookmarkletModal';
import { Footer } from './components/Footer';
import { AuthView } from './components/AuthView';
import {
  auth,
  testConnection,
  signInWithGoogle,
  signOutUser,
  saveLinkToFirestore,
  deleteLinkFromFirestore,
  saveCollectionToFirestore,
  deleteCollectionFromFirestore,
  subscribeToUserVault,
  seedUserVaultIfEmpty,
} from './utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('quick-capture');
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [collections, setCollections] = useState<CoachingCollection[]>([]);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [assignModalCollectionId, setAssignModalCollectionId] = useState<string | null>(null);

  // Firebase Auth & Cloud Sync States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Editorial Modals
  const [selectedReaderLink, setSelectedReaderLink] = useState<SocialLink | null>(null);
  const [isWeeklyDigestOpen, setIsWeeklyDigestOpen] = useState(false);
  const [isBookmarkletOpen, setIsBookmarkletOpen] = useState(false);

  // Storage usage stats
  const [storageUsage, setStorageUsage] = useState(() => getStorageStats());

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ show: true, message, type });
  }, []);

  // 1. Initial Connection Test
  useEffect(() => {
    testConnection();
  }, []);

  // 2. Firebase Auth & Real-Time Sync Subscription
  useEffect(() => {
    let unsubscribeVault: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);

      if (user) {
        setIsGuestMode(false);
        setIsSyncing(true);
        try {
          // Check if this user's Firebase vault needs initial links and collections
          await seedUserVaultIfEmpty(user.uid);

          // Subscribe to real-time updates from Firestore for this user
          unsubscribeVault = subscribeToUserVault(
            user.uid,
            (cloudLinks) => {
              setLinks(cloudLinks);
              saveLinks(cloudLinks);
              setStorageUsage(getStorageStats());
              setIsSyncing(false);
            },
            (cloudCols) => {
              setCollections(cloudCols);
              saveCollections(cloudCols);
              setStorageUsage(getStorageStats());
              setIsSyncing(false);
            }
          );

          showToast(`Welcome back, ${user.displayName || user.email}! Vault connected to Firebase.`);
        } catch (err) {
          console.error('Initial vault sync error', err);
          setIsSyncing(false);
        }
      } else {
        // If not logged in and not in guest mode, clear active memory links
        if (unsubscribeVault) {
          unsubscribeVault();
          unsubscribeVault = null;
        }
        setIsSyncing(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeVault) unsubscribeVault();
    };
  }, [showToast]);

  // Handle incoming share target or bookmarklet params (?url=...&title=...&text=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const incomingUrl = params.get('url');

      if (incomingUrl) {
        setActiveTab('quick-capture');
        showToast('Shared link detected! Ready to capture.', 'info');
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, [showToast]);

  // Save changes to localStorage
  const handleSaveLinks = useCallback((newLinks: SocialLink[]) => {
    setLinks(newLinks);
    saveLinks(newLinks);
    setStorageUsage(getStorageStats());
  }, []);

  const handleSaveCollections = useCallback((newCollections: CoachingCollection[]) => {
    setCollections(newCollections);
    saveCollections(newCollections);
    setStorageUsage(getStorageStats());
  }, []);

  // Add new link handler
  const handleAddLink = useCallback(
    (newLinkData: Omit<SocialLink, 'id' | 'dateAdded'>) => {
      const newLink: SocialLink = {
        ...newLinkData,
        id: `link-${Date.now()}`,
        userId: currentUser?.uid,
        dateAdded: new Date().toISOString(),
        displayTimeAgo: 'Just now',
      };
      const updated = [newLink, ...links];
      handleSaveLinks(updated);

      // Save directly to Firebase Firestore
      if (currentUser) {
        saveLinkToFirestore(currentUser.uid, newLink).catch((err) =>
          console.error('Failed to sync link to Firebase', err)
        );
      }

      showToast(`Bookmark saved to Firebase: "${newLink.title.slice(0, 30)}..."`);
    },
    [links, currentUser, handleSaveLinks, showToast]
  );

  // Delete link handler
  const handleDeleteLink = useCallback(
    (id: string) => {
      const target = links.find((l) => l.id === id);
      const updated = links.filter((l) => l.id !== id);
      handleSaveLinks(updated);

      // Also clean up any collection references
      const updatedCols = collections.map((col) => ({
        ...col,
        linkIds: col.linkIds.filter((lId) => lId !== id),
      }));
      handleSaveCollections(updatedCols);

      if (selectedReaderLink?.id === id) {
        setSelectedReaderLink(null);
      }

      // Delete directly from Firebase Firestore
      if (currentUser) {
        deleteLinkFromFirestore(currentUser.uid, id).catch((err) =>
          console.error('Failed to delete link from Firebase', err)
        );
      }

      showToast(`Link "${target?.title.slice(0, 24) || 'item'}" deleted from Firebase.`, 'info');
    },
    [links, collections, selectedReaderLink, currentUser, handleSaveLinks, handleSaveCollections, showToast]
  );

  // Copy link handler
  const handleCopyLink = useCallback(
    (url: string) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).catch(() => {});
      }
      showToast(`Link copied: ${url.slice(0, 36)}...`);
    },
    [showToast]
  );

  // CSV Export handler
  const handleExportCSV = useCallback(() => {
    exportToCSV(links);
    showToast('CSV file downloaded successfully.');
  }, [links, showToast]);

  // Collection link assignment
  const handleAssignLinksToCollection = (collectionId: string, updatedLinkIds: string[]) => {
    const updated = collections.map((col) =>
      col.id === collectionId ? { ...col, linkIds: updatedLinkIds } : col
    );
    handleSaveCollections(updated);

    if (currentUser) {
      const targetCol = updated.find((c) => c.id === collectionId);
      if (targetCol) {
        saveCollectionToFirestore(currentUser.uid, targetCol).catch((err) =>
          console.error('Failed to update collection in Firebase', err)
        );
      }
    }

    showToast('Collection updated in Firebase.');
  };

  const handleShareCollection = (collection: CoachingCollection) => {
    const textToCopy = `SaveSini Collection: ${collection.title}\n${collection.subtitle}\nCurated by Coach Khairul (${collection.linkIds.length} links)`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).catch(() => {});
    }
    showToast(`Collection summary copied to clipboard! (${collection.linkIds.length} links)`);
  };

  // Google Sign In / Sign Out Handlers
  const handleSignInGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      showToast('Sign in cancelled or failed.', 'error');
    }
  };

  const handleSignOutUser = async () => {
    try {
      await signOutUser();
      setLinks([]);
      setCollections([]);
      setIsGuestMode(false);
      showToast('Signed out of Firebase account.', 'info');
    } catch (err) {
      showToast('Failed to sign out.', 'error');
    }
  };

  // Expose global helpers to window for evaluation & script parity
  useEffect(() => {
    (window as any).triggerExportCSV = handleExportCSV;
    (window as any).copyLink = handleCopyLink;
    (window as any).showToast = showToast;
  }, [handleExportCSV, handleCopyLink, showToast]);

  // 3. Initial Auth Loading State
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center font-['Inter'] space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
        <span className="text-xs font-semibold text-zinc-500">Connecting to SaveSini Firebase...</span>
      </div>
    );
  }

  // 4. If unauthenticated and not in guest preview mode: Show Auth Gateway (Sign In / Sign Up)
  if (!currentUser && !isGuestMode) {
    return (
      <>
        <Toast toast={toast} onClose={() => setToast({ show: false, message: '' })} />
        <AuthView
          onSuccess={() => {}}
          onContinueAsGuest={() => {
            setIsGuestMode(true);
            setLinks(loadLinks());
            setCollections(loadCollections());
          }}
        />
      </>
    );
  }

  const activeCollectionForModal = collections.find((c) => c.id === assignModalCollectionId) || null;

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col font-['Inter'] selection:bg-zinc-900 selection:text-white">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast({ show: false, message: '' })} />

      {/* Main Header with Firebase Auth */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onExportCSV={handleExportCSV}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onOpenWeeklyDigest={() => setIsWeeklyDigestOpen(true)}
        onOpenBookmarklet={() => setIsBookmarkletOpen(true)}
        currentUser={currentUser}
        isSyncing={isSyncing}
        onSignInWithGoogle={handleSignInGoogle}
        onSignOut={handleSignOutUser}
      />

      {/* Main Views Container */}
      <main className="w-full pt-16 flex-1">
        {activeTab === 'quick-capture' && (
          <QuickCaptureView
            links={links}
            onSaveLink={handleAddLink}
            onNavigateToVault={() => setActiveTab('bookmarks')}
            onCopyLink={handleCopyLink}
            storageFreePercentage={100 - storageUsage.percentage}
            onOpenBookmarklet={() => setIsBookmarkletOpen(true)}
          />
        )}

        {activeTab === 'bookmarks' && (
          <UnifiedVaultView
            links={links}
            collections={collections}
            onSaveLink={handleAddLink}
            onDeleteLink={handleDeleteLink}
            onCopyLink={handleCopyLink}
            onExportCSV={handleExportCSV}
            onUpdateCollections={handleSaveCollections}
            onOpenAssignModal={(colId) => setAssignModalCollectionId(colId)}
            onShareCollection={handleShareCollection}
            storageUsage={storageUsage}
            onOpenReader={(link) => setSelectedReaderLink(link)}
            onOpenWeeklyDigest={() => setIsWeeklyDigestOpen(true)}
            onOpenBookmarklet={() => setIsBookmarkletOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Reader Modal / Focus Mode */}
      <ReaderModal
        isOpen={selectedReaderLink !== null}
        link={selectedReaderLink}
        onClose={() => setSelectedReaderLink(null)}
        onCopyLink={handleCopyLink}
        onDeleteLink={handleDeleteLink}
      />

      {/* Weekly Digest Generator Modal */}
      <WeeklyDigestModal
        isOpen={isWeeklyDigestOpen}
        onClose={() => setIsWeeklyDigestOpen(false)}
        links={links}
        collections={collections}
      />

      {/* Browser Bookmarklet Guide Modal */}
      <BookmarkletModal
        isOpen={isBookmarkletOpen}
        onClose={() => setIsBookmarkletOpen(false)}
      />

      {/* Backup & Recovery Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        links={links}
        collections={collections}
        onDataRestored={(newLinks, newCollections) => {
          handleSaveLinks(newLinks);
          handleSaveCollections(newCollections);
          if (currentUser) {
            seedUserVaultIfEmpty(currentUser.uid);
          }
          showToast('Data restored successfully!');
        }}
      />

      {/* Assign Links to Collection Modal */}
      <AssignLinksModal
        isOpen={assignModalCollectionId !== null}
        collection={activeCollectionForModal}
        allLinks={links}
        onClose={() => setAssignModalCollectionId(null)}
        onSave={handleAssignLinksToCollection}
      />
    </div>
  );
}
