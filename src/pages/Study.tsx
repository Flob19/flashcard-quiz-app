import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { storage } from '@/lib/storage';
import { FlashcardSet } from '@/types/flashcard';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { ImageViewer } from '@/components/ImageViewer';
import { MathRenderer } from '@/components/MathRenderer';

const Study = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const loadSet = async () => {
        try {
          const loadedSet = await storage.getSet(id);
          if (loadedSet && loadedSet.cards.length > 0) {
            setSet(loadedSet);
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Error loading set:', error);
          navigate('/');
        }
      };
      loadSet();
    }
  }, [id, navigate]);

  if (!set) return null;

  const currentCard = set.cards[currentIndex];
  const progress = ((currentIndex + 1) / set.cards.length) * 100;

  const handleNext = () => {
    if (currentIndex < set.cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleImageClick = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(imageUrl);
    setImageViewerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Exit Study Mode
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-primary text-primary hover:bg-primary/10"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
        </div>

        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold mb-2 text-foreground">{set.title}</h1>
          <p className="text-muted-foreground mb-4">
            Card {currentIndex + 1} of {set.cards.length}
          </p>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-8 perspective-1000">
          <Card
            className="relative h-96 cursor-pointer shadow-card-hover border-2 border-primary/20 transition-all duration-500 preserve-3d"
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d'
            }}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front - Question */}
            <div
              className="absolute inset-0 backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8 bg-gradient-card rounded-lg">
                <div className="text-center w-full">
                  <p className="text-sm uppercase tracking-wide text-muted-foreground mb-4">
                    Question
                  </p>
                  {currentCard.questionImage && (
                    <img
                      src={currentCard.questionImage}
                      alt="Question"
                      className="max-h-48 mx-auto mb-4 rounded-lg shadow-card object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => handleImageClick(currentCard.questionImage!, e)}
                    />
                  )}
                  <div className="text-2xl font-semibold text-foreground">
                    <MathRenderer content={currentCard.question} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-6">
                    Click to reveal answer
                  </p>
                </div>
              </CardContent>
            </div>

            {/* Back - Answer */}
            <div
              className="absolute inset-0 backface-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8 bg-gradient-primary rounded-lg">
                <div className="text-center w-full">
                  <p className="text-sm uppercase tracking-wide text-primary-foreground/80 mb-4">
                    Answer
                  </p>
                  {currentCard.answerImage && (
                    <img
                      src={currentCard.answerImage}
                      alt="Answer"
                      className="max-h-48 mx-auto mb-4 rounded-lg shadow-card object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => handleImageClick(currentCard.answerImage!, e)}
                    />
                  )}
                  <div className="text-2xl font-semibold text-primary-foreground">
                    <MathRenderer content={currentCard.answer} />
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        <div className="flex justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            size="lg"
            className="flex-1 border-border hover:bg-muted"
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === set.cards.length - 1}
            className="flex-1 bg-gradient-primary hover:opacity-90 transition-opacity"
            size="lg"
          >
            Next
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {currentIndex === set.cards.length - 1 && (
          <div className="mt-8 p-6 bg-gradient-card rounded-lg text-center shadow-card animate-slide-up">
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              🎉 You've reached the end!
            </h3>
            <p className="text-muted-foreground mb-4">
              Great job studying {set.cards.length} cards
            </p>
            <Button
              onClick={handleReset}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Study Again
            </Button>
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageViewer
          src={selectedImage}
          alt="Study image"
          isOpen={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default Study;
