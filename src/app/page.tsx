'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { RetrospectiveSession, SessionFormData, JoinSessionData } from '@/lib/types';
import { sessionStorage, generateSessionId, userStorage } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<SessionFormData>({
    title: '',
    facilitatorName: '',
    allowVoting: true,
    allowAnonymous: false,
    maxNotesPerPerson: 10,
    timerDuration: 60
  });

  const [joinForm, setJoinForm] = useState<JoinSessionData>({
    sessionId: '',
    participantName: ''
  });

  // Handle create session
  const handleCreateSession = async () => {
    if (!createForm.title.trim() || !createForm.facilitatorName.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      const sessionId = generateSessionId();
      const newSession: RetrospectiveSession = {
        id: sessionId,
        title: createForm.title.trim(),
        createdAt: new Date(),
        facilitator: createForm.facilitatorName.trim(),
        participants: [createForm.facilitatorName.trim()],
        notes: [],
        isActive: true,
        timerDuration: createForm.timerDuration,
        settings: {
          allowVoting: createForm.allowVoting,
          allowAnonymous: createForm.allowAnonymous,
          maxNotesPerPerson: createForm.maxNotesPerPerson,
          showAuthorNames: true
        }
      };

      // Save session
      sessionStorage.saveSession(newSession);
      
      // Set current user and add to user sessions
      userStorage.setCurrentUser(createForm.facilitatorName.trim());
      userStorage.addUserSession(createForm.facilitatorName.trim(), sessionId);

      // Navigate to the board
      router.push(`/board/${sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle join session
  const handleJoinSession = async () => {
    if (!joinForm.sessionId.trim() || !joinForm.participantName.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsJoining(true);

    try {
      const session = sessionStorage.getSession(joinForm.sessionId.trim().toUpperCase());
      
      if (!session) {
        alert('Session not found. Please check the session ID and try again.');
        return;
      }

      if (!session.isActive) {
        alert('This session is no longer active.');
        return;
      }

      // Add participant to session if not already added
      if (!session.participants.includes(joinForm.participantName.trim())) {
        session.participants.push(joinForm.participantName.trim());
        sessionStorage.saveSession(session);
      }

      // Set current user and add to user sessions
      userStorage.setCurrentUser(joinForm.participantName.trim());
      userStorage.addUserSession(joinForm.participantName.trim(), session.id);

      // Navigate to the board
      router.push(`/board/${session.id}`);
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Sprint Retrospective
          </h1>
          <p className="text-lg text-gray-600">
            Create or join a retrospective session to collaborate with your team
          </p>
        </div>

        {/* Main Card */}
        <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Get Started</CardTitle>
            <CardDescription>
              Choose to create a new session or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="create">Create Session</TabsTrigger>
                <TabsTrigger value="join">Join Session</TabsTrigger>
              </TabsList>

              {/* Create Session Tab */}
              <TabsContent value="create" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title *</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Sprint 23 Retrospective"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facilitator">Your Name (Facilitator) *</Label>
                  <Input
                    id="facilitator"
                    type="text"
                    placeholder="Enter your name"
                    value={createForm.facilitatorName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, facilitatorName: e.target.value }))}
                    className="transition-all focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voting">Enable Voting</Label>
                    <Switch
                      id="voting"
                      checked={createForm.allowVoting}
                      onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, allowVoting: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="anonymous">Allow Anonymous Notes</Label>
                    <Switch
                      id="anonymous"
                      checked={createForm.allowAnonymous}
                      onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, allowAnonymous: checked }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleCreateSession}
                  disabled={isCreating || !createForm.title.trim() || !createForm.facilitatorName.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5"
                >
                  {isCreating ? 'Creating Session...' : 'Create Session'}
                </Button>
              </TabsContent>

              {/* Join Session Tab */}
              <TabsContent value="join" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionId">Session ID *</Label>
                  <Input
                    id="sessionId"
                    type="text"
                    placeholder="Enter 9-character session ID"
                    value={joinForm.sessionId}
                    onChange={(e) => setJoinForm(prev => ({ ...prev, sessionId: e.target.value.toUpperCase() }))}
                    className="font-mono text-center tracking-wider transition-all focus:ring-2 focus:ring-green-500"
                    maxLength={9}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participantName">Your Name *</Label>
                  <Input
                    id="participantName"
                    type="text"
                    placeholder="Enter your name"
                    value={joinForm.participantName}
                    onChange={(e) => setJoinForm(prev => ({ ...prev, participantName: e.target.value }))}
                    className="transition-all focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <Button 
                  onClick={handleJoinSession}
                  disabled={isJoining || !joinForm.sessionId.trim() || !joinForm.participantName.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5"
                >
                  {isJoining ? 'Joining Session...' : 'Join Session'}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Sessions are stored locally in your browser</p>
        </div>
      </div>
    </div>
  );
}