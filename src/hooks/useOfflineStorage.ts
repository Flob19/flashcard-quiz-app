import { useState, useEffect } from 'react';
import { FlashcardSet } from '@/types/flashcard';

const OFFLINE_STORAGE_KEY = 'offline-flashcard-sets';

export const useOfflineStorage = () => {
  const [offlineSets, setOfflineSets] = useState<FlashcardSet[]>([]);

  // Load offline sets on mount
  useEffect(() => {
    const loadOfflineSets = () => {
      try {
        const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
        if (stored) {
          setOfflineSets(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading offline sets:', error);
      }
    };

    loadOfflineSets();
  }, []);

  // Save sets to offline storage
  const saveOfflineSets = (sets: FlashcardSet[]) => {
    try {
      localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(sets));
      setOfflineSets(sets);
    } catch (error) {
      console.error('Error saving offline sets:', error);
    }
  };

  // Add a single set to offline storage
  const addOfflineSet = (set: FlashcardSet) => {
    const updatedSets = [...offlineSets, set];
    saveOfflineSets(updatedSets);
  };

  // Update a set in offline storage
  const updateOfflineSet = (updatedSet: FlashcardSet) => {
    const updatedSets = offlineSets.map(set => 
      set.id === updatedSet.id ? updatedSet : set
    );
    saveOfflineSets(updatedSets);
  };

  // Remove a set from offline storage
  const removeOfflineSet = (setId: string) => {
    const updatedSets = offlineSets.filter(set => set.id !== setId);
    saveOfflineSets(updatedSets);
  };

  // Get offline sets (for offline study)
  const getOfflineSets = () => {
    return offlineSets;
  };

  // Check if a set exists offline
  const hasOfflineSet = (setId: string) => {
    return offlineSets.some(set => set.id === setId);
  };

  return {
    offlineSets,
    saveOfflineSets,
    addOfflineSet,
    updateOfflineSet,
    removeOfflineSet,
    getOfflineSets,
    hasOfflineSet
  };
};
