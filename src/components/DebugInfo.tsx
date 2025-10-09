import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { useOfflineStorage } from '@/hooks/useOfflineStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, HardDrive } from 'lucide-react';

export const DebugInfo = () => {
  const [supabaseData, setSupabaseData] = useState<any[]>([]);
  const [localStorageData, setLocalStorageData] = useState<any[]>([]);
  const [offlineData, setOfflineData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { getOfflineSets } = useOfflineStorage();

  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      // Check Supabase data
      console.log('🔍 Checking Supabase data...');
      const supabaseSets = await storage.getSets();
      setSupabaseData(supabaseSets);
      console.log('📊 Supabase sets:', supabaseSets);

      // Check localStorage data
      console.log('🔍 Checking localStorage data...');
      const localSets = storage.getSetsFromLocalStorage();
      setLocalStorageData(localSets);
      console.log('💾 localStorage sets:', localSets);

      // Check offline storage
      console.log('🔍 Checking offline storage...');
      const offlineSets = getOfflineSets();
      setOfflineData(offlineSets);
      console.log('📱 Offline sets:', offlineSets);

    } catch (error) {
      console.error('❌ Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Debug Information - Quiz Data Sources
        </CardTitle>
        <Button 
          onClick={refreshData} 
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Supabase Data */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-green-600 mb-2 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Supabase (Shared Database) - {supabaseData.length} sets
          </h3>
          {supabaseData.length > 0 ? (
            <div className="space-y-2">
              {supabaseData.map((set, index) => (
                <div key={set.id || index} className="text-sm bg-green-50 p-2 rounded">
                  <strong>{set.title}</strong> - {set.cards?.length || 0} cards
                  <br />
                  <span className="text-gray-500">ID: {set.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data found in Supabase</p>
          )}
        </div>

        {/* localStorage Data */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-blue-600 mb-2 flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            localStorage (Fallback) - {localStorageData.length} sets
          </h3>
          {localStorageData.length > 0 ? (
            <div className="space-y-2">
              {localStorageData.map((set, index) => (
                <div key={set.id || index} className="text-sm bg-blue-50 p-2 rounded">
                  <strong>{set.title}</strong> - {set.cards?.length || 0} cards
                  <br />
                  <span className="text-gray-500">ID: {set.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data found in localStorage</p>
          )}
        </div>

        {/* Offline Storage Data */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold text-purple-600 mb-2 flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            Offline Storage (PWA) - {offlineData.length} sets
          </h3>
          {offlineData.length > 0 ? (
            <div className="space-y-2">
              {offlineData.map((set, index) => (
                <div key={set.id || index} className="text-sm bg-purple-50 p-2 rounded">
                  <strong>{set.title}</strong> - {set.cards?.length || 0} cards
                  <br />
                  <span className="text-gray-500">ID: {set.id}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data found in offline storage</p>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🔧 Troubleshooting:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• If Supabase is empty but localStorage has data, there's a sync issue</li>
            <li>• If all sources are empty, your quiz data might be lost</li>
            <li>• Check browser console (F12) for error messages</li>
            <li>• Try refreshing the page or clearing browser cache</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
