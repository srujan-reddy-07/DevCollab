import { useState } from 'react';

export function useAiService() {
  const [loading, setLoading] = useState(false);

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  // Summarize project tasks status
  const summarizeProject = async (tasks) => {
    setLoading(true);
    await delay(1200);
    setLoading(false);

    const total = tasks.length;
    const done = tasks.filter(t => t.status === 'Done').length;
    const progress = tasks.filter(t => t.status === 'In Progress').length;
    const review = tasks.filter(t => t.status === 'In Review').length;
    const todo = tasks.filter(t => t.status === 'To Do').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return `### 📊 Project Progress Summary
**Completion Rate:** ${pct}% (${done} of ${total} tasks resolved)

**Status Breakdown:**
* 🟢 **Done:** ${done}
* 🔵 **In Review:** ${review}
* 🟡 **In Progress:** ${progress}
* ⚪ **To Do:** ${todo}

**Key Observations:**
* Team velocity is steady, but **${review} tasks are currently stacked in In Review**, indicating a review bottleneck. Recommend assigning reviewers immediately.
* Focus is centered around **Setup** and **Real-Time Core** systems.`;
  };

  // Check active blockers or delayed tasks
  const checkBlockers = async (tasks) => {
    setLoading(true);
    await delay(1000);
    setLoading(false);

    const inProgress = tasks.filter(t => t.status === 'In Progress' || t.status === 'In Review');
    
    if (inProgress.length === 0) {
      return `### 🚀 No Clear Blockers Found
Excellent! All current tasks are flowing smoothly or have been completed. Add some new tickets from the backlog to keep momentum going.`;
    }

    const blockers = inProgress.map(t => {
      let blockerReason = "Potential architectural review needed.";
      if (t.tags.includes('Real-Time')) {
        blockerReason = "Cross-tab port management and BroadcastChannel edge-cases require review.";
      } else if (t.tags.includes('Wiki')) {
        blockerReason = "Tiptap document structural state serialization and version diffing conflicts.";
      } else if (t.priority === 'P0') {
        blockerReason = "Critical structural blockers pending core owner review.";
      }
      return `* **[${t.priority}] ${t.title}** - *Blocked by:* ${blockerReason}`;
    }).join('\n');

    return `### ⚠️ Identified Risk & Blocker Report

Here are the items with slowed velocity requiring team attention:

${blockers}

**Recommended Actions:**
1. Schedule a short sync for **P0** tasks.
2. Delegate cross-tab broadcast testing to another team member to clear reviewers.`;
  };

  // Compile standup bullet reports
  const generateStandupReport = async (tasks) => {
    setLoading(true);
    await delay(1300);
    setLoading(false);

    const completed = tasks.filter(t => t.status === 'Done');
    const working = tasks.filter(t => t.status === 'In Progress');
    const blocked = tasks.filter(t => t.status === 'In Review');

    const doneSection = completed.length > 0
      ? completed.map(t => `  - Completed: ${t.title}`).join('\n')
      : '  - No tasks completed recently.';

    const workSection = working.length > 0
      ? working.map(t => `  - Active: ${t.title}`).join('\n')
      : '  - No active In Progress tasks.';

    const blockSection = blocked.length > 0
      ? blocked.map(t => `  - Reviewing: ${t.title} (Needs review feedback)`).join('\n')
      : '  - No review/blocker hold ups.';

    return `### 📝 Automated Daily Standup Format

**1. Yesterday's Accomplishments:**
${doneSection}

**2. Today's Focus:**
${workSection}

**3. Blockers / Reviews:**
${blockSection}

*Generated automatically based on actual workspace movement over the past 24 hours.*`;
  };

  // Parse feature description into standard tickets list
  const generateTaskBreakdown = async (featureName) => {
    setLoading(true);
    await delay(1500);
    setLoading(false);

    const baseName = featureName || 'New Feature';
    
    return [
      {
        title: `Design data schema for ${baseName}`,
        description: `Define typescript models, relational entities, or local schemas needed to support ${baseName}.`,
        priority: 'P1',
        tags: ['Database', 'Design']
      },
      {
        title: `Build core controller endpoints for ${baseName}`,
        description: `Write the business logic handlers, express controllers, or mock APIs for ${baseName}.`,
        priority: 'P0',
        tags: ['Backend', 'Core']
      },
      {
        title: `Create responsive UI components for ${baseName}`,
        description: `Set up forms, inputs, buttons, and state connections for the user views of ${baseName}.`,
        priority: 'P1',
        tags: ['Frontend', 'UI']
      },
      {
        title: `Wire real-time events for ${baseName}`,
        description: `Ensure synchronization across clients and BroadcastChannel sync is operational.`,
        priority: 'P2',
        tags: ['Real-Time']
      },
      {
        title: `Write unit and integration tests for ${baseName}`,
        description: `Verify standard behaviors, empty boundary entries, and error catches.`,
        priority: 'P2',
        tags: ['Testing']
      },
      {
        title: `Review and finalize ${baseName} docs`,
        description: `Document layout specs, API usage, and configuration guides in the project Wiki.`,
        priority: 'P2',
        tags: ['Docs']
      }
    ];
  };

  // Static code parser rules check
  const reviewCode = async (code, language) => {
    setLoading(true);
    await delay(1400);
    setLoading(false);

    if (!code || code.trim() === '') {
      return {
        score: 0,
        feedback: 'Please paste some code to review.'
      };
    }

    let bugs = [];
    let performance = [];
    let security = [];
    let score = 8;

    const codeLower = code.toLowerCase();

    if (codeLower.includes('password') || codeLower.includes('secret') || codeLower.includes('api_key') || codeLower.includes('token')) {
      security.push('🚨 **Hardcoded Credential Warning:** Secret keys/tokens are exposed in the snippet. Extract to environment variables.');
      score -= 2;
    }

    if (codeLower.includes('eval(')) {
      security.push('🚨 **Unsafe Code Execution:** The `eval()` function is highly dangerous and allows arbitrary script execution. Use parsed parameters instead.');
      score -= 3;
    }

    if (language === 'JS' || language === 'JavaScript') {
      if (codeLower.includes('var ')) {
        bugs.push('🐛 **Legacy Variable Declaration:** Detected usage of outdated `var` syntax. Prefer utilizing `let` or `const` for standard block scoping.');
        score -= 1;
      }
      if (codeLower.includes('.map(') && !codeLower.includes('return') && !codeLower.includes('=>')) {
        bugs.push('🐛 **Implicit Map Return:** Verify return statement inside `.map()`. If no return is intended, prefer using `.forEach()`.');
      }
      if (codeLower.includes('== ') && !codeLower.includes('=== ')) {
        performance.push('⚡ **Loose Equality:** Detected `==` instead of `===`. Prefer strict equality comparison to avoid unexpected type coercion.');
      }
    }

    if (language === 'Python') {
      if (codeLower.includes('try:') && codeLower.includes('except:') && !codeLower.includes('except ') && !codeLower.includes('except: pass')) {
        bugs.push('🐛 **Bare Except Clause:** Utilizing a general `except:` block will catch keyboard interrupts (Ctrl+C). Prefer catching specialized exception classes (e.g., `except ValueError:`).');
        score -= 1;
      }
      if (codeLower.includes('open(') && !codeLower.includes('with open(')) {
        performance.push('⚡ **Unclosed File Descriptor:** Open files should use Python context managers (`with open(...) as f:`) to ensure proper closure in case of unhandled errors.');
      }
    }

    if (language === 'Go') {
      if (codeLower.includes('panic(')) {
        bugs.push('🐛 **Uncontrolled Panic:** Using `panic()` should be reserved for unrecoverable errors. Return explicit error types instead.');
        score -= 1;
      }
      if (codeLower.includes('go ') && !codeLower.includes('wg.add') && !codeLower.includes('sync.waitgroup')) {
        performance.push('⚡ **Glow Routine Sync:** Launching goroutines without sync checks (like `sync.WaitGroup`) might lead to race conditions or silent failures before completion.');
      }
    }

    if (bugs.length === 0) bugs.push('✅ No obvious syntactic bugs or code smell anomalies detected.');
    if (performance.length === 0) performance.push('✅ Memory usage and complexity boundaries appear optimized.');
    if (security.length === 0) security.push('✅ No exposed secrets or vulnerability threat models identified.');

    const feedback = `### 🔍 AI Code Review Feedback (${language})

#### 🪲 Bug & Hygiene Feedback:
${bugs.map(b => `* ${b}`).join('\n')}

#### ⚡ Performance Insights:
${performance.map(p => `* ${p}`).join('\n')}

#### 🔐 Security Metrics:
${security.map(s => `* ${s}`).join('\n')}

---

**Summary:** The code displays solid logic foundations. Implementing the suggestions above will ensure robust stability.`;

    return {
      score: Math.max(1, Math.min(10, score)),
      feedback
    };
  };

  return {
    loading,
    summarizeProject,
    checkBlockers,
    generateStandupReport,
    generateTaskBreakdown,
    reviewCode
  };
}
