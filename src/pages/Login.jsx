import React, { useState, useEffect } from 'react';
import { useStore } from '../store/store';
import { 
  FolderGit2, KeyRound, Mail, Sparkles, User, Eye, EyeOff, 
  Terminal, ArrowRight, Github, ChevronRight, Layout, Code, History, FileText,
  Sun, Moon
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Login() {
  const members = useStore(state => state.members);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  const addMember = useStore(state => state.addMember);
  const logActivity = useStore(state => state.logActivity);
  const theme = useStore(state => state.theme);
  const toggleTheme = useStore(state => state.toggleTheme);

  // Sync theme with body class dynamically on Login page
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Toggle mode: 'login' or 'signup'
  const [mode, setMode] = useState('login');

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [role, setRole] = useState('Member');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Autofill form using active team personas for quick grading
  const handleSelectPersona = (member) => {
    setMode('login');
    setEmail(member.email);
    setPassword('devcollab123'); // Standard default pass
    setErrorMsg('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setLoading(false);
      
      if (mode === 'login') {
        const matchedUser = members.find(m => m.email.toLowerCase() === email.toLowerCase());

        if (matchedUser) {
          // Success Log In
          setCurrentUser(matchedUser.id);
          logActivity(`${matchedUser.name} signed into the platform.`);
          
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 }
          });
        } else {
          setErrorMsg('No user account discovered matching this email. Create one on the Sign Up tab!');
        }
      } else {
        // Sign Up Mode
        if (!displayName.trim()) {
          setErrorMsg('Display Name is required to sign up.');
          return;
        }

        const emailLower = email.trim().toLowerCase();
        const existing = members.find(m => m.email.toLowerCase() === emailLower);

        if (existing) {
          setErrorMsg('An account is already registered to this email. Navigate to Sign In.');
          return;
        }

        // Add new member to dynamic state
        const newUserId = `usr-${Date.now()}`;
        const initials = displayName
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        const newMember = {
          id: newUserId,
          name: displayName,
          role: role,
          email: emailLower,
          avatar: initials || 'CD',
          bio: 'Platform user registered dynamically via Sign Up form.',
          github: githubLink.trim() || 'github.com'
        };

        addMember(newMember);
        setCurrentUser(newUserId);
        logActivity(`${newMember.name} successfully registered a new account.`);

        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme === 'dark' ? '#05070c' : '#f1f5f9',
      display: 'flex',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      zIndex: 1000
    }}>
      {/* BACKGROUND MOVING ANIMATION VECTORS */}
      
      {/* 1. Slow-Panning Grid Overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: theme === 'dark' 
          ? 'radial-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px)' 
          : 'radial-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        animation: 'panGrid 30s linear infinite',
        opacity: 0.8,
        zIndex: 1
      }} />

      {/* 2. Floating Cyan Glow Sphere */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: theme === 'dark'
          ? 'radial-gradient(circle, rgba(6, 182, 212, 0.13) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)',
        animation: 'floatSphere1 24s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* 3. Floating Violet Glow Sphere */}
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: theme === 'dark'
          ? 'radial-gradient(circle, rgba(139, 92, 246, 0.13) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)',
        animation: 'floatSphere2 28s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* 4. Floating Green/Teal Glow Sphere */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: theme === 'dark'
          ? 'radial-gradient(circle, rgba(16, 185, 129, 0.06) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(236, 72, 153, 0.03) 0%, transparent 70%)',
        animation: 'floatSphere3 20s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 2
      }} />

      {/* Dynamic Theme Switcher at Top-Right */}
      <button
        onClick={toggleTheme}
        className="glass-button"
        style={{
          position: 'absolute',
          top: '2.5rem',
          right: '3rem',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(15,23,42,0.08)',
          background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)',
          cursor: 'pointer',
          zIndex: 100,
          transition: 'all 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) rotate(15deg)';
          e.currentTarget.style.boxShadow = theme === 'dark' 
            ? '0 0 15px rgba(6, 182, 212, 0.4)' 
            : '0 0 15px rgba(139, 92, 246, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {theme === 'dark' ? (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="hsl(190, 95%, 50%)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ display: 'block', transition: 'all 0.2s ease' }}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="hsl(262, 83%, 58%)" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ display: 'block', transition: 'all 0.2s ease' }}
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </button>

      {/* STUNNING FULL-SCREEN SPLIT SCREEN LAYOUT */}
      <div style={{ display: 'flex', width: '100%', height: '100%', zIndex: 10, position: 'relative' }}>
        
        {/* LEFT COLUMN: VISUAL FEATURE SHOWCASE PANE (55% Width) */}
        <div style={{
          flex: 1.2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem 5rem',
          borderRight: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(15, 23, 42, 0.08)',
          background: theme === 'dark' ? 'rgba(5, 8, 16, 0.55)' : 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Brand Logo */}
          <div style={{ position: 'absolute', top: '3rem', left: '5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FolderGit2 className="logo-icon" size={28} style={{ color: theme === 'dark' ? 'hsl(190, 95%, 50%)' : 'hsl(262, 83%, 58%)' }} />
            <h1 className="logo-title" style={{ fontSize: '1.4rem', letterSpacing: '-0.03em' }}>DevCollab</h1>
          </div>

          {/* Core Tagline Header */}
          <div style={{ maxWidth: '520px', marginBottom: '2.5rem', marginTop: '1rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: theme === 'dark' ? 'hsl(190, 95%, 50%)' : 'hsl(262, 83%, 58%)',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              display: 'block',
              marginBottom: '0.65rem'
            }}>
              Next-Gen Developer workspace
            </span>
            <h2 style={{
              fontSize: '2.4rem',
              fontWeight: 800,
              color: theme === 'dark' ? 'white' : '#0f172a',
              lineHeight: '1.25',
              marginBottom: '1rem',
              fontFamily: 'Outfit, sans-serif'
            }}>
              GitHub-meets-Notion-meets-Slack
            </h2>
            <p style={{ color: theme === 'dark' ? 'hsl(var(--text-secondary))' : '#334155', fontSize: '0.95rem', lineHeight: '1.6' }}>
              A premium, high-fidelity collaborative workspace. Manage task kanbans, write rich wiki pages, index shared snippets, and execute simulated AI reviews—all synced in real-time.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: AUTHENTICATION CARD PANEL (45% Width) */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem 3rem'
        }}>
          <div 
            className="glass-panel animate-fade"
            style={{
              width: '100%',
              maxWidth: '430px',
              padding: '2rem',
              border: theme === 'dark' ? '1.5px solid rgba(6, 182, 212, 0.25)' : '1.5px solid rgba(139, 92, 246, 0.2)',
              boxShadow: theme === 'dark' 
                ? '0 30px 70px -10px rgba(0,0,0,0.95), 0 0 60px rgba(6, 182, 212, 0.15)' 
                : '0 30px 70px -10px rgba(15,23,42,0.1), 0 0 40px rgba(139, 92, 246, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              position: 'relative'
            }}
          >
            {/* Mode Dual Tabs switcher */}
            <div style={{ 
              display: 'flex', 
              background: theme === 'dark' ? 'rgba(15,23,42,0.4)' : 'rgba(15,23,42,0.04)', 
              padding: '0.25rem', 
              borderRadius: '8px', 
              border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(15, 23, 42, 0.08)' 
            }}>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '0.45rem',
                  fontSize: '0.8rem',
                  border: 'none',
                  background: mode === 'login' ? 'linear-gradient(135deg, hsl(262, 83%, 60%), hsl(190, 95%, 50%))' : 'transparent',
                  color: mode === 'login' ? 'white' : (theme === 'dark' ? 'hsl(var(--text-secondary))' : 'rgba(15, 23, 42, 0.65)'),
                  fontWeight: mode === 'login' ? '600' : 'normal',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  padding: '0.45rem',
                  fontSize: '0.8rem',
                  border: 'none',
                  background: mode === 'signup' ? 'linear-gradient(135deg, hsl(262, 83%, 60%), hsl(190, 95%, 50%))' : 'transparent',
                  color: mode === 'signup' ? 'white' : (theme === 'dark' ? 'hsl(var(--text-secondary))' : 'rgba(15, 23, 42, 0.65)'),
                  fontWeight: mode === 'signup' ? '600' : 'normal',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <h3 style={{ 
                color: theme === 'dark' ? 'white' : 'hsl(var(--text-primary))', 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.08)', 
                paddingBottom: '0.4rem' 
              }}>
                {mode === 'login' ? 'Account Log In' : 'Create New Account'}
              </h3>

              {errorMsg && (
                <div style={{ color: 'hsl(0, 84%, 60%)', fontSize: '0.75rem', background: 'rgba(239,68,68,0.1)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  {errorMsg}
                </div>
              )}

              {/* Display Name (Sign Up only) */}
              {mode === 'signup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Display Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                    <input
                      type="text"
                      placeholder=""
                      className="glass-input"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                  <input
                    type="email"
                    placeholder="developer@devcollab.com"
                    className="glass-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="glass-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: '2.2rem', fontSize: '0.85rem' }}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'hsl(var(--text-muted))',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* GitHub & Role selects (Sign Up only) */}
              {mode === 'signup' && (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>GitHub Username (optional)</label>
                    <div style={{ position: 'relative' }}>
                      <Github size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                      <input
                        type="text"
                        placeholder=""
                        className="glass-input"
                        value={githubLink}
                        onChange={(e) => setGithubLink(e.target.value)}
                        style={{ width: '100%', paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>Workspace Role</label>
                    <select
                      className="glass-input"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      <option value="Admin" style={{ background: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>Admin</option>
                      <option value="Member" style={{ background: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>Member (Default)</option>
                      <option value="Viewer" style={{ background: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#000000' }}>Viewer (Read-only)</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '0.7rem',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem',
                  gap: '0.4rem',
                  background: 'linear-gradient(135deg, hsl(262, 83%, 60%), hsl(190, 95%, 50%))',
                  border: 'none',
                  color: 'white',
                  boxShadow: theme === 'dark' 
                    ? '0 4px 15px rgba(6, 182, 212, 0.35)' 
                    : '0 4px 15px rgba(139, 92, 246, 0.25)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center'
                }}
                disabled={loading}
              >
                <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* DEMO MODE CAPSULE TRIGGER */}
            <div style={{ 
              borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(15,23,42,0.08)', 
              paddingTop: '1rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.65rem', 
              alignItems: 'center' 
            }}>
              <button
                type="button"
                onClick={() => setShowDevPanel(!showDevPanel)}
                className="glass-button animate-pulse-demo"
                style={{
                  padding: '0.65rem 1.6rem',
                  fontSize: '0.9rem',
                  fontWeight: '800',
                  gap: '0.5rem',
                  border: theme === 'dark' ? '1.5px solid hsl(190, 95%, 50%)' : '1.5px solid hsl(262, 83%, 58%)',
                  borderRadius: '30px',
                  background: theme === 'dark' 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(6, 182, 212, 0.15))' 
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.05))',
                  color: theme === 'dark' ? 'hsl(var(--text-primary))' : 'hsl(262, 83%, 58%)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  width: '100%',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = theme === 'dark' ? '1.5px solid hsl(262, 83%, 64%)' : '1.5px solid hsl(262, 83%, 58%)';
                  e.currentTarget.style.boxShadow = theme === 'dark' ? '0 0 25px rgba(6, 182, 212, 0.65)' : '0 0 20px rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.background = theme === 'dark' 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.28), rgba(6, 182, 212, 0.25))'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.12))';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = theme === 'dark' ? '1.5px solid hsl(190, 95%, 50%)' : '1.5px solid hsl(262, 83%, 58%)';
                  e.currentTarget.style.background = theme === 'dark' 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.18), rgba(6, 182, 212, 0.15))' 
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.05))';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <Terminal size={14} style={{ color: theme === 'dark' ? 'hsl(190, 95%, 50%)' : 'hsl(262, 83%, 58%)' }} />
                <span>{showDevPanel ? 'Hide Demo Accounts' : '⚡ Launch Demo Mode'}</span>
              </button>

              {showDevPanel && (
                <div 
                  className="glass-panel animate-fade" 
                  style={{ 
                    width: '100%',
                    padding: '0.85rem', 
                    background: theme === 'dark' ? 'rgba(10,15,30,0.5)' : 'rgba(255,255,255,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    border: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.08)'
                  }}
                >
                  <span style={{ fontSize: '0.7rem', color: theme === 'dark' ? 'hsl(var(--text-muted))' : 'rgba(15,23,42,0.5)', fontWeight: 600, display: 'block', textAlign: 'center' }}>
                    QUICK AUTHENTICATION SELECTORS
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {members.slice(0, 4).map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleSelectPersona(member)}
                        className="glass-button"
                        style={{
                          padding: '0.35rem 0.5rem',
                          fontSize: '0.7rem',
                          justifyContent: 'flex-start',
                          gap: '0.4rem',
                          textAlign: 'left',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <div className="avatar" style={{ width: '18px', height: '18px', fontSize: '0.55rem', flexShrink: 0 }}>
                          {member.avatar}
                        </div>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{member.name.split(' ')[0]} ({member.role})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export { Login };
