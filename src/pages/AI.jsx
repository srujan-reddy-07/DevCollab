import React, { useState } from 'react';
import { useStore } from '../store/store';
import { usePresence } from '../hooks/usePresence';
import { useMockAI } from '../hooks/useMockAI';
import { Sparkles, Terminal, FileCheck2, Cpu, CheckSquare, Plus, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AI() {
  const tasks = useStore(state => state.tasks);
  const currentProjectId = useStore(state => state.currentProjectId);
  const proUser = useStore(state => state.proUser);
  const addTask = useStore(state => state.addTask);

  const [activeTab, setActiveTab] = useState('assistant');
  const { loading, summarizeProject, checkBlockers, generateStandupReport, generateTaskBreakdown, reviewCode } = useMockAI();

  // Assistant output state
  const [assistantOutput, setAssistantOutput] = useState('');
  
  // Task breakdown output
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [featureName, setFeatureName] = useState('');

  // Code reviewer states
  const [codeSnippet, setCodeSnippet] = useState('');
  const [language, setLanguage] = useState('JS');
  const [reviewResult, setReviewResult] = useState(null);

  // Broadcast presence on AI page
  usePresence('ai_assistant', null);

  const handleRunAssistant = async (actionType) => {
    // Pro limit check
    if (!proUser) {
      setAssistantOutput('⚠️ **AI Features are locked on the Free Tier.**\n\nAI Project Assistant summaries and Standup reports require a **Pro Tier** subscription. Navigate to the **Billing** page to unlock sandbox access instantly.');
      return;
    }

    // Filter tasks belonging only to this project
    const projectTasks = tasks.filter(t => t.projectId === currentProjectId);

    let result = '';
    if (actionType === 'summarize') {
      result = await summarizeProject(projectTasks);
    } else if (actionType === 'blockers') {
      result = await checkBlockers(projectTasks);
    } else if (actionType === 'standup') {
      result = await generateStandupReport(projectTasks);
    }
    setAssistantOutput(result);
    setGeneratedTasks([]);
  };

  const handleGenerateBreakdown = async (e) => {
    e.preventDefault();
    if (!proUser) {
      setAssistantOutput('⚠️ **AI Features are locked on the Free Tier.**\n\nTask breakdown generations require a **Pro Tier** subscription. Navigate to the **Billing** page to unlock sandbox access instantly.');
      return;
    }
    if (!featureName.trim()) return;

    const subtasks = await generateTaskBreakdown(featureName);
    setGeneratedTasks(subtasks);
    setAssistantOutput(`### 🛠️ Generated Task Breakdown: "${featureName}"\nReview the subtasks in the right panel and add them directly to your active Kanban board.`);
  };

  const handleAddTasksToBoard = () => {
    if (generatedTasks.length === 0) return;
    
    generatedTasks.forEach((task, index) => {
      addTask({
        id: `task-ai-${Date.now()}-${index}`,
        projectId: currentProjectId,
        title: task.title,
        description: task.description,
        assigneeId: null,
        status: 'To Do',
        priority: task.priority,
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days out
        tags: task.tags,
        comments: []
      });
    });

    setGeneratedTasks([]);
    setFeatureName('');
    setAssistantOutput('✅ **Tasks added successfully!** 6 structured tasks have been appended to your **To Do** column on the Kanban board.');
  };

  const handleRunReview = async () => {
    if (!proUser) {
      setReviewResult({
        score: 0,
        feedback: '⚠️ **AI Code Reviewer is locked on the Free Tier.**\n\nCode analysis requires a **Pro Tier** subscription. Navigate to the **Billing** page to unlock sandbox access instantly.'
      });
      return;
    }

    const review = await reviewCode(codeSnippet, language);
    setReviewResult(review);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} className="logo-icon" /> AI Assistant & Reviewer
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
            Leverage client-side AI analytics to review code or generate workspace backlogs.
          </p>
        </div>

        {/* Pro Banner */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '0.4rem 1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            border: proUser ? '1px solid hsl(var(--accent-emerald) / 0.3)' : '1px solid rgba(255,255,255,0.06)',
            background: proUser ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)'
          }}
        >
          <span style={{ fontSize: '0.75rem', color: proUser ? 'hsl(var(--accent-emerald))' : 'hsl(var(--text-muted))' }}>
            Tier: <strong>{proUser ? 'PRO ACTIVE' : 'FREE PREVIEW'}</strong>
          </span>
          {!proUser && (
            <Link to="/billing" className="glass-button primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.65rem', borderRadius: '4px' }}>
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('assistant')}
          className={`glass-button ${activeTab === 'assistant' ? 'primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Sparkles size={14} /> AI Project Assistant
        </button>
        <button 
          onClick={() => setActiveTab('reviewer')}
          className={`glass-button ${activeTab === 'reviewer' ? 'primary' : ''}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Terminal size={14} /> AI Code Reviewer
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'assistant' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem', alignItems: 'start' }} className="animate-fade">
          {/* Controls Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>Quick Summaries</span>
              <button 
                onClick={() => handleRunAssistant('summarize')}
                className="glass-button" 
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem' }}
                disabled={loading}
              >
                📊 Summarise this project
              </button>
              <button 
                onClick={() => handleRunAssistant('blockers')}
                className="glass-button" 
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem' }}
                disabled={loading}
              >
                ⚠️ What's blocking us?
              </button>
              <button 
                onClick={() => handleRunAssistant('standup')}
                className="glass-button" 
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.8rem' }}
                disabled={loading}
              >
                📝 Generate standup report
              </button>
            </div>

            {/* Task Breakdown Form */}
            <form 
              onSubmit={handleGenerateBreakdown} 
              className="glass-panel" 
              style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white' }}>Backlog Generator</span>
              <p style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', lineHeight: '1.3' }}>
                Enter a feature concept, and AI will construct a 6-part task breakdown.
              </p>
              <input 
                type="text" 
                placeholder="e.g. Build a user login system" 
                className="glass-input"
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                required
                style={{ fontSize: '0.8rem' }}
              />
              <button 
                type="submit" 
                className="glass-button primary" 
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                disabled={loading}
              >
                ⚡ Generate Task Breakdown
              </button>
            </form>
          </div>

          {/* Outputs Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              AI Assistant Console
            </span>

            {loading ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'hsl(var(--text-muted))' }}>
                <Cpu size={24} style={{ animation: 'spin 2s linear infinite' }} />
                <span style={{ fontSize: '0.85rem' }}>AI is analyzing project workspace logs...</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: generatedTasks.length > 0 ? '1.2fr 1fr' : '1fr', gap: '1.5rem', flex: 1 }}>
                {/* AI Markdown details output */}
                <div 
                  className="tiptap"
                  style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
                  dangerouslySetInnerHTML={{ 
                    __html: assistantOutput 
                      ? assistantOutput
                          .replace(/^### (.*$)/gim, '<h3 style="color:white; margin-bottom:0.5rem; margin-top:1rem;">$1</h3>')
                          .replace(/^\*\*([^*]*)\*\*/gim, '<strong style="color:white;">$1</strong>')
                          .replace(/^\* (.*$)/gim, '<li style="margin-left:1rem; margin-bottom:0.25rem;">$1</li>')
                          .replace(/\n/g, '<br />')
                      : '<p style="color:hsl(var(--text-muted)); font-style:italic;">Choose an action on the left to invoke the AI assistant.</p>'
                  }}
                />

                {/* Subtask additions list panel */}
                {generatedTasks.length > 0 && (
                  <div 
                    className="glass-panel animate-fade" 
                    style={{ 
                      padding: '1rem', 
                      background: 'rgba(255,255,255,0.01)', 
                      border: '1px solid rgba(255,255,255,0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <CheckSquare size={13} style={{ color: 'hsl(var(--primary))' }} /> Subtask Preview
                    </span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '250px', overflowY: 'auto' }}>
                      {generatedTasks.map((t, i) => (
                        <div 
                          key={i} 
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.04)',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                          }}
                        >
                          <span style={{ color: 'white', fontWeight: 500, display: 'block' }}>{t.title}</span>
                          <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))' }}>Priority: {t.priority}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={handleAddTasksToBoard}
                      className="glass-button primary" 
                      style={{ fontSize: '0.75rem', width: '100%', justifyContent: 'center', padding: '0.4rem' }}
                    >
                      <Plus size={12} /> Add all tasks to Board
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', alignItems: 'start' }} className="animate-fade">
          {/* Input paste box */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>Paste Source Code</span>
              
              {/* Language selection dropdown */}
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)} 
                className="glass-input"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                <option value="JS" style={{ background: '#1e293b' }}>JavaScript</option>
                <option value="Python" style={{ background: '#1e293b' }}>Python</option>
                <option value="Go" style={{ background: '#1e293b' }}>GoLang</option>
                <option value="Java" style={{ background: '#1e293b' }}>Java</option>
                <option value="C++" style={{ background: '#1e293b' }}>C++</option>
              </select>
            </div>

            <textarea 
              className="glass-input" 
              rows={12}
              value={codeSnippet} 
              onChange={(e) => setCodeSnippet(e.target.value)} 
              placeholder="Paste code snippet here..."
              style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.8rem', resize: 'vertical' }}
            />

            <button 
              onClick={handleRunReview}
              className="glass-button primary" 
              style={{ justifyContent: 'center', fontSize: '0.85rem' }}
              disabled={loading}
            >
              🚀 Analyze Code Quality
            </button>
          </div>

          {/* Feedback Outputs */}
          <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '400px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              Review Output Console
            </span>

            {loading ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'hsl(var(--text-muted))' }}>
                <Cpu size={24} style={{ animation: 'spin 2s linear infinite' }} />
                <span style={{ fontSize: '0.85rem' }}>Reviewer is parsing ast nodes and patterns...</span>
              </div>
            ) : reviewResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', flex: 1 }}>
                {/* Score Dial */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div 
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: reviewResult.score >= 8 
                        ? 'linear-gradient(135deg, hsl(var(--accent-emerald)), #10b981)'
                        : reviewResult.score >= 5 
                          ? 'linear-gradient(135deg, hsl(var(--accent-amber)), #f59e0b)'
                          : 'linear-gradient(135deg, hsl(var(--secondary)), #ef4444)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'white',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    {reviewResult.score}
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white', display: 'block' }}>Code Quality Score</span>
                    <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))' }}>Rating: {reviewResult.score >= 8 ? 'Excellent' : reviewResult.score >= 5 ? 'Fair' : 'Requires Work'}</span>
                  </div>
                </div>

                {/* Review Text */}
                <div 
                  className="tiptap"
                  style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
                  dangerouslySetInnerHTML={{ 
                    __html: reviewResult.feedback
                      .replace(/^### (.*$)/gim, '<h3 style="color:white; margin-bottom:0.5rem; margin-top:0.75rem;">$1</h3>')
                      .replace(/^#### (.*$)/gim, '<h4 style="color:hsl(var(--text-secondary)); font-size:0.85rem; margin-top:0.6rem; margin-bottom:0.4rem;">$1</h4>')
                      .replace(/^\* (.*$)/gim, '<li style="margin-left:1rem; margin-bottom:0.25rem;">$1</li>')
                      .replace(/\n/g, '<br />')
                  }}
                />
              </div>
            ) : (
              <p style={{ color: 'hsl(var(--text-muted))', fontStyle: 'italic', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Paste some code on the left and click analyze to start a static review.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export { AI };
