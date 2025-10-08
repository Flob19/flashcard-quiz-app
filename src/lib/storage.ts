import { FlashcardSet, Flashcard } from '@/types/flashcard';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type FlashcardSetRow = Tables<'flashcard_sets'>;
type FlashcardRow = Tables<'flashcards'>;
type FlashcardSetInsert = TablesInsert<'flashcard_sets'>;
type FlashcardInsert = TablesInsert<'flashcards'>;
type FlashcardSetUpdate = TablesUpdate<'flashcard_sets'>;
type FlashcardUpdate = TablesUpdate<'flashcards'>;

// Helper function to convert database rows to our types
const dbRowToFlashcardSet = async (setRow: FlashcardSetRow): Promise<FlashcardSet> => {
  const { data: cards, error } = await supabase
    .from('flashcards')
    .select('*')
    .eq('set_id', setRow.id)
    .order('created_at');

  if (error) {
    console.error('Error fetching flashcards:', error);
    throw error;
  }

  const flashcards: Flashcard[] = cards?.map(card => ({
    id: card.id,
    question: card.question,
    questionImage: card.question_image || undefined,
    answer: card.answer,
    answerImage: card.answer_image || undefined
  })) || [];

  return {
    id: setRow.id,
    title: setRow.title,
    description: setRow.description || '',
    cards: flashcards,
    createdAt: new Date(setRow.created_at).getTime(),
    updatedAt: new Date(setRow.updated_at).getTime()
  };
};

// Helper function to convert our types to database inserts
const flashcardSetToDbInsert = (set: FlashcardSet): { setInsert: FlashcardSetInsert, cardInserts: FlashcardInsert[] } => {
  const setInsert: FlashcardSetInsert = {
    id: set.id,
    title: set.title,
    description: set.description || null
  };

  const cardInserts: FlashcardInsert[] = set.cards.map(card => ({
    id: card.id,
    set_id: set.id,
    question: card.question,
    question_image: card.questionImage || null,
    answer: card.answer,
    answer_image: card.answerImage || null
  }));

  return { setInsert, cardInserts };
};

export const storage = {
  getSets: async (): Promise<FlashcardSet[]> => {
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching flashcard sets:', error);
        throw error;
      }

      if (!data) return [];

      // Convert each set row to our FlashcardSet type
      const sets = await Promise.all(data.map(dbRowToFlashcardSet));
      return sets;
    } catch (error) {
      console.error('Error in getSets:', error);
      // Quick fallback to localStorage without syncing
      const localSets = storage.getSetsFromLocalStorage();
      console.log(`Fallback: Returning ${localSets.length} sets from localStorage`);
      return localSets;
    }
  },

  saveSet: async (set: FlashcardSet): Promise<void> => {
    try {
      const { setInsert, cardInserts } = flashcardSetToDbInsert(set);

      // Start a transaction-like operation
      const { error: setError } = await supabase
        .from('flashcard_sets')
        .upsert(setInsert);

      if (setError) {
        console.error('Error saving flashcard set:', setError);
        throw setError;
      }

      // Delete existing cards and insert new ones
      const { error: deleteError } = await supabase
        .from('flashcards')
        .delete()
        .eq('set_id', set.id);

      if (deleteError) {
        console.error('Error deleting existing flashcards:', deleteError);
        throw deleteError;
      }

      if (cardInserts.length > 0) {
        const { error: cardsError } = await supabase
          .from('flashcards')
          .insert(cardInserts);

        if (cardsError) {
          console.error('Error saving flashcards:', cardsError);
          throw cardsError;
        }
      }

      // Also save to localStorage as backup
      storage.saveSetToLocalStorage(set);
    } catch (error) {
      console.error('Error in saveSet:', error);
      // Fallback to localStorage if Supabase fails
      storage.saveSetToLocalStorage(set);
      throw error;
    }
  },

  deleteSet: async (id: string): Promise<void> => {
    try {
      // Delete flashcards first (due to foreign key constraint)
      const { error: cardsError } = await supabase
        .from('flashcards')
        .delete()
        .eq('set_id', id);

      if (cardsError) {
        console.error('Error deleting flashcards:', cardsError);
        throw cardsError;
      }

      // Delete the set
      const { error: setError } = await supabase
        .from('flashcard_sets')
        .delete()
        .eq('id', id);

      if (setError) {
        console.error('Error deleting flashcard set:', setError);
        throw setError;
      }

      // Also delete from localStorage
      storage.deleteSetFromLocalStorage(id);
    } catch (error) {
      console.error('Error in deleteSet:', error);
      // Fallback to localStorage if Supabase fails
      storage.deleteSetFromLocalStorage(id);
      throw error;
    }
  },

  getSet: async (id: string): Promise<FlashcardSet | undefined> => {
    try {
      const { data, error } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return undefined;
        }
        console.error('Error fetching flashcard set:', error);
        throw error;
      }

      return await dbRowToFlashcardSet(data);
    } catch (error) {
      console.error('Error in getSet:', error);
      // Fallback to localStorage if Supabase fails
      return storage.getSetFromLocalStorage(id);
    }
  },

  // LocalStorage fallback methods
  getSetsFromLocalStorage: (): FlashcardSet[] => {
    const data = localStorage.getItem('flashcard-sets');
    return data ? JSON.parse(data) : [];
  },

  saveSetToLocalStorage: (set: FlashcardSet): void => {
    const sets = storage.getSetsFromLocalStorage();
    const index = sets.findIndex(s => s.id === set.id);
    
    if (index >= 0) {
      sets[index] = { ...set, updatedAt: Date.now() };
    } else {
      sets.push(set);
    }
    
    localStorage.setItem('flashcard-sets', JSON.stringify(sets));
  },

  deleteSetFromLocalStorage: (id: string): void => {
    const sets = storage.getSetsFromLocalStorage().filter(s => s.id !== id);
    localStorage.setItem('flashcard-sets', JSON.stringify(sets));
  },

  getSetFromLocalStorage: (id: string): FlashcardSet | undefined => {
    return storage.getSetsFromLocalStorage().find(s => s.id === id);
  }
};
