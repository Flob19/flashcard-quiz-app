-- Create flashcard_sets table
CREATE TABLE IF NOT EXISTS flashcard_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID NOT NULL REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_image TEXT,
  answer TEXT NOT NULL,
  answer_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flashcards_set_id ON flashcards(set_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_sets_created_at ON flashcard_sets(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your auth requirements)
CREATE POLICY "Allow public read access to flashcard_sets" ON flashcard_sets
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to flashcard_sets" ON flashcard_sets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to flashcard_sets" ON flashcard_sets
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to flashcard_sets" ON flashcard_sets
  FOR DELETE USING (true);

CREATE POLICY "Allow public read access to flashcards" ON flashcards
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to flashcards" ON flashcards
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to flashcards" ON flashcards
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to flashcards" ON flashcards
  FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_flashcard_sets_updated_at 
  BEFORE UPDATE ON flashcard_sets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flashcards_updated_at 
  BEFORE UPDATE ON flashcards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
