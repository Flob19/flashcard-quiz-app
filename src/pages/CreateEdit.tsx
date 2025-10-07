import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { SpeedQuiz } from '@/components/SpeedQuiz';
import { MathRenderer } from '@/components/MathRenderer';
import { storage } from '@/lib/storage';
import { Flashcard, FlashcardSet } from '@/types/flashcard';
import { Plus, Trash2, ArrowLeft, Save, Zap, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([
    { id: crypto.randomUUID(), question: '', answer: '' }
  ]);
  const [showSpeedQuiz, setShowSpeedQuiz] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (id) {
      const loadSet = async () => {
        try {
          const set = await storage.getSet(id);
          if (set) {
            setTitle(set.title);
            setDescription(set.description);
            setCards(set.cards.length > 0 ? set.cards : [{ id: crypto.randomUUID(), question: '', answer: '' }]);
          }
        } catch (error) {
          console.error('Error loading set:', error);
          toast({
            title: "Error",
            description: "Failed to load the study set",
            variant: "destructive"
          });
        }
      };
      loadSet();
    }
  }, [id, toast]);

  const addCard = () => {
    setCards([...cards, { id: crypto.randomUUID(), question: '', answer: '' }]);
  };

  const removeCard = (cardId: string) => {
    if (cards.length > 1) {
      setCards(cards.filter(c => c.id !== cardId));
    }
  };

  const updateCard = (cardId: string, field: keyof Flashcard, value: string | undefined) => {
    setCards(cards.map(c => {
      if (c.id === cardId) {
        return { ...c, [field]: value };
      }
      return c;
    }));
  };

  const handleSpeedQuizImport = (importedCards: Flashcard[]) => {
    setCards([...cards, ...importedCards]);
    setShowSpeedQuiz(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your study set",
        variant: "destructive"
      });
      return;
    }

    const validCards = cards.filter(c => c.question.trim() || c.answer.trim());
    if (validCards.length === 0) {
      toast({
        title: "Cards required",
        description: "Please add at least one card with content",
        variant: "destructive"
      });
      return;
    }

    try {
      const existingSet = id ? await storage.getSet(id) : null;
      const set: FlashcardSet = {
        id: id || crypto.randomUUID(),
        title,
        description,
        cards: validCards,
        createdAt: existingSet?.createdAt || Date.now(),
        updatedAt: Date.now()
      };

      await storage.saveSet(set);
      toast({
        title: "Success!",
        description: `Study set ${id ? 'updated' : 'created'} successfully`
      });
      navigate('/');
    } catch (error) {
      console.error('Error saving set:', error);
      toast({
        title: "Error",
        description: "Failed to save the study set. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sets
        </Button>

        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            {id ? 'Edit Study Set' : 'Create New Study Set'}
          </h1>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Title
              </label>
              <Input
                placeholder="Enter set title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg border-border focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description (optional)
              </label>
              <Textarea
                placeholder="What's this set about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-border focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {showSpeedQuiz && (
          <div className="mb-8">
            <SpeedQuiz onImport={handleSpeedQuizImport} />
          </div>
        )}

        {showPreview && (
          <div className="mb-8">
            <Card className="bg-gradient-card shadow-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Math Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Preview how your math will look:
                </div>
                <div className="space-y-3">
                  <div>
                    <strong>Inline math:</strong> Use single $ like $x^2 + y^2 = z^2$
                  </div>
                  <div>
                    <strong>Block math:</strong> Use double $$ like {`$$\\int_0^\\infty e^{-x} dx = 1$$`}
                  </div>
                </div>
                <div className="p-4 bg-muted/20 rounded-lg">
                  <MathRenderer content="Example: The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-6 mb-8">
          {cards.map((card, index) => (
            <Card key={card.id} className="bg-gradient-card shadow-card border-border/50 animate-slide-up">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg text-foreground">Card {index + 1}</CardTitle>
                  {cards.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCard(card.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Question
                  </label>
                  <Textarea
                    placeholder="Enter question..."
                    value={card.question}
                    onChange={(e) => updateCard(card.id, 'question', e.target.value)}
                    className="border-border focus:ring-primary"
                  />
                  <div className="mt-4">
                    <ImageUpload
                      value={card.questionImage}
                      onChange={(url) => updateCard(card.id, 'questionImage', url)}
                      label="Question Image (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Answer
                  </label>
                  <Textarea
                    placeholder="Enter answer..."
                    value={card.answer}
                    onChange={(e) => updateCard(card.id, 'answer', e.target.value)}
                    className="border-border focus:ring-primary"
                  />
                  <div className="mt-4">
                    <ImageUpload
                      value={card.answerImage}
                      onChange={(url) => updateCard(card.id, 'answerImage', url)}
                      label="Answer Image (optional)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 rounded-lg border border-border shadow-card">
          <Button
            onClick={addCard}
            variant="outline"
            className="flex-1 border-primary text-primary hover:bg-primary/10"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
          <Button
            onClick={() => setShowSpeedQuiz(!showSpeedQuiz)}
            variant="outline"
            className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10"
          >
            <Zap className="mr-2 h-4 w-4" />
            {showSpeedQuiz ? 'Hide' : 'Speed Quiz'}
          </Button>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="border-blue-500 text-blue-600 hover:bg-blue-500/10"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? 'Hide' : 'Math Help'}
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            {id ? 'Save Changes' : 'Create Set'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEdit;
