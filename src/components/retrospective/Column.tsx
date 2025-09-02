'use client';

import { RetrospectiveSession, StickyNote, ColumnConfig } from '@/lib/types';
import { StickyNote as StickyNoteComponent } from './StickyNote';
import { AddNoteForm } from './AddNoteForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ColumnProps {
  category: string;
  config: ColumnConfig;
  notes: StickyNote[];
  currentUser: string;
  session: RetrospectiveSession;
  onAddNote: (content: string) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
  onVoteNote: (noteId: string) => void;
  canEditNote: (note: StickyNote) => boolean;
  getDragHandlers: (note: StickyNote) => any;
  isDropZone: boolean;
}

export function Column({
  config,
  notes,
  currentUser,
  session,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onVoteNote,
  canEditNote,
  getDragHandlers,
  isDropZone
}: ColumnProps) {
  // Sort notes: voted notes first (if voting enabled), then by creation time
  const sortedNotes = [...notes].sort((a, b) => {
    if (session.settings.allowVoting && a.votes !== b.votes) {
      return b.votes - a.votes; // Higher votes first
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const totalVotes = notes.reduce((sum, note) => sum + note.votes, 0);

  return (
    <Card 
      className={`h-full transition-all duration-200 ${
        isDropZone 
          ? 'ring-2 ring-blue-400 ring-opacity-50 shadow-lg' 
          : 'hover:shadow-md'
      } ${config.bgColor} border-2`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg font-bold ${config.color}`}>
            {config.title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {notes.length}
            </Badge>
            {session.settings.allowVoting && totalVotes > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalVotes} votes
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-sm">
          {config.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Note Form */}
        <AddNoteForm 
          onAddNote={onAddNote}
          placeholder={`What ${config.title.toLowerCase()}?`}
          disabled={!session.isActive}
          maxNotes={session.settings.maxNotesPerPerson}
          currentNoteCount={session.notes.filter(note => note.author === currentUser).length}
        />

        {/* Drop Zone Indicator */}
        {isDropZone && (
          <div className="border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-blue-600 font-medium">Drop note here</p>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3 min-h-32">
          {sortedNotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No notes yet</p>
              <p className="text-xs">Add the first note above</p>
            </div>
          ) : (
            sortedNotes.map((note) => (
              <StickyNoteComponent
                key={note.id}
                note={note}
                canEdit={canEditNote(note)}
                canVote={session.settings.allowVoting}
                showAuthor={session.settings.showAuthorNames && !session.settings.allowAnonymous}
                isActive={session.isActive}
                onUpdate={(content) => onUpdateNote(note.id, content)}
                onDelete={() => onDeleteNote(note.id)}
                onVote={() => onVoteNote(note.id)}
                {...getDragHandlers(note)}
              />
            ))
          )}
        </div>

        {/* Column Footer */}
        {notes.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
              {session.settings.allowVoting && (
                <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}