// Local storage utilities for session persistence

import { RetrospectiveSession, StickyNote } from './types';

const STORAGE_KEYS = {
  SESSIONS: 'retrospective-sessions',
  CURRENT_USER: 'retrospective-user',
  USER_SESSIONS: 'user-sessions'
} as const;

// Session storage functions
export const sessionStorage = {
  // Get all sessions
  getAllSessions(): RetrospectiveSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) return [];
      const sessions = JSON.parse(data);
      // Convert date strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        timerStarted: session.timerStarted ? new Date(session.timerStarted) : undefined,
        notes: session.notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }))
      }));
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  },

  // Get session by ID
  getSession(sessionId: string): RetrospectiveSession | null {
    const sessions = this.getAllSessions();
    return sessions.find(session => session.id === sessionId) || null;
  },

  // Save session
  saveSession(session: RetrospectiveSession): void {
    try {
      const sessions = this.getAllSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving session:', error);
      throw new Error('Failed to save session');
    }
  },

  // Delete session
  deleteSession(sessionId: string): void {
    try {
      const sessions = this.getAllSessions();
      const filtered = sessions.filter(session => session.id !== sessionId);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting session:', error);
      throw new Error('Failed to delete session');
    }
  },

  // Update session notes
  updateSessionNotes(sessionId: string, notes: StickyNote[]): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.notes = notes;
      this.saveSession(session);
    }
  },

  // Add note to session
  addNoteToSession(sessionId: string, note: StickyNote): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.notes.push(note);
      this.saveSession(session);
    }
  },

  // Update note in session
  updateNoteInSession(sessionId: string, noteId: string, updates: Partial<StickyNote>): void {
    const session = this.getSession(sessionId);
    if (session) {
      const noteIndex = session.notes.findIndex(note => note.id === noteId);
      if (noteIndex >= 0) {
        session.notes[noteIndex] = { 
          ...session.notes[noteIndex], 
          ...updates, 
          updatedAt: new Date() 
        };
        this.saveSession(session);
      }
    }
  },

  // Remove note from session
  removeNoteFromSession(sessionId: string, noteId: string): void {
    const session = this.getSession(sessionId);
    if (session) {
      session.notes = session.notes.filter(note => note.id !== noteId);
      this.saveSession(session);
    }
  }
};

// User storage functions
export const userStorage = {
  // Get current user
  getCurrentUser(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Set current user
  setCurrentUser(userName: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userName);
  },

  // Get user's sessions
  getUserSessions(userName: string): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_SESSIONS);
      if (!data) return [];
      const userSessions = JSON.parse(data);
      return userSessions[userName] || [];
    } catch (error) {
      console.error('Error loading user sessions:', error);
      return [];
    }
  },

  // Add session to user's list
  addUserSession(userName: string, sessionId: string): void {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_SESSIONS);
      const userSessions = data ? JSON.parse(data) : {};
      
      if (!userSessions[userName]) {
        userSessions[userName] = [];
      }
      
      if (!userSessions[userName].includes(sessionId)) {
        userSessions[userName].push(sessionId);
        localStorage.setItem(STORAGE_KEYS.USER_SESSIONS, JSON.stringify(userSessions));
      }
    } catch (error) {
      console.error('Error adding user session:', error);
    }
  }
};

// Utility functions
export const generateSessionId = (): string => {
  return Math.random().toString(36).substr(2, 9).toUpperCase();
};

export const generateNoteId = (): string => {
  return `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Export session data
export const exportSessionData = (session: RetrospectiveSession) => {
  const exportData = {
    session,
    exportedAt: new Date(),
    summary: {
      totalNotes: session.notes.length,
      notesByCategory: {
        'went-well': session.notes.filter(n => n.category === 'went-well').length,
        'could-be-better': session.notes.filter(n => n.category === 'could-be-better').length,
        'action-items': session.notes.filter(n => n.category === 'action-items').length
      },
      topVotedNotes: session.notes
        .filter(n => n.votes > 0)
        .sort((a, b) => b.votes - a.votes)
        .slice(0, 10)
    }
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `retrospective-${session.title}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};