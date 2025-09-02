'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface AddNoteFormProps {
  onAddNote: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxNotes?: number;
  currentNoteCount?: number;
}

export function AddNoteForm({ 
  onAddNote, 
  placeholder = "Enter your note...", 
  disabled = false,
  maxNotes = 10,
  currentNoteCount = 0
}: AddNoteFormProps) {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAddNote(content.trim());
      setContent('');
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSubmit(event as any);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setContent('');
      setIsExpanded(false);
    }
  };

  const canAddMore = currentNoteCount < maxNotes;
  const isFormDisabled = disabled || !canAddMore;

  return (
    <Card className="border-dashed border-2 border-gray-300 bg-white/60 hover:bg-white/80 transition-all duration-200">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder={isFormDisabled ? 
              (disabled ? "Session ended" : `Maximum ${maxNotes} notes reached`) : 
              placeholder
            }
            disabled={isFormDisabled}
            className={`min-h-12 resize-none border-none bg-transparent p-0 placeholder:text-gray-400 focus-visible:ring-0 text-sm ${
              !isExpanded ? 'min-h-8' : 'min-h-20'
            } transition-all duration-200`}
            maxLength={500}
          />
          
          {isExpanded && (
            <div className="flex justify-between items-center animate-in fade-in-50 slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{content.length}/500 characters</span>
                {!canAddMore && (
                  <span className="text-orange-600 font-medium">
                    {currentNoteCount}/{maxNotes} notes used
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setContent('');
                    setIsExpanded(false);
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!content.trim() || isFormDisabled}
                  size="sm"
                  className="h-8 px-3 text-xs"
                >
                  Add Note
                </Button>
              </div>
            </div>
          )}
          
          {!isExpanded && !isFormDisabled && (
            <div className="text-center">
              <Button
                type="button"
                onClick={() => setIsExpanded(true)}
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-gray-500 hover:text-gray-700"
              >
                Click to add a note
              </Button>
            </div>
          )}

          {!canAddMore && (
            <div className="text-center text-xs text-orange-600 bg-orange-50 py-2 px-3 rounded">
              You've reached the maximum of {maxNotes} notes
            </div>
          )}
        </form>

        {/* Keyboard shortcuts hint */}
        {isExpanded && (
          <div className="mt-2 text-xs text-gray-400 text-center">
            Press Ctrl+Enter to save, Esc to cancel
          </div>
        )}
      </CardContent>
    </Card>
  );
}