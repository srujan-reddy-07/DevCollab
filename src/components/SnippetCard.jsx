import React, { useState } from 'react';
import { Copy, Check, Trash2, Code2 } from 'lucide-react';

export function SnippetCard({ snippet, onCopy, onDelete, userRole }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code)
      .then(() => {
        setCopied(true);
        if (onCopy) onCopy(snippet.title);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((e) => console.error('Clipboard copy failed:', e));
  };

  const canDelete = userRole !== 'Viewer';

  return (
    <div className="glass-card snippet-card animate-fade">
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div>
          <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Code2 size={16} className="logo-icon" /> {snippet.title}
          </h4>
          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', display: 'block', marginTop: '0.1rem' }}>
            Language: <strong>{snippet.language}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {/* Copy Button */}
          <button 
            onClick={handleCopy}
            className={`glass-button ${copied ? 'primary' : ''}`}
            style={{ padding: '0.35rem', borderRadius: '6px' }}
            title={copied ? 'Copied!' : 'Copy Snippet'}
          >
            {copied ? <Check size={13} style={{ color: 'white' }} /> : <Copy size={13} />}
          </button>

          {/* Delete Button */}
          {canDelete && (
            <button 
              onClick={() => onDelete(snippet.id)}
              className="glass-button"
              style={{ padding: '0.35rem', borderRadius: '6px' }}
              title="Delete Snippet"
            >
              <Trash2 size={13} style={{ color: 'hsl(0, 84%, 60%)' }} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', marginBottom: '0.5rem' }}>
        {snippet.description}
      </p>

      {/* Pre/Code box with syntax styles */}
      <pre className="snippet-code-box">
        <code>{snippet.code}</code>
      </pre>

      {/* Footer Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: 'auto' }}>
        {snippet.tags && snippet.tags.map((tag, i) => (
          <span 
            key={i} 
            className="task-tag"
            style={{ fontSize: '0.65rem', background: 'rgba(139, 92, 246, 0.08)', color: 'hsl(var(--primary))' }}
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
