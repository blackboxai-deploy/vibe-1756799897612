// Core data types for the retrospective board application

export type NoteCategory = 'went-well' | 'could-be-better' | 'action-items';

export interface StickyNote {
  id: string;
  content: string;
  author: string;
  category: NoteCategory;
  createdAt: Date;
  updatedAt: Date;
  votes: number;
  color?: string;
}

export interface RetrospectiveSession {
  id: string;
  title: string;
  createdAt: Date;
  facilitator: string;
  participants: string[];
  notes: StickyNote[];
  isActive: boolean;
  timerDuration?: number; // in minutes
  timerStarted?: Date;
  settings: SessionSettings;
}

export interface SessionSettings {
  allowVoting: boolean;
  allowAnonymous: boolean;
  maxNotesPerPerson: number;
  showAuthorNames: boolean;
}

export interface ColumnConfig {
  id: NoteCategory;
  title: string;
  color: string;
  bgColor: string;
  description: string;
}

export interface DragState {
  isDragging: boolean;
  draggedNote: StickyNote | null;
  dropZone: NoteCategory | null;
}

export interface SessionFormData {
  title: string;
  facilitatorName: string;
  allowVoting: boolean;
  allowAnonymous: boolean;
  maxNotesPerPerson: number;
  timerDuration: number;
}

export interface JoinSessionData {
  sessionId: string;
  participantName: string;
}

export interface ExportData {
  session: RetrospectiveSession;
  exportedAt: Date;
  summary: {
    totalNotes: number;
    notesByCategory: Record<NoteCategory, number>;
    topVotedNotes: StickyNote[];
  };
}

// Column configurations
export const COLUMN_CONFIGS: Record<NoteCategory, ColumnConfig> = {
  'went-well': {
    id: 'went-well',
    title: 'Went Well',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    description: 'What went well in this sprint?'
  },
  'could-be-better': {
    id: 'could-be-better',
    title: 'Could be Better',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'What could we improve?'
  },
  'action-items': {
    id: 'action-items',
    title: 'Action Items',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'What actions should we take?'
  }
};

// Utility type for form validation
export interface ValidationError {
  field: string;
  message: string;
}

// Event types for board interactions
export interface BoardEvent {
  type: 'note-added' | 'note-updated' | 'note-deleted' | 'note-moved' | 'vote-added' | 'timer-started' | 'timer-stopped';
  noteId?: string;
  data?: any;
  timestamp: Date;
  userId: string;
}