// Initial Seed Data for DevCollab

export const INITIAL_MEMBERS = [
  { id: 'usr-1', name: 'Ankush Sharma', role: 'Owner', email: 'ankush@devcollab.com', avatar: 'AS', bio: 'Full-stack builder & tech enthusiast.', github: 'github.com/ankush' },
  { id: 'usr-2', name: 'Riya Patel', role: 'Admin', email: 'riya@devcollab.com', avatar: 'RP', bio: 'Product architect and Scrum Master.', github: 'github.com/riya-p' },
  { id: 'usr-3', name: 'Jane Doe', role: 'Member', email: 'jane@devcollab.com', avatar: 'JD', bio: 'Frontend wizard, CSS magician.', github: 'github.com/jane-codes' },
  { id: 'usr-4', name: 'Kabir Mehta', role: 'Viewer', email: 'kabir@devcollab.com', avatar: 'KM', bio: 'Developer-in-training and debugger extraordinaire.', github: 'github.com/kabir-m' }
];

export const INITIAL_WORKSPACES = [
  { id: 'ws-1', name: 'DevCollab Workspace', description: 'Collaborative workspace hub for developers' },
  { id: 'ws-2', name: 'Acme Software', description: 'Main organization workspace' }
];

export const INITIAL_PROJECTS = [
  { id: 'proj-1', workspaceId: 'ws-1', name: 'DevCollab Web Platform', description: 'Vite-based frontend workspace portal' },
  { id: 'proj-2', workspaceId: 'ws-1', name: 'AI Core Microservice', description: 'Python LLM API integration server' },
  { id: 'proj-3', workspaceId: 'ws-2', name: 'Client Dashboard', description: 'Enterprise frontend layout portal' }
];

export const INITIAL_TASKS = [
  {
    id: 'task-1',
    projectId: 'proj-1',
    title: 'Initialize React + Vite structure',
    description: 'Set up Vite bundler, clean standard file paths, and CSS variables for Dark Glassmorphism.',
    assigneeId: 'usr-1',
    status: 'Done',
    priority: 'P0',
    dueDate: '2026-05-20',
    tags: ['Setup', 'Core'],
    comments: [
      { id: 'c1', userId: 'usr-2', text: 'Looks clean and minimal! Loving the custom CSS styles.', createdAt: '2026-05-19T14:30:00.000Z' }
    ]
  },
  {
    id: 'task-2',
    projectId: 'proj-1',
    title: 'Implement BroadcastChannel Cross-Tab Sync',
    description: 'Add standard multi-tab listener inside sync layer to propagate Board and Snippet changes smoothly.',
    assigneeId: 'usr-2',
    status: 'In Progress',
    priority: 'P0',
    dueDate: '2026-05-25',
    tags: ['Real-Time', 'Core'],
    comments: [
      { id: 'c2', userId: 'usr-1', text: '@Riya Patel please check if we need to fall back to standard localStorage whenBroadcastChannel is unavailable.', createdAt: '2026-05-24T10:00:00.000Z' }
    ]
  },
  {
    id: 'task-3',
    projectId: 'proj-1',
    title: 'Create rich text Wiki Notion clone',
    description: 'Integrate TipTap editor modules with heading formatting, clean blocks, and basic table rendering options.',
    assigneeId: 'usr-3',
    status: 'In Review',
    priority: 'P1',
    dueDate: '2026-05-28',
    tags: ['Wiki', 'Editor'],
    comments: []
  },
  {
    id: 'task-4',
    projectId: 'proj-1',
    title: 'Build AI Code Review Panel',
    description: 'Create code paste box supporting Python, JS, C++, Go, and returning structural security warnings.',
    assigneeId: 'usr-1',
    status: 'To Do',
    priority: 'P1',
    dueDate: '2026-05-30',
    tags: ['AI', 'Feature'],
    comments: []
  },
  {
    id: 'task-5',
    projectId: 'proj-2',
    title: 'Set up Flask microservice endpoint',
    description: 'Provide quick endpoint for mock LLM inputs and model weight setups.',
    assigneeId: 'usr-1',
    status: 'To Do',
    priority: 'P2',
    dueDate: '2026-06-05',
    tags: ['Backend', 'Python'],
    comments: []
  }
];

export const INITIAL_SNIPPETS = [
  {
    id: 'snip-1',
    projectId: 'proj-1',
    title: 'Quick Sort in Python',
    language: 'Python',
    description: 'Clean list-comprehension based sorting routine.',
    code: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)`,
    tags: ['algorithms', 'python']
  },
  {
    id: 'snip-2',
    projectId: 'proj-1',
    title: 'BroadcastChannel Sync Hook',
    language: 'JS',
    description: 'React hook for clean message passing across different browser tabs.',
    code: `import { useEffect } from 'react';

export function useSyncChannel(channelName, onMessage) {
  useEffect(() => {
    const channel = new BroadcastChannel(channelName);
    channel.onmessage = (event) => onMessage(event.data);
    return () => channel.close();
  }, [channelName, onMessage]);
}`,
    tags: ['react', 'web-api']
  }
];

export const INITIAL_DOCS = [
  {
    id: 'doc-1',
    projectId: 'proj-1',
    title: 'Getting Started Guide',
    content: '<h1>Getting Started</h1><p>Welcome to <strong>DevCollab</strong>! This project acts as your main team handbook. Check out the Task Board for active goals, or add code segments to the Snippets panel.</p><h2>Architecture</h2><p>The client interface uses Vite, React, Zustand, and styled Glassmorphism utilities.</p>',
    version: 1,
    history: [
      { version: 1, title: 'Getting Started Guide', content: '<h1>Getting Started</h1><p>Welcome to <strong>DevCollab</strong>! This project acts as your main team handbook. Check out the Task Board for active goals, or add code segments to the Snippets panel.</p><h2>Architecture</h2><p>The client interface uses Vite, React, Zustand, and styled Glassmorphism utilities.</p>', updatedAt: '2026-05-24T12:00:00.000Z', userId: 'usr-1' }
    ]
  }
];

export const INITIAL_FEEDS = [
  { id: 'feed-1', workspaceId: 'ws-1', userId: 'usr-1', text: 'Ankush Sharma initialized project DevCollab Web Platform', createdAt: '2026-05-24T12:00:00.000Z' },
  { id: 'feed-2', workspaceId: 'ws-1', userId: 'usr-2', text: 'Riya Patel moved "Initialize React + Vite structure" to Done', createdAt: '2026-05-24T12:15:00.000Z' }
];
