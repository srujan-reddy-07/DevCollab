import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/store';
import { X, Calendar, User, Tag, MessageSquare, AlertTriangle, Send, Paperclip, Upload, Download, FileText } from 'lucide-react';

export function TaskDetail({ task, onClose, initialStatus = 'To Do' }) {
  const isNew = !task || !task.id;

  const members = useStore(state => state.members);
  const currentUser = useStore(state => state.currentUser);
  const currentProjectId = useStore(state => state.currentProjectId);
  const getUserName = useStore(state => state.getUserName);
  const getUserAvatar = useStore(state => state.getUserAvatar);
  
  const addTask = useStore(state => state.addTask);
  const updateTask = useStore(state => state.updateTask);
  const addComment = useStore(state => state.addComment);
  const addAttachment = useStore(state => state.addAttachment);
  const broadcastPresence = useStore(state => state.broadcastPresence);

  // Check roles permissions
  const activeUserRole = members.find(m => m.id === currentUser)?.role || 'Viewer';
  const isViewer = activeUserRole === 'Viewer';

  // Fields State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('P2');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');

  // Comments & Mention State
  const [commentText, setCommentText] = useState('');

  const handleFileUpload = (e) => {
    if (isViewer || isNew) return;
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        url: reader.result,
        createdAt: new Date().toISOString()
      };
      addAttachment(task.id, attachment);
    };
    reader.readAsDataURL(file);
  };
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const commentInputRef = useRef(null);

  // Sync state if viewing an existing task
  useEffect(() => {
    if (task && task.id) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setAssigneeId(task.assigneeId || '');
      setStatus(task.status || 'To Do');
      setPriority(task.priority || 'P2');
      setDueDate(task.dueDate || '');
      setTagInput(task.tags ? task.tags.join(', ') : '');
      
      // Broadcast that this user is viewing this task (live presence)
      broadcastPresence('board', task.id);
    }
  }, [task, broadcastPresence]);

  // Clean presence when closing modal
  useEffect(() => {
    return () => {
      broadcastPresence('board', null);
    };
  }, [broadcastPresence]);

  // Handle Mentions filtering
  const handleCommentChange = (e) => {
    const text = e.target.value;
    setCommentText(text);

    // Look for the last "@" token in input
    const lastAtPos = text.lastIndexOf('@');
    if (lastAtPos !== -1 && lastAtPos >= text.length - 15) {
      const query = text.substring(lastAtPos + 1);
      if (!query.includes(' ')) {
        setMentionQuery(query.toLowerCase());
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  const selectMention = (name) => {
    const lastAtPos = commentText.lastIndexOf('@');
    if (lastAtPos !== -1) {
      const mainPart = commentText.substring(0, lastAtPos);
      setCommentText(`${mainPart}@${name} `);
    }
    setShowMentions(false);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(mentionQuery)
  );

  const handleSave = () => {
    if (isViewer) return;
    if (!title.trim()) return;

    const tags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const taskData = {
      title,
      description,
      assigneeId: assigneeId || null,
      status,
      priority,
      dueDate: dueDate || null,
      tags
    };

    if (isNew) {
      addTask({
        ...taskData,
        id: `task-${Date.now()}`,
        projectId: currentProjectId,
        comments: []
      });
    } else {
      updateTask(task.id, taskData);
    }
    onClose();
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || isNew) return;
    addComment(task.id, commentText);
    setCommentText('');
    setShowMentions(false);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content animate-fade">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.75rem' }}>
          {isNew ? 'Create New Task' : 'Task Details'}
        </h2>

        {isViewer && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '6px',
            padding: '0.6rem 1rem',
            marginBottom: '1rem',
            color: 'hsl(var(--accent-amber))',
            fontSize: '0.8rem'
          }}>
            <AlertTriangle size={14} />
            <span>You are viewing this workspace as a <strong>Viewer</strong>. You do not have permissions to modify this task.</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
          {/* Main Info Columns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Task Title</label>
              <input 
                type="text" 
                className="glass-input" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                disabled={isViewer}
                placeholder="e.g. Write integration router tests"
                style={{ fontSize: '1rem', fontWeight: 500 }}
              />
            </div>

            {/* Description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Description</label>
              <textarea 
                className="glass-input" 
                rows={5}
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                disabled={isViewer}
                placeholder="Provide task specifics..."
                style={{ resize: 'vertical', fontSize: '0.9rem', lineHeight: '1.4' }}
              />
            </div>

            {/* Attachments Section */}
            {!isNew && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Paperclip size={15} /> Attachments
                </h4>
                
                {!isViewer && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label className="glass-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Upload size={13} />
                      <span>Upload File</span>
                      <input 
                        type="file" 
                        style={{ display: 'none' }} 
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                )}

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '0.5rem',
                  marginBottom: '1rem'
                }}>
                  {(!task.attachments || task.attachments.length === 0) ? (
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontStyle: 'italic', gridColumn: '1 / -1' }}>
                      No attachments uploaded.
                    </p>
                  ) : (
                    task.attachments.map(att => {
                      const isImage = att.type.startsWith('image/');
                      return (
                        <div 
                          key={att.id} 
                          className="glass-panel animate-fade" 
                          style={{
                            padding: '0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {isImage ? (
                            <img 
                              src={att.url} 
                              alt={att.name} 
                              style={{
                                width: '100%',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                background: '#1e293b'
                              }}
                            />
                          ) : (
                            <div 
                              style={{
                                width: '100%',
                                height: '80px',
                                borderRadius: '4px',
                                background: 'rgba(255,255,255,0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'hsl(var(--text-secondary))'
                              }}
                            >
                              <FileText size={24} />
                            </div>
                          )}

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                            <span 
                              style={{
                                fontSize: '0.75rem',
                                color: 'white',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                                fontWeight: 500
                              }}
                              title={att.name}
                            >
                              {att.name}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>{att.size}</span>
                          </div>

                          <a 
                            href={att.url} 
                            download={att.name}
                            className="glass-button"
                            style={{
                              padding: '0.25rem',
                              position: 'absolute',
                              top: '0.25rem',
                              right: '0.25rem',
                              borderRadius: '4px',
                              background: 'rgba(15,23,42,0.8)'
                            }}
                            title="Download File"
                          >
                            <Download size={11} style={{ color: 'white' }} />
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Comments Stream (Hidden when creating task) */}
            {!isNew && (
              <div style={{ marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MessageSquare size={15} /> Comments & Activity
                </h4>

                {/* Comment Feed list */}
                <div style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  background: 'rgba(0,0,0,0.15)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  marginBottom: '1rem'
                }}>
                  {(!task.comments || task.comments.length === 0) ? (
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '1rem' }}>
                      No comments posted yet.
                    </p>
                  ) : (
                    task.comments.map(c => (
                      <div key={c.id} style={{ display: 'flex', gap: '0.6rem' }}>
                        <div className="avatar" style={{ width: '22px', height: '22px', fontSize: '0.6rem' }}>
                          {getUserAvatar(c.userId)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.15rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>{getUserName(c.userId)}</span>
                            <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>
                              {new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', whiteSpace: 'pre-wrap', lineHeight: '1.3' }}>{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input 
                      ref={commentInputRef}
                      type="text" 
                      className="glass-input" 
                      placeholder="Ask a question or use @mention..."
                      value={commentText}
                      onChange={handleCommentChange}
                      style={{ width: '100%', fontSize: '0.8rem', paddingRight: '2rem' }}
                    />
                    
                    {/* @mention autocomplete dropup list */}
                    {showMentions && filteredMembers.length > 0 && (
                      <div className="glass-panel" style={{
                        position: 'absolute',
                        bottom: '105%',
                        left: 0,
                        width: '200px',
                        maxHeight: '120px',
                        overflowY: 'auto',
                        zIndex: 10,
                        padding: '0.25rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        {filteredMembers.map(m => (
                          <div 
                            key={m.id}
                            onClick={() => selectMention(m.name)}
                            style={{
                              padding: '0.35rem 0.5rem',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              transition: 'background 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            <div className="avatar" style={{ width: '16px', height: '16px', fontSize: '0.5rem' }}>{m.avatar}</div>
                            <span>{m.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="glass-button" style={{ padding: '0.4rem 0.75rem' }}>
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Sidebar Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '10px' }}>
            {/* Status Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Workflow Status</label>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                disabled={isViewer}
                className="glass-input"
                style={{ cursor: 'pointer', width: '100%' }}
              >
                <option value="To Do" style={{ background: '#1e293b' }}>To Do</option>
                <option value="In Progress" style={{ background: '#1e293b' }}>In Progress</option>
                <option value="In Review" style={{ background: '#1e293b' }}>In Review</option>
                <option value="Done" style={{ background: '#1e293b' }}>Done</option>
              </select>
            </div>

            {/* Assignee */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Assignee</label>
              <select 
                value={assigneeId} 
                onChange={(e) => setAssigneeId(e.target.value)} 
                disabled={isViewer}
                className="glass-input"
                style={{ cursor: 'pointer', width: '100%' }}
              >
                <option value="" style={{ background: '#1e293b' }}>Unassigned</option>
                {members.map(m => (
                  <option key={m.id} value={m.id} style={{ background: '#1e293b' }}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Priority Picker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Priority</label>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['P0', 'P1', 'P2'].map(p => (
                  <button
                    key={p}
                    type="button"
                    disabled={isViewer}
                    onClick={() => setPriority(p)}
                    className={`priority-badge ${p.toLowerCase()}`}
                    style={{
                      flex: 1,
                      border: priority === p ? '1.5px solid white' : '1px solid transparent',
                      padding: '0.35rem',
                      borderRadius: '4px',
                      cursor: isViewer ? 'default' : 'pointer',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      opacity: priority === p ? 1 : 0.4,
                      transition: 'all 0.2s'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Due Date</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                disabled={isViewer}
                className="glass-input"
                style={{ width: '100%' }}
              />
            </div>

            {/* Tags Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Tags (comma-separated)</label>
              <input 
                type="text" 
                placeholder="e.g. Core, React, Dnd" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                disabled={isViewer}
                className="glass-input"
                style={{ width: '100%' }}
              />
            </div>

            {/* Save Buttons */}
            {!isViewer && (
              <button 
                onClick={handleSave} 
                className="glass-button primary" 
                style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
              >
                {isNew ? 'Create Task' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
