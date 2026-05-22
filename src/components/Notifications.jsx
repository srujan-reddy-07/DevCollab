import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { broadcaster } from '../store/sync';
import { Bell, X, Check, MessageSquare, ArrowRightLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

export function Notifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const notifications = useStore(state => state.notifications);
  const clearNotification = useStore(state => state.clearNotification);
  const currentUser = useStore(state => state.currentUser);
  const getUserName = useStore(state => state.getUserName);

  // Sound cue or celebration
  const playAlertEffects = (text) => {
    // Subtle confetti celebration on task completions
    if (text.toLowerCase().includes('moved') && text.toLowerCase().includes('done')) {
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.85, x: 0.9 }
      });
    }
  };

  // Setup broadcast listeners for real-time visual toasts
  useEffect(() => {
    const store = useStore.getState();

    const unsubscribe = broadcaster.subscribe((event) => {
      const { type, payload } = event;
      
      // Setup default toast texts
      let toastText = '';
      
      if (type === 'ADD_NOTIFICATION' && payload.userId === store.currentUser) {
        toastText = payload.text;
      } else if (type === 'MOVE_TASK' && payload.actorId !== store.currentUser) {
        const task = store.tasks.find(t => t.id === payload.taskId);
        if (task && task.projectId === store.currentProjectId) {
          toastText = `${getUserName(payload.actorId)} moved task "${task.title}" to ${payload.newStatus}`;
        }
      } else if (type === 'ADD_COMMENT' && payload.comment.userId !== store.currentUser) {
        const task = store.tasks.find(t => t.id === payload.taskId);
        if (task && task.projectId === store.currentProjectId) {
          toastText = `${getUserName(payload.comment.userId)} commented on "${task.title}"`;
        }
      }

      if (toastText) {
        addToast(toastText);
        playAlertEffects(toastText);
      }
    });

    return () => unsubscribe();
  }, [currentUser, getUserName]);

  const addToast = (text) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, text }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Filter notifications only targeted to current active user persona
  const myNotifications = notifications.filter(n => n.userId === currentUser);

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className="notification-bell glass-button"
        style={{ padding: '0.5rem', borderRadius: '50%' }}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={18} />
        {myNotifications.length > 0 && (
          <span className="notification-badge" />
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="glass-panel animate-fade"
            style={{
              position: 'absolute',
              top: '120%',
              right: 0,
              width: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '1rem',
              zIndex: 95,
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Activity & Mentions</span>
              {myNotifications.length > 0 && (
                <span style={{ fontSize: '0.7rem', color: 'hsl(var(--secondary))' }}>{myNotifications.length} items</span>
              )}
            </div>

            {myNotifications.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '1.5rem 0' }}>
                All clear! No new notifications.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {myNotifications.map(n => (
                  <div 
                    key={n.id} 
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                      <p style={{ color: 'hsl(var(--text-primary))', lineHeight: '1.3' }}>{n.text}</p>
                      <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <button 
                      onClick={() => clearNotification(n.id)}
                      style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}
                      title="Clear"
                    >
                      <Check size={14} style={{ color: 'hsl(var(--accent-emerald))' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Floating Screen Toasts Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast-card glass-panel">
            {toast.text.includes('comment') ? (
              <MessageSquare size={16} style={{ color: 'hsl(var(--accent-blue))' }} />
            ) : (
              <ArrowRightLeft size={16} style={{ color: 'hsl(var(--primary))' }} />
            )}
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 500 }}>{toast.text}</span>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', padding: '0.1rem' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
