import React, { useState } from 'react';
import { useStore } from '../store/store';
import { usePresence } from '../hooks/usePresence';
import { TaskDetail } from '../components/TaskDetail';
import { Search, SlidersHorizontal, LayoutGrid, ClipboardList, CalendarDays, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ListView() {
  const currentProjectId = useStore(state => state.currentProjectId);
  const currentUser = useStore(state => state.currentUser);
  const members = useStore(state => state.members);
  const tasks = useStore(state => state.tasks);
  const getUserName = useStore(state => state.getUserName);
  const getUserAvatar = useStore(state => state.getUserAvatar);

  const activeUserRole = members.find(m => m.id === currentUser)?.role || 'Viewer';
  const isViewer = activeUserRole === 'Viewer';

  // State Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');

  // Modal State
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Broadcast presence on List Page
  usePresence('list_view', selectedTask?.id || null);

  // Filter tasks to active project
  const projectTasks = tasks.filter(t => t.projectId === currentProjectId);

  // Apply filters
  const filteredTasks = projectTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'All' || task.assigneeId === assigneeFilter;

    return matchesSearch && matchesPriority && matchesAssignee;
  });

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'white' }}>Task List</h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Search, filter, and sort workspace tasks.
          </p>
        </div>

        {/* View Switches */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to="/" className="glass-button" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <LayoutGrid size={14} /> Board
          </Link>
          <Link to="/list" className="glass-button primary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
            <ClipboardList size={14} /> List
          </Link>
          <Link to="/calendar" className="glass-button" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}>
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

      {/* Search & Filter Toolbar */}
      <div 
        className="glass-panel" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ color: 'hsl(var(--text-muted))', position: 'absolute', left: '0.75rem' }} />
          <input 
            type="text" 
            placeholder="Search by task title or tag..." 
            className="glass-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.2rem' }}
          />
        </div>

        {/* Priority Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SlidersHorizontal size={14} style={{ color: 'hsl(var(--text-muted))' }} />
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Priority:</span>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#1e293b' }}>All</option>
            <option value="P0" style={{ background: '#1e293b' }}>P0</option>
            <option value="P1" style={{ background: '#1e293b' }}>P1</option>
            <option value="P2" style={{ background: '#1e293b' }}>P2</option>
          </select>
        </div>

        {/* Assignee Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Assignee:</span>
          <select 
            value={assigneeFilter} 
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#1e293b' }}>All</option>
            {members.map(m => (
              <option key={m.id} value={m.id} style={{ background: '#1e293b' }}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List Table Grid */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'hsl(var(--text-secondary))', fontSize: '0.8rem' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Task Title</th>
              <th style={{ padding: '0.75rem 1rem' }}>Assignee</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Priority</th>
              <th style={{ padding: '0.75rem 1rem' }}>Due Date</th>
              <th style={{ padding: '0.75rem 1rem' }}>Tags</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.85rem' }}>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
                  No matching tasks found.
                </td>
              </tr>
            ) : (
              filteredTasks.map(task => (
                <tr 
                  key={task.id} 
                  onClick={() => openTaskDetail(task)}
                  style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.04)', 
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Title */}
                  <td style={{ padding: '1rem', color: 'white', fontWeight: 500 }}>{task.title}</td>
                  
                  {/* Assignee */}
                  <td style={{ padding: '1rem' }}>
                    {task.assigneeId ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div className="avatar" style={{ width: '20px', height: '20px', fontSize: '0.55rem' }}>
                          {getUserAvatar(task.assigneeId)}
                        </div>
                        <span>{getUserName(task.assigneeId)}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'hsl(var(--text-muted))' }}>Unassigned</span>
                    )}
                  </td>
                  
                  {/* Status */}
                  <td style={{ padding: '1rem' }}>
                    <span 
                      style={{ 
                        fontSize: '0.7rem', 
                        background: 'rgba(255,255,255,0.04)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      {task.status}
                    </span>
                  </td>
                  
                  {/* Priority */}
                  <td style={{ padding: '1rem' }}>
                    <span className={`priority-badge ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </td>
                  
                  {/* Due Date */}
                  <td style={{ padding: '1rem', color: 'hsl(var(--text-muted))' }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
                  </td>
                  
                  {/* Tags */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {task.tags && task.tags.map((tag, i) => (
                        <span key={i} className="task-tag" style={{ fontSize: '0.6rem' }}>{tag}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Task Detail Modal */}
      {isModalOpen && (
        <TaskDetail 
          task={selectedTask}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
