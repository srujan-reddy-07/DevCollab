import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { usePresence } from '../hooks/usePresence';
import { WikiEditor } from '../components/WikiEditor';
import { VersionHistory } from '../components/VersionHistory';
import { FileText, Plus, Edit3, Eye, Calendar, User, History } from 'lucide-react';

export default function Docs() {
  const currentProjectId = useStore(state => state.currentProjectId);
  const currentUser = useStore(state => state.currentUser);
  const members = useStore(state => state.members);
  const docs = useStore(state => state.docs);
  
  const addDoc = useStore(state => state.addDoc);
  const updateDoc = useStore(state => state.updateDoc);
  const restoreDocVersion = useStore(state => state.restoreDocVersion);
  const getUserName = useStore(state => state.getUserName);

  const activeUserRole = members.find(m => m.id === currentUser)?.role || 'Viewer';
  const isViewer = activeUserRole === 'Viewer';

  // Selected Doc & Editing States
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Edit Buffer States
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Filter docs to active project
  const projectDocs = docs.filter(d => d.projectId === currentProjectId);

  // Auto select first document
  useEffect(() => {
    if (projectDocs.length > 0 && !selectedDocId) {
      setSelectedDocId(projectDocs[0].id);
    }
  }, [projectDocs, selectedDocId]);

  const activeDoc = projectDocs.find(d => d.id === selectedDocId) || projectDocs[0];

  // Broadcast presence on Docs page
  usePresence('wiki_docs', activeDoc?.id || null);

  // Sync editing buffer when doc selection shifts
  useEffect(() => {
    if (activeDoc) {
      setEditTitle(activeDoc.title || '');
      setEditContent(activeDoc.content || '');
      setIsEditing(false);
      setShowHistory(false);
    }
  }, [activeDoc]);

  const handleCreatePage = () => {
    if (isViewer) return;

    const newDocId = `doc-${Date.now()}`;
    const newDoc = {
      id: newDocId,
      projectId: currentProjectId,
      title: 'Untitled Document',
      content: '<h1>New Wiki Page</h1><p>Start writing wiki content here...</p>',
      version: 1,
      history: [
        {
          version: 1,
          title: 'Untitled Document',
          content: '<h1>New Wiki Page</h1><p>Start writing wiki content here...</p>',
          updatedAt: new Date().toISOString(),
          userId: currentUser
        }
      ]
    };

    addDoc(newDoc);
    setSelectedDocId(newDocId);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (isViewer || !activeDoc) return;
    updateDoc(activeDoc.id, {
      title: editTitle,
      content: editContent
    });
    setIsEditing(false);
  };

  const handleRestoreVersion = (version) => {
    if (isViewer || !activeDoc) return;
    restoreDocVersion(activeDoc.id, version);
    setShowHistory(false);
  };

  // Append a page-to-page wiki link at the end of the content
  const insertWikiLink = (linkedDoc) => {
    if (!isEditing) return;
    const linkHtml = `<p>Reference page: <a href="#" onclick="window.dispatchEvent(new CustomEvent('wiki-navigate', {detail: '${linkedDoc.id}'})); return false;" style="color: hsl(var(--primary)); text-decoration: underline;">${linkedDoc.title}</a></p>`;
    setEditContent(prev => prev + linkHtml);
  };

  // Listener to navigate from cross-page clicks inside dangerouslySetInnerHTML
  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail) {
        setSelectedDocId(e.detail);
      }
    };
    window.addEventListener('wiki-navigate', handleNavigate);
    return () => window.removeEventListener('wiki-navigate', handleNavigate);
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '2rem', height: '100%', alignItems: 'start' }}>
      {/* Sidebar List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="animate-fade">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'white' }}>Wiki Pages</h3>
          {!isViewer && (
            <button 
              onClick={handleCreatePage} 
              className="glass-button" 
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            >
              <Plus size={12} /> New
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '450px', overflowY: 'auto' }}>
          {projectDocs.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', padding: '1rem 0' }}>
              No documentation pages yet.
            </p>
          ) : (
            projectDocs.map(doc => {
              const isSelected = activeDoc?.id === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className="nav-link"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isSelected ? 'white' : 'hsl(var(--text-secondary))',
                    padding: '0.5rem 0.75rem'
                  }}
                >
                  <FileText size={14} style={{ color: isSelected ? 'hsl(var(--primary))' : 'inherit' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {doc.title}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Documentation Viewer Panel */}
      {activeDoc ? (
        <div className="glass-panel animate-fade" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '500px' }}>
          {/* Doc Header Action Panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <input
                  type="text"
                  className="glass-input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{ width: '100%', fontSize: '1.4rem', fontWeight: 700, padding: '0.4rem 0.75rem' }}
                />
              ) : (
                <>
                  <h2 style={{ fontSize: '1.6rem', color: 'white', marginBottom: '0.4rem' }}>{activeDoc.title}</h2>
                  <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <History size={12} /> Version {activeDoc.version}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Calendar size={12} /> Modified {new Date(activeDoc.history?.[0]?.updatedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Editing Controls */}
            {!isViewer && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {isEditing ? (
                  <>
                    <button onClick={handleSave} className="glass-button primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Save Wiki
                    </button>
                    <button onClick={() => setIsEditing(false)} className="glass-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(true)} className="glass-button" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                      <Edit3 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => setShowHistory(!showHistory)} 
                      className={`glass-button ${showHistory ? 'primary' : ''}`} 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      <History size={14} /> Revisions
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Revision History Mode */}
          {showHistory ? (
            <VersionHistory 
              docId={activeDoc.id}
              history={activeDoc.history}
              onRestore={handleRestoreVersion}
              userRole={activeUserRole}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isEditing ? '1fr 200px' : '1fr', gap: '1.5rem' }}>
              {/* Doc Body */}
              <div>
                {isEditing ? (
                  <WikiEditor 
                    content={editContent}
                    onChange={setEditContent}
                  />
                ) : (
                  <div 
                    className="tiptap animate-fade"
                    style={{ minHeight: '300px' }}
                    dangerouslySetInnerHTML={{ __html: activeDoc.content }}
                  />
                )}
              </div>

              {/* Editing Links Panel on Sidebar */}
              {isEditing && projectDocs.length > 1 && (
                <div 
                  className="glass-panel animate-fade"
                  style={{
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)'
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>Wiki Hyperlinking</span>
                  <p style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', lineHeight: '1.3' }}>
                    Click pages below to insert hyperlinks instantly.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {projectDocs
                      .filter(d => d.id !== activeDoc.id)
                      .map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => insertWikiLink(doc)}
                          className="glass-button"
                          style={{
                            padding: '0.3rem 0.5rem',
                            fontSize: '0.7rem',
                            width: '100%',
                            justifyContent: 'flex-start',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          + {doc.title}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          Select or create a documentation page in the left pane to begin.
        </div>
      )}
    </div>
  );
}
