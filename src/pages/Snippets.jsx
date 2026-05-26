import React, { useState } from 'react';
import { useStore } from '../store/store';
import { usePresence } from '../hooks/usePresence';
import { SnippetCard } from '../components/SnippetCard';
import { Search, Code2, Plus, X, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Snippets() {
  const currentProjectId = useStore(state => state.currentProjectId);
  const currentUser = useStore(state => state.currentUser);
  const members = useStore(state => state.members);
  const snippets = useStore(state => state.snippets);
  
  const addSnippet = useStore(state => state.addSnippet);
  const deleteSnippet = useStore(state => state.deleteSnippet);

  const activeUserRole = members.find(m => m.id === currentUser)?.role || 'Viewer';
  const isViewer = activeUserRole === 'Viewer';

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('All');

  // Creation State
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JS');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Toast indicator text
  const [toastMessage, setToastMessage] = useState(null);

  // Broadcast presence on Snippets page
  usePresence('snippets', null);

  const handleCopyFeedback = (snippetTitle) => {
    // Alert confetti or popup
    setToastMessage(`Copied "${snippetTitle}" to clipboard!`);
    confetti({
      particleCount: 40,
      spread: 30,
      origin: { y: 0.9, x: 0.1 }
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveSnippet = (e) => {
    e.preventDefault();
    if (isViewer) return;

    if (!title.trim() || !code.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const newSnippet = {
      id: `snip-${Date.now()}`,
      projectId: currentProjectId,
      title,
      language,
      description,
      code,
      tags
    };

    addSnippet(newSnippet);
    
    // Clear buffer
    setTitle('');
    setDescription('');
    setCode('');
    setTagsInput('');
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    if (isViewer) return;
    deleteSnippet(id);
  };

  // Filter snippets to active project
  const projectSnippets = snippets.filter(s => s.projectId === currentProjectId);

  // Apply filters
  const filteredSnippets = projectSnippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLanguage = languageFilter === 'All' || snippet.language === languageFilter;

    return matchesSearch && matchesLanguage;
  });

  const languages = ['JS', 'Python', 'Go', 'Java', 'C++'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={24} className="logo-icon" /> Snippet Bank
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Share, search, and reuse code segments across the workspace.
          </p>
        </div>

        {!isViewer && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)} 
            className="glass-button primary"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
          >
            <Plus size={14} /> Add Snippet
          </button>
        )}
      </div>

      {/* Creation Drawer */}
      {isAdding && (
        <form 
          onSubmit={handleSaveSnippet} 
          className="glass-panel animate-fade" 
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'white' }}>Publish New Snippet</h3>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)} 
              style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Title</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required
                  placeholder="e.g. Fetch records from S3"
                />
              </div>

              {/* Code Blocks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Source Code</label>
                <textarea 
                  className="glass-input" 
                  rows={8}
                  value={code} 
                  onChange={(e) => setCode(e.target.value)} 
                  required
                  placeholder="Paste code blocks here..."
                  style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.8rem', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Language */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)} 
                  className="glass-input"
                  style={{ cursor: 'pointer', width: '100%' }}
                >
                  {languages.map(l => (
                    <option key={l} value={l} style={{ background: '#1e293b' }}>{l}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Description</label>
                <textarea 
                  className="glass-input" 
                  rows={3}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="What does this code do?"
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Tags (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. s3, fetch, aws" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="glass-input"
                />
              </div>

              <button type="submit" className="glass-button primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
                Publish Snippet
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filters Toolbar */}
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
            placeholder="Search snippets by title or tags..." 
            className="glass-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.2rem' }}
          />
        </div>

        {/* Language select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Language:</span>
          <select 
            value={languageFilter} 
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#1e293b' }}>All</option>
            {languages.map(l => (
              <option key={l} value={l} style={{ background: '#1e293b' }}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Snippet Grid */}
      <div className="snippet-grid">
        {filteredSnippets.length === 0 ? (
          <div className="glass-panel" style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
            No code snippets match your current search constraints.
          </div>
        ) : (
          filteredSnippets.map(snippet => (
            <SnippetCard 
              key={snippet.id}
              snippet={snippet}
              onCopy={handleCopyFeedback}
              onDelete={handleDelete}
              userRole={activeUserRole}
            />
          ))
        )}
      </div>

      {/* Inline copy indicator feedback popup */}
      {toastMessage && (
        <div 
          className="glass-panel animate-fade"
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(15,23,42,0.9)',
            borderLeft: '4px solid hsl(var(--accent-emerald))',
            fontSize: '0.8rem',
            zIndex: 100
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
