import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SetCard } from '@/components/SetCard';
import { QRCode } from '@/components/QRCode';
import { SupabaseTest } from '@/components/SupabaseTest';
import { storage } from '@/lib/storage';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { FlashcardSet } from '@/types/flashcard';
import { Plus, BookOpen, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const Home = () => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<FlashcardSet | null>(null);
  const { saveOfflineSets, hasOfflineSet } = useOfflineStorage();
  
  // Get the current URL for QR code
  const currentUrl = window.location.href.replace('localhost', window.location.hostname);

  useEffect(() => {
    const loadSets = async () => {
      try {
        const sets = await storage.getSets();
        setSets(sets);
        // Save to offline storage for offline study
        saveOfflineSets(sets);
      } catch (error) {
        console.error('Error loading sets:', error);
      }
    };
    loadSets();
  }, [saveOfflineSets]);

  const handleDeleteClick = (id: string) => {
    const set = sets.find(s => s.id === id);
    if (set) {
      setSetToDelete(set);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (setToDelete) {
      try {
        await storage.deleteSet(setToDelete.id);
        const updatedSets = await storage.getSets();
        setSets(updatedSets);
        toast({
          title: "Deleted!",
          description: `"${setToDelete.title}" has been permanently deleted`,
        });
      } catch (error) {
        console.error('Error deleting set:', error);
        toast({
          title: "Error",
          description: "Failed to delete the study set. Please try again.",
          variant: "destructive"
        });
      } finally {
        setSetToDelete(null);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-gradient-primary rounded-full text-primary-foreground shadow-card">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-2xl font-bold">StudyCards Pro</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The ultimate flashcard app. All features free. No limitations.
          </p>
        </header>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">
            Your Study Sets
            {sets.length > 0 && (
              <span className="ml-3 text-lg text-muted-foreground font-normal">
                ({sets.length})
              </span>
            )}
          </h2>
          <div className="flex gap-3">
            <QRCode url={currentUrl} />
            <Button
              onClick={() => {
                saveOfflineSets(sets);
                toast({
                  title: "Downloaded for offline!",
                  description: `${sets.length} quiz sets are now available offline`,
                });
              }}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-500/10"
              size="lg"
            >
              <Download className="mr-2 h-5 w-5" />
              Download for Offline
            </Button>
            <Button
              onClick={() => navigate('/create')}
              className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-card"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Set
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <SupabaseTest />
        </div>

        {sets.length === 0 ? (
          <div className="text-center py-20 animate-slide-up">
            <div className="max-w-md mx-auto bg-gradient-card rounded-2xl p-12 shadow-card">
              <BookOpen className="h-20 w-20 mx-auto mb-6 text-primary" />
              <h3 className="text-2xl font-semibold mb-3 text-foreground">
                No study sets yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Create your first flashcard set and start learning smarter!
              </p>
              <Button
                onClick={() => navigate('/create')}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
            {sets.map((set) => (
              <SetCard key={set.id} set={set} onDelete={handleDeleteClick} />
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your study set
              <strong> "{setToDelete?.title}"</strong> and remove all {setToDelete?.cards.length} cards from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;
