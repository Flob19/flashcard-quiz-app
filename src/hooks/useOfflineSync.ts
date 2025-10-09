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
        // Always try Supabase first when online (for shared data)
        if (isOnline) {
          console.log('Loading sets from Supabase (shared database)...');
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 10000) // Increased timeout
          );
          
          const onlineSets = await Promise.race([
            storage.getSets(),
            timeoutPromise
          ]) as FlashcardSet[];
          
          console.log('✅ Supabase sets loaded:', onlineSets);
          setSets(onlineSets);
          // Save to offline storage for offline study
          saveOfflineSets(onlineSets);
          console.log(`✅ Loaded ${onlineSets.length} sets from Supabase (shared)`);
        } else {
          // Only use offline storage when truly offline
          console.log('Offline mode: Loading sets from local storage...');
          const offlineSets = getOfflineSets();
          console.log('✅ Offline sets loaded:', offlineSets);
          setSets(offlineSets);
          console.log(`✅ Loaded ${offlineSets.length} sets from offline storage`);
        }
      } catch (error) {
        console.error('❌ Error loading sets:', error);
        // Always fallback to offline storage
        console.log('🔄 Falling back to offline storage...');
        const offlineSets = getOfflineSets();
        console.log('✅ Fallback sets loaded:', offlineSets);
        setSets(offlineSets);
        console.log(`✅ Fallback: Loaded ${offlineSets.length} sets from offline storage`);
      } finally {
        setIsLoading(false);
      }
    };

    loadSets();
  }, [isOnline, saveOfflineSets, getOfflineSets]);

  // Sync when coming back online (disabled to prevent slow loading)
  // useEffect(() => {
  //   if (isOnline && sets.length > 0) {
  //     const syncOfflineToOnline = async () => {
  //       try {
  //         console.log('Syncing offline sets to Supabase...');
  //         const offlineSets = getOfflineSets();
  //         for (const set of offlineSets) {
  //           try {
  //             await storage.saveSet(set);
  //           } catch (error) {
  //             console.error('Failed to sync set:', error);
  //           }
  //         }
  //         // Reload from Supabase to get latest data
  //         const onlineSets = await storage.getSets();
  //         setSets(onlineSets);
  //         saveOfflineSets(onlineSets);
  //         console.log('Sync completed');
  //       } catch (error) {
  //         console.error('Error syncing:', error);
  //       }
  //     };

  //     // Small delay to ensure connection is stable
  //     const timeoutId = setTimeout(syncOfflineToOnline, 1000);
  //     return () => clearTimeout(timeoutId);
  //   }
  // }, [isOnline, getOfflineSets, saveOfflineSets]);

  const refreshSets = async () => {
    setIsLoading(true);
    try {
      if (isOnline) {
        // Add timeout for refresh too
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        );
        
        const onlineSets = await Promise.race([
          storage.getSets(),
          timeoutPromise
        ]) as FlashcardSet[];
        
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
