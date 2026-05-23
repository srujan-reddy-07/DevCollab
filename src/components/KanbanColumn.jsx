import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

export function KanbanColumn({ id, title, tasks, onCardClick, onAddTaskClick, userRole }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id
  });

  // Check role restrictions: Viewers cannot add tasks
  const isViewer = userRole === 'Viewer';

  return (
    <div 
      ref={setNodeRef} 
      className="board-column animate-fade"
      style={{
        background: isOver ? 'rgba(139, 92, 246, 0.08)' : 'rgba(15, 23, 42, 0.4)',
        borderColor: isOver ? 'hsl(var(--primary) / 0.4)' : 'rgba(255, 255, 255, 0.04)',
        transition: 'all 0.2s ease-in-out',
        borderWidth: '1.5px',
        borderStyle: 'solid'
      }}
    >
      <div className="column-header">
        <h3 className="column-title">
          {title}
          <span className="column-count">{tasks.length}</span>
        </h3>
        
        {!isViewer && (
          <button 
            onClick={() => onAddTaskClick(id)} 
            className="glass-button" 
            style={{ padding: '0.25rem', borderRadius: '4px' }}
            title="Create Task"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <div className="task-list">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={() => onCardClick(task)} 
          />
        ))}
        {tasks.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1.5px dashed rgba(255,255,255,0.03)',
            borderRadius: '8px',
            color: 'hsl(var(--text-muted))',
            fontSize: '0.8rem',
            padding: '2rem 1rem',
            textAlign: 'center'
          }}>
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
