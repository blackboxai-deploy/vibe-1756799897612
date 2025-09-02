'use client';

import { RetrospectiveSession, StickyNote, NoteCategory } from '@/lib/types';
import { Column } from './Column';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { generateNoteId } from '@/lib/storage';
import { COLUMN_CONFIGS } from '@/lib/types';

interface RetrospectiveBoardProps {
  session: RetrospectiveSession;
  currentUser: string;
  onSessionUpdate: (session: RetrospectiveSession) => void;
}

export function RetrospectiveBoard({ 
  session, 
  currentUser, 
  onSessionUpdate 
}: RetrospectiveBoardProps) {
  const { getDragHandlers, getDropHandlers, isDropZone, isDragging } = useDragAndDrop();

  // Get notes by category
  const getNotesByCategory = (category: NoteCategory): StickyNote[] => {
    return session.notes.filter(note => note.category === category);
  };

  // Handle adding a new note
  const handleAddNote = (category: NoteCategory, content: string) => {
    if (!content.trim()) return;

    // Check if user has reached max notes limit
    const userNotes = session.notes.filter(note => note.author === currentUser);
    if (userNotes.length >= session.settings.maxNotesPerPerson) {
      alert(`You can only add up to ${session.settings.maxNotesPerPerson} notes.`);
      return;
    }

    const newNote: StickyNote = {
      id: generateNoteId(),
      content: content.trim(),
      author: session.settings.allowAnonymous ? 'Anonymous' : currentUser,
      category,
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0
    };

    const updatedSession = {
      ...session,
      notes: [...session.notes, newNote]
    };

    onSessionUpdate(updatedSession);
  };

  // Handle updating a note
  const handleUpdateNote = (noteId: string, content: string) => {
    if (!content.trim()) {
      handleDeleteNote(noteId);
      return;
    }

    const updatedSession = {
      ...session,
      notes: session.notes.map(note =>
        note.id === noteId
          ? { ...note, content: content.trim(), updatedAt: new Date() }
          : note
      )
    };

    onSessionUpdate(updatedSession);
  };

  // Handle deleting a note
  const handleDeleteNote = (noteId: string) => {
    const updatedSession = {
      ...session,
      notes: session.notes.filter(note => note.id !== noteId)
    };

    onSessionUpdate(updatedSession);
  };

  // Handle moving a note between categories
  const handleMoveNote = (note: StickyNote, newCategory: NoteCategory) => {
    const updatedSession = {
      ...session,
      notes: session.notes.map(n =>
        n.id === note.id
          ? { ...n, category: newCategory, updatedAt: new Date() }
          : n
      )
    };

    onSessionUpdate(updatedSession);
  };

  // Handle voting on a note
  const handleVoteNote = (noteId: string) => {
    if (!session.settings.allowVoting) return;

    const updatedSession = {
      ...session,
      notes: session.notes.map(note =>
        note.id === noteId
          ? { ...note, votes: note.votes + 1 }
          : note
      )
    };

    onSessionUpdate(updatedSession);
  };

  // Check if user can edit a note
  const canEditNote = (note: StickyNote): boolean => {
    return note.author === currentUser || currentUser === session.facilitator;
  };

  const columns: NoteCategory[] = ['went-well', 'could-be-better', 'action-items'];

  return (
    <div className="space-y-6">
      {/* Board Instructions */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-gray-800">
          What went well? What could be better? What actions should we take?
        </h2>
        <p className="text-gray-600">
          Add your thoughts using the forms below. {isDragging() && 'Drag notes between columns to reorganize them.'}
        </p>
      </div>

      {/* Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((category) => (
          <div
            key={category}
            className={`transition-all duration-200 ${
              isDropZone(category) 
                ? 'scale-105 ring-2 ring-blue-400 ring-opacity-50' 
                : ''
            }`}
            {...getDropHandlers(category, handleMoveNote)}
          >
            <Column
              category={category}
              config={COLUMN_CONFIGS[category]}
              notes={getNotesByCategory(category)}
              currentUser={currentUser}
              session={session}
              onAddNote={(content) => handleAddNote(category, content)}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
              onVoteNote={handleVoteNote}
              canEditNote={canEditNote}
              getDragHandlers={getDragHandlers}
              isDropZone={isDropZone(category)}
            />
          </div>
        ))}
      </div>

      {/* Board Statistics */}
      <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{session.notes.length}</div>
            <div className="text-sm text-gray-600">Total Notes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{getNotesByCategory('went-well').length}</div>
            <div className="text-sm text-gray-600">Went Well</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">{getNotesByCategory('could-be-better').length}</div>
            <div className="text-sm text-gray-600">Could be Better</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{getNotesByCategory('action-items').length}</div>
            <div className="text-sm text-gray-600">Action Items</div>
          </div>
        </div>
        
        {session.settings.allowVoting && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-800">
                Total Votes: {session.notes.reduce((sum, note) => sum + note.votes, 0)}
              </div>
              <div className="text-sm text-gray-600">
                Click the vote button on notes to prioritize them
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}