'use client';

import { useState } from 'react';
import { RetrospectiveSession } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { exportSessionData } from '@/lib/storage';

interface SessionHeaderProps {
  session: RetrospectiveSession;
  currentUser: string;
  onSessionUpdate: (session: RetrospectiveSession) => void;
  onLeaveSession: () => void;
}

export function SessionHeader({ 
  session, 
  currentUser, 
  onSessionUpdate, 
  onLeaveSession 
}: SessionHeaderProps) {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(session.timerDuration ? session.timerDuration * 60 : 3600); // in seconds

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle timer start/stop
  const toggleTimer = () => {
    if (timerRunning) {
      // Stop timer
      setTimerRunning(false);
      onSessionUpdate({
        ...session,
        timerStarted: undefined
      });
    } else {
      // Start timer
      setTimerRunning(true);
      onSessionUpdate({
        ...session,
        timerStarted: new Date()
      });
      
      // Start countdown
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Handle session end
  const handleEndSession = () => {
    const updatedSession = {
      ...session,
      isActive: false,
      timerStarted: undefined
    };
    onSessionUpdate(updatedSession);
  };

  // Handle export
  const handleExport = () => {
    exportSessionData(session);
  };

  const isFacilitator = currentUser === session.facilitator;
  const totalNotes = session.notes.length;
  const notesByCategory = {
    'went-well': session.notes.filter(n => n.category === 'went-well').length,
    'could-be-better': session.notes.filter(n => n.category === 'could-be-better').length,
    'action-items': session.notes.filter(n => n.category === 'action-items').length
  };

  return (
    <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <Card className="border-0 shadow-sm bg-transparent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              {/* Session Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
                  <Badge variant="outline" className="text-xs font-mono">
                    ID: {session.id}
                  </Badge>
                  {session.isActive ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      Ended
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Facilitator: <strong>{session.facilitator}</strong></span>
                  <span>Participants: <strong>{session.participants.length}</strong></span>
                  <span>Notes: <strong>{totalNotes}</strong></span>
                  {session.settings.allowVoting && (
                    <span>Voting: <strong>Enabled</strong></span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Timer */}
                {session.timerDuration && (
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                      {formatTime(timeRemaining)}
                    </div>
                    {isFacilitator && (
                      <Button
                        onClick={toggleTimer}
                        variant={timerRunning ? "destructive" : "default"}
                        size="sm"
                      >
                        {timerRunning ? 'Stop' : 'Start'}
                      </Button>
                    )}
                  </div>
                )}

                {/* Export */}
                <Button 
                  onClick={handleExport}
                  variant="outline" 
                  size="sm"
                >
                  Export
                </Button>

                {/* Session Info Dialog */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Session Information</DialogTitle>
                      <DialogDescription>
                        Details about this retrospective session
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Participants ({session.participants.length})</h4>
                        <div className="space-y-1">
                          {session.participants.map((participant, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Badge variant={participant === session.facilitator ? "default" : "outline"}>
                                {participant}
                              </Badge>
                              {participant === session.facilitator && (
                                <span className="text-xs text-gray-500">(Facilitator)</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Notes Summary</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-green-50 rounded border">
                            <div className="font-semibold text-green-700">{notesByCategory['went-well']}</div>
                            <div className="text-xs text-green-600">Went Well</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded border">
                            <div className="font-semibold text-orange-700">{notesByCategory['could-be-better']}</div>
                            <div className="text-xs text-orange-600">Could be Better</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded border">
                            <div className="font-semibold text-blue-700">{notesByCategory['action-items']}</div>
                            <div className="text-xs text-blue-600">Action Items</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Settings</h4>
                        <div className="space-y-1 text-sm">
                          <div>Voting: {session.settings.allowVoting ? 'Enabled' : 'Disabled'}</div>
                          <div>Anonymous Notes: {session.settings.allowAnonymous ? 'Allowed' : 'Not Allowed'}</div>
                          <div>Max Notes per Person: {session.settings.maxNotesPerPerson}</div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* End Session (Facilitator only) */}
                {isFacilitator && session.isActive && (
                  <Button 
                    onClick={handleEndSession}
                    variant="destructive" 
                    size="sm"
                  >
                    End Session
                  </Button>
                )}

                {/* Leave Session */}
                <Button 
                  onClick={onLeaveSession}
                  variant="ghost" 
                  size="sm"
                >
                  Leave
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}