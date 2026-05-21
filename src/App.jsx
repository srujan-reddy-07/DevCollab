import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import { useStore } from './store/store';
import { useSync } from './hooks/useSync';
import { PresenceBar } from './components/PresenceBar';
import { Notifications } from './components/Notifications';
import { Login } from './pages/Login';
import { 
  FolderGit2, LayoutGrid, ClipboardList, CalendarDays, 
  FileText, Code2, Sparkles, CreditCard, ChevronDown, 
  Layers, Plus, ShieldAlert, X, Radio, UserPlus,
  Sun, Moon, LogOut
} from 'lucide-react';

export default function App() {
  // Activate real-time sync channel
  useSync();

  const location = useLocation();

  // Store data & actions
  const workspaces = useStore(state => state.workspaces);
  const projects = useStore(state => state.projects);
  const currentWorkspaceId = useStore(state => state.currentWorkspaceId);
  const currentProjectId = useStore(state => state.currentProjectId);
  const currentUser = useStore(state => state.currentUser);
  const proUser = useStore(state => state.proUser);
  const members = useStore(state => state.members);
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);

  const setCurrentWorkspace = useStore(state => state.setCurrentWorkspace);
  const setCurrentProject = useStore(state => state.setCurrentProject);
  const addWorkspace = useStore(state => state.addWorkspace);
  const addProject = useStore(state => state.addProject);
  const addMember = useStore(state => state.addMember);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const getUserName = useStore(state => state.getUserName);
  const getUserAvatar = useStore(state => state.getUserAvatar);

  // Selector drop-downs & alert toggles
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [showBillingAlert, setShowBillingAlert] = useState(false);

  // Enhancement Dialog/Modal states
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profName, setProfName] = useState('');
  const [profBio, setProfBio] = useState('');
  const [profSkills, setProfSkills] = useState('');
  const [profGithub, setProfGithub] = useState('');

  // Active elements
  const activeWorkspace = workspaces.find(w => w.id === currentWorkspaceId);
  const activeProject = projects.find(p => p.id === currentProjectId);
  const activeUser = members.find(m => m.id === currentUser);

  // Load active user info when profile modal opens
  useEffect(() => {
    if (activeUser) {
      setProfName(activeUser.name || '');
      setProfBio(activeUser.bio || '');
      setProfSkills(activeUser.skills ? activeUser.skills.join(', ') : '');
      setProfGithub(activeUser.github || '');
    }
  }, [activeUser, showProfileModal]);

  // Listener to process email invite links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteWs = params.get('invite');
    const inviteUserName = params.get('name');
    const inviteUserRole = params.get('role') || 'Member';

    if (inviteWs && inviteUserName) {
      const memberId = `usr-${Date.now()}`;
      const nameParts = inviteUserName.split(' ');
      const avatarChars = nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      const newMember = {
        id: memberId,
        name: inviteUserName,
        role: inviteUserRole,
        email: `${inviteUserName.toLowerCase().replace(/\s+/g, '')}@devcollab.com`,
        avatar: avatarChars || '??',
        bio: 'Joined the workspace via shared email invitation link.',
        github: 'github.com'
      };

      addMember(newMember);

      // Clean query params so invitation doesn't trigger again on reload
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Auto-switch to the target workspace if it's ws-1 or if they are pro
      if (inviteWs === 'ws-1' || proUser) {
        setCurrentWorkspace(inviteWs);
      }
    }
  }, [addMember, proUser, setCurrentWorkspace]);

  // Synchronize theme with body classes dynamically
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Filter projects belonging to active workspace
  const workspaceProjects = projects.filter(p => p.workspaceId === currentWorkspaceId);

  const handleSelectWorkspace = (wsId) => {
    setShowWorkspaceDropdown(false);
    
    // Payments rule check: Free accounts are capped at 1 workspace (ws-1)
    if (wsId !== 'ws-1' && !proUser) {
      setShowBillingAlert(true);
      return;
    }
    setCurrentWorkspace(wsId);
  };

  const handleSelectProject = (projId) => {
    setCurrentProject(projId);
  };

  const handleSendEmailInvite = (e) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    // Simulate sending email: log to activity feeds
    const activeUser = members.find(m => m.id === currentUser);
    const actorName = activeUser ? activeUser.name : 'Owner';
    const logActivity = useStore.getState().logActivity;
    logActivity(`${actorName} invited ${inviteName} (${inviteEmail}) via email join link as ${inviteRole}`);

    // Set sent state
    setInviteSent(true);
  };

  const handleCreateWorkspace = (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    // Billing check: Free tier capped at 1 workspace
    if (!proUser && workspaces.length >= 1) {
      setShowCreateWorkspace(false);
      setShowBillingAlert(true);
      return;
    }

    const wsId = `ws-${Date.now()}`;
    addWorkspace({
      id: wsId,
      name: newWorkspaceName,
      description: newWorkspaceDesc
    });
    
    setNewWorkspaceName('');
    setNewWorkspaceDesc('');
    setShowCreateWorkspace(false);
    setCurrentWorkspace(wsId);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    // Billing check: Free tier capped at 3 projects
    const totalProj = projects.filter(p => p.workspaceId === currentWorkspaceId).length;
    if (!proUser && totalProj >= 3) {
      setShowCreateProject(false);
      setShowBillingAlert(true);
      return;
    }

    const projId = `proj-${Date.now()}`;
    addProject({
      id: projId,
      workspaceId: currentWorkspaceId,
      name: newProjectName,
      description: newProjectDesc
    });

    setNewProjectName('');
    setNewProjectDesc('');
    setShowCreateProject(false);
    setCurrentProject(projId);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!profName.trim()) return;

    const nameParts = profName.split(' ');
    const avatarChars = nameParts.map(n => n[0]).join('').substring(0, 2).toUpperCase();

    updateUserProfile(currentUser, {
      name: profName,
      avatar: avatarChars || '??',
      bio: profBio,
      skills: profSkills.split(',').map(s => s.trim()).filter(Boolean),
      github: profGithub
    });

    setShowProfileModal(false);
  };

  // Determine current active page key for presence tracking
  const getPageKey = () => {
    const path = location.pathname;
    if (path === '/') return 'board';
    if (path === '/list') return 'list_view';
    if (path === '/calendar') return 'calendar';
    if (path === '/docs') return 'wiki_docs';
    if (path === '/snippets') return 'snippets';
    if (path === '/ai') return 'ai_assistant';
    if (path === '/billing') return 'billing_settings';
    if (path === '/activity') return 'activity_feed';
    return 'dashboard';
  };

  if (!currentUser) {
    return <Login />;
  }

  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="logo-container">
          <FolderGit2 className="logo-icon" size={24} />
          <h1 className="logo-title">DevCollab</h1>
        </div>

        {/* Workspace Selector */}
        <div className="workspace-selector" style={{ position: 'relative' }}>
          <button 
            className="workspace-trigger"
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
              <Layers size={15} style={{ color: 'hsl(var(--primary))' }} />
              <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeWorkspace?.name}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>Active Org</div>
              </div>
            </div>
            <ChevronDown size={14} style={{ color: 'hsl(var(--text-muted))' }} />
          </button>

          {showWorkspaceDropdown && (
            <>
              <div 
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                onClick={() => setShowWorkspaceDropdown(false)}
              />
              <div 
                className="glass-panel animate-fade"
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  width: '100%',
                  padding: '0.4rem',
                  zIndex: 15,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                {workspaces.map(ws => {
                  const isSelected = ws.id === currentWorkspaceId;
                  const isLocked = ws.id !== 'ws-1' && !proUser;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => handleSelectWorkspace(ws.id)}
                      className="nav-link"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        background: isSelected ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                        color: isSelected ? 'white' : 'hsl(var(--text-secondary))',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ws.name}
                      </span>
                      {isLocked && (
                        <span style={{ fontSize: '0.6rem', color: 'hsl(var(--accent-amber))', background: 'rgba(245,158,11,0.15)', padding: '0.05rem 0.3rem', borderRadius: '4px' }}>
                          PRO
                        </span>
                      )}
                    </button>
                  );
                })}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                  <button
                    onClick={() => { setShowWorkspaceDropdown(false); setShowCreateWorkspace(true); }}
                    className="nav-link"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      color: 'hsl(var(--primary))',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <Plus size={13} />
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Project Selector section */}
        <div className="nav-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className="nav-section-title" style={{ marginBottom: 0 }}>Active Projects</span>
            <button 
              onClick={() => setShowCreateProject(true)}
              style={{ background: 'none', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
              title="Create New Project"
            >
              <Plus size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {workspaceProjects.length === 0 ? (
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', padding: '0 0.5rem' }}>No projects available</span>
            ) : (
              workspaceProjects.map(proj => {
                const isSelected = proj.id === currentProjectId;
                return (
                  <button
                    key={proj.id}
                    onClick={() => handleSelectProject(proj.id)}
                    className={`nav-link ${isSelected ? 'active' : ''}`}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8rem'
                    }}
                  >
                    <span># {proj.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Workspace Views */}
        <div className="nav-section">
          <span className="nav-section-title">Workspace Views</span>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutGrid size={16} />
            <span>Task Board</span>
          </NavLink>
          <NavLink to="/list" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <ClipboardList size={16} />
            <span>Task List</span>
          </NavLink>
          <NavLink to="/calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CalendarDays size={16} />
            <span>Calendar</span>
          </NavLink>
        </div>

        {/* Collaborative Apps */}
        <div className="nav-section">
          <span className="nav-section-title">Collaborative Apps</span>
          <NavLink to="/docs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <FileText size={16} />
            <span>Wiki Docs</span>
          </NavLink>
          <NavLink to="/snippets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Code2 size={16} />
            <span>Snippet Bank</span>
          </NavLink>
          <NavLink to="/activity" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Radio size={16} />
            <span>Activity Feed</span>
          </NavLink>
        </div>

        {/* AI & Upgrades */}
        <div className="nav-section">
          <span className="nav-section-title">Developer Assistants</span>
          <NavLink to="/ai" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Sparkles size={16} style={{ color: 'hsl(var(--accent-amber))' }} />
            <span>AI workspace</span>
          </NavLink>
          <NavLink to="/billing" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CreditCard size={16} />
            <span>Billing settings</span>
          </NavLink>
        </div>

        {/* Sidebar Footer User profile */}
        <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div 
            className="user-profile-button" 
            title={`${activeUser?.name} (${activeUser?.email}) - Click to Edit Profile`}
            onClick={() => setShowProfileModal(true)}
            style={{ cursor: 'pointer', flex: 1, overflow: 'hidden', minWidth: 0 }}
          >
            <div className="avatar">
              {getUserAvatar(currentUser)}
            </div>
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div className="user-name" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{getUserName(currentUser)}</div>
              <div className="user-role">{activeUser?.role}</div>
            </div>
          </div>
          <button
            onClick={() => useStore.getState().logout()}
            className="glass-button"
            style={{ padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}
            title="Log Out"
          >
            <LogOut size={14} style={{ color: 'hsl(var(--secondary))' }} />
          </button>
        </div>
      </aside>

      {/* Main Container Shell */}
      <main className="main-shell">
        <header className="main-header">
          {/* Active project context badge */}
          <div className="header-title-bar">
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white' }}>{activeWorkspace?.name}</span>
            <span className="project-badge"># {activeProject?.name}</span>
          </div>

          {/* Collaborative elements */}
          <div className="header-actions">
            {/* Invite Button */}
            <button 
              className="glass-button primary" 
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', gap: '0.35rem' }}
              onClick={() => setShowInviteModal(true)}
              title="Invite Collaborators"
            >
              <UserPlus size={14} />
              <span>Invite</span>
            </button>

            {/* Dynamic Theme Switcher */}
            <button 
              className="glass-button"
              style={{ 
                padding: '0.5rem', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                width: '32px',
                height: '32px'
              }}
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Live presence tracking collaborators online */}
            <PresenceBar 
              currentPage={getPageKey()} 
              activeTaskId={null} 
            />

            {/* Notification bell and float toasts */}
            <Notifications />
          </div>
        </header>

        {/* Dynamic page contents outlets */}
        <div className="page-content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Subscription Billing Modal alert */}
      {showBillingAlert && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="glass-panel modal-content animate-fade" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
            <button className="modal-close" onClick={() => setShowBillingAlert(false)}>
              <X size={18} />
            </button>
            <ShieldAlert size={42} style={{ color: 'hsl(var(--accent-amber))', marginBottom: '1rem', marginInline: 'auto' }} />
            <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Workspace Locked</h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4', marginBottom: '1.5rem' }}>
              Accessing multi-workspaces requires a premium **Pro Tier** subscription. Upgrade your workspace tier in the sandboxed Billing panel instantly.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <Link 
                to="/billing" 
                onClick={() => setShowBillingAlert(false)}
                className="glass-button primary" 
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                Upgrade to Pro
              </Link>
              <button 
                onClick={() => setShowBillingAlert(false)}
                className="glass-button" 
                style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateWorkspace && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="glass-panel modal-content animate-fade" style={{ maxWidth: '450px', padding: '2rem' }}>
            <button className="modal-close" onClick={() => setShowCreateWorkspace(false)}>
              <X size={18} />
            </button>
            <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'hsl(var(--primary))' }} /> Create New Workspace
            </h3>
            <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Workspace Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={newWorkspaceName} 
                  onChange={(e) => setNewWorkspaceName(e.target.value)} 
                  placeholder="e.g. Hackathon Team Alpha"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Description</label>
                <textarea 
                  className="glass-input" 
                  value={newWorkspaceDesc} 
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)} 
                  placeholder="What is this workspace organization about?"
                  rows={3}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="glass-button primary" style={{ flex: 1, justifyContent: 'center' }}>Create</button>
                <button type="button" className="glass-button" onClick={() => setShowCreateWorkspace(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="glass-panel modal-content animate-fade" style={{ maxWidth: '450px', padding: '2rem' }}>
            <button className="modal-close" onClick={() => setShowCreateProject(false)}>
              <X size={18} />
            </button>
            <h3 style={{ color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FolderGit2 size={18} style={{ color: 'hsl(var(--primary))' }} /> Create New Project
            </h3>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Project Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)} 
                  placeholder="e.g. Mobile Application Core"
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Description</label>
                <textarea 
                  className="glass-input" 
                  value={newProjectDesc} 
                  onChange={(e) => setNewProjectDesc(e.target.value)} 
                  placeholder="Project details..."
                  rows={3}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="glass-button primary" style={{ flex: 1, justifyContent: 'center' }}>Create Project</button>
                <button type="button" className="glass-button" onClick={() => setShowCreateProject(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Members Modal */}
      {showInviteModal && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="glass-panel modal-content animate-fade" style={{ maxWidth: '450px', padding: '2rem' }}>
            <button 
              className="modal-close" 
              onClick={() => { 
                setShowInviteModal(false); 
                setInviteSent(false); 
                setInviteName(''); 
                setInviteEmail(''); 
              }}
            >
              <X size={18} />
            </button>

            {inviteSent ? (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid hsl(var(--accent-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--accent-emerald))', marginBottom: '0.5rem' }}>
                  <Sparkles size={24} />
                </div>
                <h3 style={{ color: 'white' }}>Invitation Sent!</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                  An official workspace email invitation has been sent to <strong style={{ color: 'white' }}>{inviteEmail}</strong> containing their custom secure join link.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%', textAlign: 'left', marginTop: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontWeight: 600 }}>Local Testing Link:</span>
                  <p style={{ fontSize: '0.65rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.3', marginBottom: '0.2rem' }}>
                    Copy this link and open it in a **new browser tab/window** to simulate Jane accepting the email invite locally:
                  </p>
                  <input 
                    type="text" 
                    readOnly 
                    className="glass-input"
                    value={`${window.location.origin}/?invite=${currentWorkspaceId}&role=${inviteRole}&name=${encodeURIComponent(inviteName)}`}
                    style={{ fontSize: '0.7rem', fontFamily: 'monospace', padding: '0.4rem', width: '100%' }}
                    onClick={(e) => e.target.select()}
                  />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/?invite=${currentWorkspaceId}&role=${inviteRole}&name=${encodeURIComponent(inviteName)}`);
                      alert('Join link copied to clipboard!');
                    }}
                    className="glass-button primary" 
                    style={{ fontSize: '0.75rem', padding: '0.35rem', justifyContent: 'center', marginTop: '0.25rem' }}
                  >
                    Copy Join Link
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                  <button 
                    className="glass-button primary" 
                    onClick={() => { setInviteSent(false); setInviteName(''); setInviteEmail(''); }} 
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                  >
                    Invite Someone Else
                  </button>
                  <button 
                    className="glass-button" 
                    onClick={() => { 
                      setShowInviteModal(false); 
                      setInviteSent(false); 
                      setInviteName(''); 
                      setInviteEmail(''); 
                    }} 
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Invite via Email Link
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                  Send an official email containing a secure verification join link to add members to this workspace.
                </p>
                <form onSubmit={handleSendEmailInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Full Name of Invitee</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      value={inviteName} 
                      onChange={(e) => setInviteName(e.target.value)} 
                      placeholder="e.g. Jane Doe"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Email Address</label>
                    <input 
                      type="email" 
                      className="glass-input" 
                      value={inviteEmail} 
                      onChange={(e) => setInviteEmail(e.target.value)} 
                      placeholder="e.g. jane@devcollab.com"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Workspace Role</label>
                    <select 
                      className="glass-input"
                      value={inviteRole} 
                      onChange={(e) => setInviteRole(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <option value="Admin" style={{ background: '#1e293b' }}>Admin</option>
                      <option value="Member" style={{ background: '#1e293b' }}>Member</option>
                      <option value="Viewer" style={{ background: '#1e293b' }}>Viewer</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <button type="submit" className="glass-button primary" style={{ flex: 1, justifyContent: 'center' }}>
                      Send Email Invite
                    </button>
                    <button 
                      type="button" 
                      className="glass-button" 
                      onClick={() => { setShowInviteModal(false); setInviteName(''); setInviteEmail(''); }} 
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" style={{ zIndex: 200 }}>
          <div className="glass-panel modal-content animate-fade" style={{ maxWidth: '480px', padding: '2rem' }}>
            <button className="modal-close" onClick={() => setShowProfileModal(false)}>
              <X size={18} />
            </button>
            <h3 style={{ color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Edit Developer Profile
            </h3>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Display Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={profName} 
                  onChange={(e) => setProfName(e.target.value)} 
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Short Bio</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={profBio} 
                  onChange={(e) => setProfBio(e.target.value)} 
                  placeholder="e.g. Frontend developer, React builder"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Skills (comma-separated)</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={profSkills} 
                  onChange={(e) => setProfSkills(e.target.value)} 
                  placeholder="e.g. React, CSS, Python, Go"
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>GitHub Username</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={profGithub} 
                  onChange={(e) => setProfGithub(e.target.value)} 
                  placeholder="e.g. kabir-m"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="glass-button primary" style={{ flex: 1, justifyContent: 'center' }}>Save Profile</button>
                <button type="button" className="glass-button" onClick={() => setShowProfileModal(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export { App };
