export interface Flashcard {
  id: string;
  question: string;
  questionImage?: string;
  answer: string;
  answerImage?: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  createdAt: number;
  updatedAt: number;
}
