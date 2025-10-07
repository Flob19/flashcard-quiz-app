import { FlashcardSet } from '@/types/flashcard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SetCardProps {
  set: FlashcardSet;
  onDelete: (id: string) => void;
}

export const SetCard = ({ set, onDelete }: SetCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 border-border/50">
      <CardHeader>
        <CardTitle className="text-foreground">{set.title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {set.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {set.cards.length} {set.cards.length === 1 ? 'card' : 'cards'}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/study/${set.id}`)}
              className="hover:bg-primary/10 hover:text-primary"
            >
              <BookOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/edit/${set.id}`)}
              className="hover:bg-accent/10 hover:text-accent"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(set.id)}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
