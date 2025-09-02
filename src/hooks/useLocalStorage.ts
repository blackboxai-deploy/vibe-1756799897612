'use client';

import { useState } from 'react';
import { RetrospectiveSession } from '../lib/types';

// Custom hook for localStorage with TypeScript support
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Function to remove the item from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

// Hook for managing session storage specifically
export function useSessionStorage() {
  const [sessions, setSessions] = useLocalStorage<RetrospectiveSession[]>('retrospective-sessions', []);
  const [currentUser, setCurrentUser] = useLocalStorage<string>('retrospective-user', '');

  const addSession = (session: RetrospectiveSession) => {
    setSessions((prev: RetrospectiveSession[]) => [...prev, session]);
  };

  const updateSession = (sessionId: string, updates: Partial<RetrospectiveSession>) => {
    setSessions((prev: RetrospectiveSession[]) =>
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...updates }
          : session
      )
    );
  };

  const deleteSession = (sessionId: string) => {
    setSessions((prev: RetrospectiveSession[]) => prev.filter(session => session.id !== sessionId));
  };

  const getSession = (sessionId: string): RetrospectiveSession | undefined => {
    return sessions.find((session: RetrospectiveSession) => session.id === sessionId);
  };

  return {
    sessions,
    currentUser,
    setCurrentUser,
    addSession,
    updateSession,
    deleteSession,
    getSession
  };
}