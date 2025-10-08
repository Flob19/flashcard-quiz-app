import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { useOfflineStorage } from './useOfflineStorage';
import { FlashcardSet } from '@/types/flashcard';

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const { saveOfflineSets, getOfflineSets } = useOfflineStorage();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load sets with smart fallback
  useEffect(() => {
    const loadSets = async () => {
      setIsLoading(true);
      
      try {
        if (isOnline) {
          // Try to load from Supabase when online
          console.log('Loading sets from Supabase...');
          const onlineSets = await storage.getSets();
          setSets(onlineSets);
          // Always save to offline storage
          saveOfflineSets(onlineSets);
          console.log(`Loaded ${onlineSets.length} sets from Supabase`);
        } else {
          // Use offline storage when offline
          console.log('Loading sets from offline storage...');
          const offlineSets = getOfflineSets();
          setSets(offlineSets);
          console.log(`Loaded ${offlineSets.length} sets from offline storage`);
        }
      } catch (error) {
        console.error('Error loading sets:', error);
        // Fallback to offline storage
        const offlineSets = getOfflineSets();
        setSets(offlineSets);
        console.log(`Fallback: Loaded ${offlineSets.length} sets from offline storage`);
      } finally {
        setIsLoading(false);
      }
    };

    loadSets();
  }, [isOnline, saveOfflineSets, getOfflineSets]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && sets.length > 0) {
      const syncOfflineToOnline = async () => {
        try {
          console.log('Syncing offline sets to Supabase...');
          const offlineSets = getOfflineSets();
          for (const set of offlineSets) {
            try {
              await storage.saveSet(set);
            } catch (error) {
              console.error('Failed to sync set:', error);
            }
          }
          // Reload from Supabase to get latest data
          const onlineSets = await storage.getSets();
          setSets(onlineSets);
          saveOfflineSets(onlineSets);
          console.log('Sync completed');
        } catch (error) {
          console.error('Error syncing:', error);
        }
      };

      // Small delay to ensure connection is stable
      const timeoutId = setTimeout(syncOfflineToOnline, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, getOfflineSets, saveOfflineSets]);

  const refreshSets = async () => {
    setIsLoading(true);
    try {
      if (isOnline) {
        const onlineSets = await storage.getSets();
        setSets(onlineSets);
        saveOfflineSets(onlineSets);
      } else {
        const offlineSets = getOfflineSets();
        setSets(offlineSets);
      }
    } catch (error) {
      console.error('Error refreshing sets:', error);
      const offlineSets = getOfflineSets();
      setSets(offlineSets);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sets,
    isLoading,
    isOnline,
    refreshSets
  };
};
