import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [envVars, setEnvVars] = useState<{url: string, key: string}>({url: '', key: ''});

  useEffect(() => {
    // Check environment variables
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    setEnvVars({
      url: url || 'NOT SET',
      key: key ? `${key.substring(0, 20)}...` : 'NOT SET'
    });

    // Test connection
    const testConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('flashcard_sets')
          .select('count')
          .limit(1);

        if (error) {
          setConnectionStatus('error');
          setErrorMessage(error.message);
        } else {
          setConnectionStatus('connected');
        }
      } catch (err) {
        setConnectionStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testing connection...';
      case 'connected':
        return 'Connected to Supabase!';
      case 'error':
        return 'Connection failed';
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          {getStatusIcon()}
          Supabase Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div><strong>Status:</strong> {getStatusText()}</div>
          <div><strong>URL:</strong> {envVars.url}</div>
          <div><strong>Key:</strong> {envVars.key}</div>
        </div>
        
        {connectionStatus === 'error' && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}
        
        {connectionStatus === 'connected' && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            ✅ Supabase is working correctly! Your study sets should load now.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
