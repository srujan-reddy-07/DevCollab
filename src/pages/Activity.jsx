import React, { useState } from 'react';
import { useStore } from '../store/store';
import { usePresence } from '../hooks/usePresence';
import { Radio, User, Folder, Clock, Filter } from 'lucide-react';

export default function Activity() {
  const currentWorkspaceId = useStore(state => state.currentWorkspaceId);
  const projects = useStore(state => state.projects);
  const members = useStore(state => state.members);
  const feeds = useStore(state => state.feeds);
  const getUserName = useStore(state => state.getUserName);
  const getUserAvatar = useStore(state => state.getUserAvatar);

  // Filter States
  const [projectFilter, setProjectFilter] = useState('All');
  const [memberFilter, setMemberFilter] = useState('All');

  // Broadcast presence on Activity Feed
  usePresence('activity_feed', null);

  // Filter feeds belonging to current active workspace
  const workspaceFeeds = feeds.filter(f => f.workspaceId === currentWorkspaceId);

  // Apply filters
  const filteredFeeds = workspaceFeeds.filter(feed => {
    // 1. Member filter
    const matchesMember = memberFilter === 'All' || feed.userId === memberFilter;

    // 2. Project filter (match by scanning feed text for project name)
    let matchesProject = true;
    if (projectFilter !== 'All') {
      const selectedProj = projects.find(p => p.id === projectFilter);
      if (selectedProj) {
        // Match project name or project id reference
        matchesProject = feed.text.toLowerCase().includes(selectedProj.name.toLowerCase()) || 
                         (feed.projectId && feed.projectId === projectFilter);
      }
    }

    return matchesMember && matchesProject;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={24} className="logo-icon" /> Activity Feed
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Monitor and audit all real-time events happening across the workspace.
          </p>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div 
        className="glass-panel" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem', 
          padding: '0.75rem 1.25rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'hsl(var(--text-muted))', fontSize: '0.8rem', fontWeight: 600 }}>
          <Filter size={14} />
          <span>FILTER LOGS:</span>
        </div>

        {/* Project Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Folder size={14} style={{ color: 'hsl(var(--text-muted))' }} />
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Project:</span>
          <select 
            value={projectFilter} 
            onChange={(e) => setProjectFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#1e293b' }}>All Projects</option>
            {projects.filter(p => p.workspaceId === currentWorkspaceId).map(p => (
              <option key={p.id} value={p.id} style={{ background: '#1e293b' }}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Member Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={14} style={{ color: 'hsl(var(--text-muted))' }} />
          <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))' }}>Actor:</span>
          <select 
            value={memberFilter} 
            onChange={(e) => setMemberFilter(e.target.value)}
            className="glass-input"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}
          >
            <option value="All" style={{ background: '#1e293b' }}>All Members</option>
            {members.map(m => (
              <option key={m.id} value={m.id} style={{ background: '#1e293b' }}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feed List Timeline */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '1.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          maxHeight: 'calc(100vh - 240px)',
          overflowY: 'auto'
        }}
      >
        {filteredFeeds.length === 0 ? (
          <p style={{ color: 'hsl(var(--text-muted))', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>
            No activity logs found matching the active filters.
          </p>
        ) : (
          filteredFeeds.map(feed => {
            const actor = members.find(m => m.id === feed.userId);
            return (
              <div 
                key={feed.id} 
                className="glass-panel animate-fade" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '0.75rem 1rem', 
                  border: '1px solid rgba(255,255,255,0.03)',
                  background: 'rgba(255,255,255,0.01)'
                }}
              >
                {/* User Avatar */}
                <div 
                  className="avatar" 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    fontSize: '0.7rem', 
                    border: '1.5px solid rgba(255,255,255,0.1)' 
                  }}
                >
                  {getUserAvatar(feed.userId)}
                </div>

                {/* Feed Info details */}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 500, display: 'block' }}>
                    {feed.text}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                    <Clock size={11} />
                    {new Date(feed.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Role badge of active actor */}
                {actor && (
                  <span 
                    style={{ 
                      fontSize: '0.65rem', 
                      background: 'rgba(255,255,255,0.04)', 
                      border: '1px solid rgba(255,255,255,0.06)',
                      padding: '0.15rem 0.4rem', 
                      borderRadius: '4px',
                      color: 'hsl(var(--text-secondary))' 
                    }}
                  >
                    {actor.role}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
