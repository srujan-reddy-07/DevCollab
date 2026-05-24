import React, { useState } from 'react';
import { useStore } from '../store/store';
import { History, RefreshCw, Clock, User } from 'lucide-react';

export function VersionHistory({ docId, history = [], onRestore, userRole }) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const getUserName = useStore(state => state.getUserName);

  if (history.length === 0) {
    return (
      <div style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem', padding: '1rem 0' }}>
        No revisions on record.
      </div>
    );
  }

  // Find the selected version details
  const activeVer = selectedVersion 
    ? history.find(h => h.version === selectedVersion)
    : history[0];

  const canRestore = userRole !== 'Viewer';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', height: '100%' }}>
      <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
        <History size={16} className="logo-icon" /> Revision History
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', height: '100%', alignItems: 'start' }}>
        {/* Versions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {history.map((h, i) => {
            const isCurrent = h.version === (activeVer?.version);
            return (
              <div
                key={i}
                onClick={() => setSelectedVersion(h.version)}
                style={{
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  background: isCurrent ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255,255,255,0.02)',
                  border: isCurrent ? '1.5px solid hsl(var(--primary))' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 600, color: 'white' }}>Version {h.version}</span>
                  {i === 0 && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>
                      Current
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', color: 'hsl(var(--text-secondary))', fontSize: '0.7rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                    <User size={10} /> {getUserName(h.userId)}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.15rem' }}>
                    <Clock size={10} /> {new Date(h.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Version Preview */}
        {activeVer && (
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Revision Preview</span>
              {canRestore && (
                <button
                  onClick={() => onRestore(activeVer.version)}
                  className="glass-button"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  <RefreshCw size={12} /> Restore
                </button>
              )}
            </div>

            <h4 style={{ color: 'white', fontSize: '0.9rem' }}>{activeVer.title}</h4>
            <div 
              style={{
                fontSize: '0.8rem',
                color: 'hsl(var(--text-secondary))',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                background: 'rgba(0,0,0,0.1)',
                padding: '0.5rem',
                borderRadius: '4px'
              }}
              dangerouslySetInnerHTML={{ __html: activeVer.content }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
