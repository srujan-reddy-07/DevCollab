import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useStore } from '../store/store';
import { Calendar, MessageSquare, AlertCircle } from 'lucide-react';

export function TaskCard({ task, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task }
  });

  const getUserAvatar = useStore(state => state.getUserAvatar);
  const getUserName = useStore(state => state.getUserName);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
    cursor: 'grabbing'
  } : undefined;

  const dateFormatted = task.dueDate 
    ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })
    : null;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="glass-card task-card animate-fade"
      onClick={onClick}
    >
      <div 
        {...listeners} 
        {...attributes}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          cursor: 'grab'
        }}
      >
        {/* Card Header Tags */}
        <div className="task-tags" onClick={(e) => e.stopPropagation()}>
          {task.tags && task.tags.map((tag, i) => (
            <span key={i} className="task-tag">{tag}</span>
          ))}
          <span className={`priority-badge ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        </div>

        {/* Task Title */}
        <h4 className="task-title-text">{task.title}</h4>

        {/* Task Meta / Footer */}
        <div className="task-meta" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {dateFormatted && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                <Calendar size={12} />
                {dateFormatted}
              </span>
            )}
            {task.comments && task.comments.length > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }} title="Comments">
                <MessageSquare size={12} />
                {task.comments.length}
              </span>
            )}
          </div>

          {/* Assignee Avatar */}
          {task.assigneeId ? (
            <div 
              className="avatar" 
              title={`Assigned to ${getUserName(task.assigneeId)}`}
              style={{ width: '22px', height: '22px', fontSize: '0.6rem' }}
            >
              {getUserAvatar(task.assigneeId)}
            </div>
          ) : (
            <div 
              className="avatar" 
              title="Unassigned"
              style={{ width: '22px', height: '22px', fontSize: '0.6rem', background: 'rgba(255,255,255,0.05)', color: 'hsl(var(--text-muted))' }}
            >
              --
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
