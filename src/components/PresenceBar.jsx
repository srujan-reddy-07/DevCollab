import React from 'react';
import { useStore } from '../store/store';
import { Users, Eye, Sparkles } from 'lucide-react';

export function PresenceBar({ currentPage = 'dashboard', activeTaskId = null }) {
  const members = useStore(state => state.members);
  const currentUser = useStore(state => state.currentUser);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  const presence = useStore(state => state.presence);

  const getActiveUserCoords = (memberId) => {
    // If the member is the current user, return their current coords
    if (memberId === currentUser) {
      return { page: currentPage, taskOpened: activeTaskId, online: true, isMe: true };
    }
    
    // Otherwise, check in broadcast presence list
    const userPresence = presence[memberId];
    if (!userPresence) return { online: false };
    
    // Consider online if heartbeat was within last 12 seconds
    const isOnline = (Date.now() - userPresence.activeAt) < 12000;
    return {
      online: isOnline,
      page: userPresence.page,
      taskOpened: userPresence.taskOpened,
      isMe: false
    };
  };

  const activeUser = members.find(m => m.id === currentUser);

  return (
    <div className="presence-panel">
      {/* Active Persona Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.75rem', borderRight: '1px solid rgba(255,255,255,0.08)', paddingRight: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Testing as:</span>
        <select 
          value={currentUser} 
          onChange={(e) => setCurrentUser(e.target.value)}
          className="glass-input"
          style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          {members.map(m => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.role})
            </option>
          ))}
        </select>
      </div>

      {/* Online Users List */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <Users size={14} className="logo-icon" />
        <div className="avatar-stack" style={{ position: 'relative' }}>
          {members.map((member, index) => {
            const status = getActiveUserCoords(member.id);
            const initial = member.name.split(' ').map(n => n[0]).join('');

            // Format presence description tooltip
            let tooltipText = `${member.name} (${member.role}) - Offline`;
            if (status.online) {
              if (status.isMe) {
                tooltipText = `${member.name} (You) - Viewing ${status.page}`;
              } else {
                tooltipText = `${member.name} - Active on ${status.page}`;
              }
              if (status.taskOpened) {
                tooltipText += ` (focused on task)`;
              }
            }

            return (
              <div 
                key={member.id} 
                className="avatar avatar-stack-item" 
                title={tooltipText}
                style={{
                  width: '28px',
                  height: '28px',
                  fontSize: '0.75rem',
                  position: 'relative',
                  border: status.isMe ? '2px solid hsl(var(--primary))' : '2px solid hsl(var(--border-color))',
                  background: status.online 
                    ? `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))`
                    : 'rgba(120, 120, 120, 0.15)',
                  color: status.online ? 'rgba(255, 255, 255, 0.99)' : 'hsl(var(--text-muted))',
                  marginLeft: index === 0 ? '0' : '-8px',
                  cursor: 'default',
                  zIndex: members.length - index
                }}
              >
                {initial}
                {status.online && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-1px',
                    right: '-1px',
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: status.isMe ? 'hsl(var(--accent-blue))' : 'hsl(var(--accent-emerald))',
                    border: '1px solid #000'
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
