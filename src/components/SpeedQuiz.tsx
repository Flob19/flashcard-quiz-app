import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flashcard } from '@/types/flashcard';
import { Zap, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SpeedQuizProps {
  onImport: (cards: Flashcard[]) => void;
}

export const SpeedQuiz = ({ onImport }: SpeedQuizProps) => {
  const [input, setInput] = useState('');
  const [parsedCards, setParsedCards] = useState<Flashcard[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const parseInput = () => {
    if (!input.trim()) {
      toast({
        title: "No input",
        description: "Please paste your ChatGPT output first",
        variant: "destructive"
      });
      return;
    }

    setIsParsing(true);
    
    try {
      // Split by separator (---)
      const sections = input.split('---').map(s => s.trim()).filter(s => s.length > 0);
      
      const cards: Flashcard[] = [];
      
      for (let i = 0; i < sections.length; i += 2) {
        if (i + 1 < sections.length) {
          const question = sections[i].trim();
          const answer = sections[i + 1].trim();
          
          if (question && answer) {
            cards.push({
              id: crypto.randomUUID(),
              question,
              answer
            });
          }
        }
      }
      
      if (cards.length === 0) {
        toast({
          title: "No cards found",
          description: "Could not parse any question-answer pairs. Make sure to use '---' as separator.",
          variant: "destructive"
        });
      } else {
        setParsedCards(cards);
        toast({
          title: "Success!",
          description: `Parsed ${cards.length} flashcard(s)`,
        });
      }
    } catch (error) {
      console.error('Error parsing input:', error);
      toast({
        title: "Parse error",
        description: "Failed to parse the input. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = () => {
    if (parsedCards.length > 0) {
      onImport(parsedCards);
      setInput('');
      setParsedCards([]);
      toast({
        title: "Imported!",
        description: `${parsedCards.length} cards added to your quiz`,
      });
    }
  };

  const copyExample = () => {
    const example = `Vad är huvudstaden i Sverige?
---
Stockholm
---
Vilken är Sveriges största stad?
---
Stockholm
---
Vad heter Sveriges nationaldag?
---
6 juni`;
    
    navigator.clipboard.writeText(example).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Copied!",
        description: "Example format copied to clipboard",
      });
    });
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Zap className="h-5 w-5 text-yellow-500" />
          Speed Quiz - Import from ChatGPT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Paste ChatGPT output here (use '---' as separator)
          </label>
          <Textarea
            placeholder="Paste your ChatGPT Q&A here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-32 border-border focus:ring-primary"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={parseInput}
              disabled={isParsing || !input.trim()}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary/10"
            >
              {isParsing ? "Parsing..." : "Parse Cards"}
            </Button>
            <Button
              onClick={copyExample}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy Example"}
            </Button>
          </div>
        </div>

        {parsedCards.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">
                Preview ({parsedCards.length} cards)
              </h4>
              <Button
                onClick={handleImport}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
                size="sm"
              >
                Import All Cards
              </Button>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2">
              {parsedCards.map((card, index) => (
                <div key={card.id} className="p-3 bg-muted/30 rounded-lg border border-border/50">
                  <div className="text-sm font-medium text-foreground mb-1">
                    Q{index + 1}: {card.question}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    A: {card.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg">
          <strong>Format:</strong> Question<br/>
          ---<br/>
          Answer<br/>
          ---<br/>
          Next Question<br/>
          ---<br/>
          Next Answer
        </div>
      </CardContent>
    </Card>
  );
};
