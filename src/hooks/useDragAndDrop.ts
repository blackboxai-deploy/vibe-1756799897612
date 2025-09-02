'use client';

import { useState, useCallback } from 'react';
import { StickyNote, NoteCategory, DragState } from '../lib/types';

export function useDragAndDrop() {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedNote: null,
    dropZone: null
  });

  // Handle drag start
  const handleDragStart = useCallback((note: StickyNote, event: React.DragEvent) => {
    setDragState({
      isDragging: true,
      draggedNote: note,
      dropZone: null
    });
    
    // Set drag data
    event.dataTransfer.setData('application/json', JSON.stringify(note));
    event.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = '0.5';
    }
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event: React.DragEvent) => {
    setDragState({
      isDragging: false,
      draggedNote: null,
      dropZone: null
    });
    
    // Reset visual feedback
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.style.opacity = '1';
    }
  }, []);

  // Handle drag over (for drop zones)
  const handleDragOver = useCallback((category: NoteCategory) => (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    setDragState(prev => ({
      ...prev,
      dropZone: category
    }));
  }, []);

  // Handle drag leave (for drop zones)
  const handleDragLeave = useCallback((event: React.DragEvent) => {
    // Only clear drop zone if we're actually leaving the drop zone
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragState(prev => ({
        ...prev,
        dropZone: null
      }));
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    (category: NoteCategory, onNoteMoved: (note: StickyNote, newCategory: NoteCategory) => void) =>
    (event: React.DragEvent) => {
      event.preventDefault();
      
      try {
        const noteData = event.dataTransfer.getData('application/json');
        const note: StickyNote = JSON.parse(noteData);
        
        // Only move if the category is different
        if (note.category !== category) {
          onNoteMoved(note, category);
        }
        
        setDragState({
          isDragging: false,
          draggedNote: null,
          dropZone: null
        });
      } catch (error) {
        console.error('Error handling drop:', error);
        setDragState({
          isDragging: false,
          draggedNote: null,
          dropZone: null
        });
      }
    },
    []
  );

  // Get drag handlers for draggable items
  const getDragHandlers = useCallback((note: StickyNote) => ({
    draggable: true,
    onDragStart: (event: React.DragEvent) => handleDragStart(note, event),
    onDragEnd: handleDragEnd
  }), [handleDragStart, handleDragEnd]);

  // Get drop handlers for drop zones
  const getDropHandlers = useCallback((
    category: NoteCategory, 
    onNoteMoved: (note: StickyNote, newCategory: NoteCategory) => void
  ) => ({
    onDragOver: handleDragOver(category),
    onDragLeave: handleDragLeave,
    onDrop: handleDrop(category, onNoteMoved)
  }), [handleDragOver, handleDragLeave, handleDrop]);

  // Check if a category is currently a drop zone
  const isDropZone = useCallback((category: NoteCategory) => {
    return dragState.dropZone === category;
  }, [dragState.dropZone]);

  // Check if currently dragging
  const isDragging = useCallback(() => {
    return dragState.isDragging;
  }, [dragState.isDragging]);

  // Get the currently dragged note
  const getDraggedNote = useCallback(() => {
    return dragState.draggedNote;
  }, [dragState.draggedNote]);

  return {
    dragState,
    getDragHandlers,
    getDropHandlers,
    isDropZone,
    isDragging,
    getDraggedNote
  };
}