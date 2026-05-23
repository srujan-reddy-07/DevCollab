import React, { useState } from 'react';
import { useStore } from '../store/store';
import { usePresence } from '../hooks/usePresence';
import { TaskDetail } from '../components/TaskDetail';
import { Link } from 'react-router-dom';
import { LayoutGrid, ClipboardList, CalendarDays, Plus } from 'lucide-react';

// react-big-calendar setup
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enUS } from 'date-fns/locale/en-US';

// Base styling
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function CalendarView() {
  const currentProjectId = useStore(state => state.currentProjectId);
  const currentUser = useStore(state => state.currentUser);
  const members = useStore(state => state.members);
  const tasks = useStore(state => state.tasks);

  const activeUserRole = members.find(m => m.id === currentUser)?.role || 'Viewer';
  const isViewer = activeUserRole === 'Viewer';

  // Details Modal States
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Broadcast presence
  usePresence('calendar', selectedTask?.id || null);

  // Filter tasks to active project & verify dueDate exists
  const projectTasks = tasks.filter(t => t.projectId === currentProjectId && t.dueDate);

  // Map tasks to react-big-calendar event model
  const events = projectTasks.map(task => {
    // Standardize dates to mid-day to prevent time zone slip-overs
    const dateObj = new Date(task.dueDate + 'T12:00:00');
    return {
      id: task.id,
      title: `[${task.priority}] ${task.title}`,
      start: dateObj,
      end: dateObj,
      allDay: true,
      rawTask: task
    };
  });

  const handleSelectEvent = (event) => {
    setSelectedTask(event.rawTask);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'white' }}>Task Calendar</h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Plan milestones and view task due dates.
          </p>
        </div>

        {/* View Switches */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/" className="glass-button" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <LayoutGrid size={14} /> Board
          </Link>
          <Link to="/list" className="glass-button" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <ClipboardList size={14} /> List
          </Link>
          <Link to="/calendar" className="glass-button primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <CalendarDays size={14} /> Calendar
          </Link>
          {!isViewer && (
            <button 
              onClick={() => { setSelectedTask(null); setIsModalOpen(true); }}
              className="glass-button primary"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Plus size={14} /> Create Task
            </button>
          )}
        </div>
      </div>

      {/* Calendar Area */}
      <div style={{ flex: 1, minHeight: '500px' }} className="animate-fade">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 220px)' }}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'agenda']}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <TaskDetail 
          task={selectedTask}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
