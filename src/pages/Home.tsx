import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SetCard } from '@/components/SetCard';
import { QRCode } from '@/components/QRCode';
import { SupabaseTest } from '@/components/SupabaseTest';
import { DebugInfo } from '@/components/DebugInfo';
import { storage } from '@/lib/storage';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { useOfflineSync } from '@/hooks/useOfflineSync';
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [setToDelete, setSetToDelete] = useState<FlashcardSet | null>(null);
  const { saveOfflineSets } = useOfflineStorage();
  const { sets, isLoading, isOnline, refreshSets } = useOfflineSync();
  
  // Get the current URL for QR code
  const currentUrl = window.location.href.replace('localhost', window.location.hostname);

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
        // Refresh sets to get updated list
        await refreshSets();
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-3">
              <QRCode url={currentUrl} />
            <Button
              onClick={async () => {
                try {
                  // Force refresh from Supabase
                  const freshSets = await storage.getSets();
                  saveOfflineSets(freshSets);
                  await refreshSets();
                  toast({
                    title: "Data synced!",
                    description: `Refreshed ${freshSets.length} quiz sets from database`,
                  });
                } catch (error) {
                  toast({
                    title: "Sync failed",
                    description: "Could not refresh data from database",
                    variant: "destructive"
                  });
                }
              }}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-500/10 text-sm sm:text-base"
              size="lg"
            >
              <Download className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Force Sync</span>
              <span className="sm:hidden">Sync</span>
            </Button>
            </div>
            <Button
              onClick={() => navigate('/create')}
              className="bg-gradient-primary hover:opacity-90 transition-opacity shadow-card text-sm sm:text-base"
              size="lg"
            >
              <Plus className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Create New Set</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <SupabaseTest />
          {/* Connection Status */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-muted-foreground">
                {isOnline ? 'Online - Shared database (all users)' : 'Offline - Local data only'}
              </span>
            </div>
            {isLoading && (
              <div className="mt-2 text-xs text-muted-foreground">
                Loading study sets...
              </div>
            )}
            <div className="mt-2 text-xs text-muted-foreground">
              Found {sets.length} study sets
            </div>
          </div>
          
          {/* Debug Information */}
          <div className="mt-6">
            <DebugInfo />
          </div>
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
