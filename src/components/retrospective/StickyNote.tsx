'use client';

import { useState, useRef, useEffect } from 'react';
import { StickyNote as StickyNoteType } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface StickyNoteProps {
  note: StickyNoteType;
  canEdit: boolean;
  canVote: boolean;
  showAuthor: boolean;
  isActive: boolean;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onVote: () => void;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent) => void;
  onDragEnd?: (event: React.DragEvent) => void;
}

export function StickyNote({
  note,
  canEdit,
  canVote,
  showAuthor,
  isActive,
  onUpdate,
  onDelete,
  onVote,
  draggable = false,
  onDragStart,
  onDragEnd
}: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // Handle saving edits
  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate(editContent.trim());
    }
    setIsEditing(false);
  };

  // Handle canceling edits
  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  // Handle key presses in edit mode
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  };

  // Get note color based on category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'went-well':
        return 'border-green-200 bg-green-50 hover:bg-green-100';
      case 'could-be-better':
        return 'border-orange-200 bg-orange-50 hover:bg-orange-100';
      case 'action-items':
        return 'border-blue-200 bg-blue-50 hover:bg-blue-100';
      default:
        return 'border-gray-200 bg-gray-50 hover:bg-gray-100';
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <Card 
      className={`transition-all duration-200 cursor-grab active:cursor-grabbing hover:shadow-md ${
        getCategoryColor(note.category)
      } ${draggable ? 'hover:scale-105' : ''}`}
      draggable={draggable && isActive && !isEditing}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <CardContent className="p-4 space-y-3">
        {/* Note Content */}
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your note..."
              className="min-h-20 resize-none border-none bg-transparent p-0 focus-visible:ring-0 text-sm"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {editContent.length}/500 characters
              </span>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCancel}
                  variant="ghost" 
                  size="sm"
                  className="h-7 px-2 text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={!editContent.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`text-sm whitespace-pre-wrap ${
              canEdit && isActive ? 'cursor-text' : ''
            }`}
            onClick={() => {
              if (canEdit && isActive && !draggable) {
                setIsEditing(true);
              }
            }}
          >
            {note.content}
          </div>
        )}

        {/* Note Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {/* Author and timestamp */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {showAuthor && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  {note.author}
                </Badge>
              )}
              <span>{formatTime(note.createdAt)}</span>
              {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                <span className="text-gray-400">(edited)</span>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-1">
              {/* Vote Button */}
              {canVote && isActive && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote();
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:bg-white/80"
                >
                  👍 {note.votes > 0 && note.votes}
                </Button>
              )}

              {/* Edit Button */}
              {canEdit && isActive && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:bg-white/80"
                >
                  Edit
                </Button>
              )}

              {/* Delete Button */}
              {canEdit && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Note</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this note? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={onDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          )}
        </div>

        {/* Votes Display */}
        {note.votes > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              {Array.from({ length: Math.min(note.votes, 5) }).map((_, i) => (
                <div 
                  key={i}
                  className="w-5 h-5 bg-yellow-400 border border-yellow-500 rounded-full flex items-center justify-center text-xs"
                >
                  👍
                </div>
              ))}
              {note.votes > 5 && (
                <div className="w-5 h-5 bg-gray-200 border border-gray-300 rounded-full flex items-center justify-center text-xs font-semibold">
                  +{note.votes - 5}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}