'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RetrospectiveSession } from '@/lib/types';
import { sessionStorage, userStorage } from '@/lib/storage';
import { RetrospectiveBoard } from '@/components/retrospective/RetrospectiveBoard';
import { SessionHeader } from '@/components/retrospective/SessionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  
  const [session, setSession] = useState<RetrospectiveSession | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session data
  useEffect(() => {
    const loadSession = () => {
      try {
        const sessionData = sessionStorage.getSession(sessionId);
        const userData = userStorage.getCurrentUser();

        if (!sessionData) {
          setError('Session not found');
          return;
        }

        if (!sessionData.isActive) {
          setError('This session is no longer active');
          return;
        }

        if (!userData) {
          setError('Please join the session first');
          return;
        }

        setSession(sessionData);
        setCurrentUser(userData);
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  // Update session data
  const updateSession = (updatedSession: RetrospectiveSession) => {
    setSession(updatedSession);
    sessionStorage.saveSession(updatedSession);
  };

  // Handle going back to home
  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Session Error</CardTitle>
            <CardDescription>
              {error || 'Unable to access this session'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              {error === 'Session not found' 
                ? 'The session ID you\'re looking for doesn\'t exist or has been deleted.'
                : error === 'This session is no longer active'
                ? 'This retrospective session has ended.'
                : 'You need to join this session before you can access the board.'
              }
            </p>
            <Button onClick={handleGoHome} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Session Header */}
      <SessionHeader 
        session={session} 
        currentUser={currentUser}
        onSessionUpdate={updateSession}
        onLeaveSession={handleGoHome}
      />
      
      {/* Main Retrospective Board */}
      <div className="container mx-auto px-4 py-6">
        <RetrospectiveBoard 
          session={session}
          currentUser={currentUser}
          onSessionUpdate={updateSession}
        />
      </div>
    </div>
  );
}