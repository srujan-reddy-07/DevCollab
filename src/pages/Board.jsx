import React, { useState } from 'react';
import { useStore } from '../store/store';
import { usePresence } from '../hooks/usePresence';
import { KanbanColumn } from '../components/KanbanColumn';
import { TaskDetail } from '../components/TaskDetail';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { LayoutGrid, ClipboardList, CalendarDays, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Board() {
  const currentProjectId = useStore(state => state.currentProjectId);
  const currentUser = useStore(state => state.currentUser);
  const members = useStore(state => state.members);
  const tasks = useStore(state => state.tasks);
  const moveTask = useStore(state => state.moveTask);

  const activeUserRole = members.find(m => m.id === currentUser)?.role || 'Viewer';
  const isViewer = activeUserRole === 'Viewer';

  // Details Modal States
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialStatus, setModalInitialStatus] = useState('To Do');

  // Hook to broadcast user presence on the board
  usePresence('board', selectedTask?.id || null);

  // Setup dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5 // Prevents click actions from immediately initiating a drag
      }
    })
  );

  const handleDragEnd = (event) => {
    if (isViewer) return;

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id; // The column id is the droppable zone id

    moveTask(taskId, newStatus);
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const openNewTask = (columnId) => {
    if (isViewer) return;
    setModalInitialStatus(columnId);
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  // Filter tasks belonging only to the current active project
  const projectTasks = tasks.filter(t => t.projectId === currentProjectId);

  // Column definitions
  const columns = [
    { id: 'To Do', title: 'To Do' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'In Review', title: 'In Review' },
    { id: 'Done', title: 'Done' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Task Board
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Drag and drop tasks across workflow boundaries.
          </p>
        </div>

        {/* View Switches */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/" className="glass-button primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <LayoutGrid size={14} /> Board
          </Link>
          <Link to="/list" className="glass-button" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <ClipboardList size={14} /> List
          </Link>
          <Link to="/calendar" className="glass-button" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <CalendarDays size={14} /> Calendar
          </Link>
          {!isViewer && (
            <button 
              onClick={() => openNewTask('To Do')} 
              className="glass-button primary"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Plus size={14} /> Create Task
            </button>
          )}
        </div>
      </div>

      {/* Dnd Board Arena */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="board-container">
          {columns.map(col => {
            const colTasks = projectTasks.filter(t => t.status === col.id);
            return (
              <KanbanColumn 
                key={col.id} 
                id={col.id} 
                title={col.title} 
                tasks={colTasks}
                onCardClick={openTaskDetail}
                onAddTaskClick={openNewTask}
                userRole={activeUserRole}
              />
            );
          })}
        </div>
      </DndContext>

      {/* Detail / Create Modal */}
      {isModalOpen && (
        <TaskDetail 
          task={selectedTask}
          initialStatus={modalInitialStatus}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
