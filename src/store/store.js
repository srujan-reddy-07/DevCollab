import { create } from 'zustand';
import { INITIAL_WORKSPACES, INITIAL_PROJECTS, INITIAL_TASKS, INITIAL_SNIPPETS, INITIAL_DOCS, INITIAL_FEEDS, INITIAL_MEMBERS } from './seed';
import { storage, broadcaster } from './sync';

export const useStore = create((set, get) => ({
  // Core States
  workspaces: storage.get('devcollab_workspaces', INITIAL_WORKSPACES).map(ws => 
    ws.name === 'DevFusion Hackathon' 
      ? { ...ws, name: 'DevCollab Workspace', description: 'Collaborative workspace hub for developers' } 
      : ws
  ),
  projects: storage.get('devcollab_projects', INITIAL_PROJECTS),
  tasks: storage.get('devcollab_tasks', INITIAL_TASKS),
  snippets: storage.get('devcollab_snippets', INITIAL_SNIPPETS),
  docs: storage.get('devcollab_docs', INITIAL_DOCS),
  feeds: storage.get('devcollab_feeds', INITIAL_FEEDS),
  members: storage.get('devcollab_members', INITIAL_MEMBERS).map(m => 
    m.name === 'Srujan' 
      ? { ...m, name: 'Kabir Mehta', email: 'kabir@devcollab.com', avatar: 'KM', github: 'github.com/kabir-m' } 
      : m
  ),
  
  // Active Navigation
  currentWorkspaceId: storage.get('devcollab_current_ws', 'ws-1'),
  currentProjectId: storage.get('devcollab_current_proj', 'proj-1'),
  currentUser: storage.get('devcollab_current_user', null),
  proUser: storage.get('devcollab_pro_user', false),
  theme: storage.get('devcollab_theme', 'dark'),

  // Collaborative Real-Time Systems
  notifications: storage.get('devcollab_notifications', []),
  presence: {},

  // Set Navigation
  setCurrentWorkspace: (id) => {
    set({ currentWorkspaceId: id });
    storage.set('devcollab_current_ws', id);
    
    // Auto-select first project in this workspace
    const wsProj = get().projects.find(p => p.workspaceId === id);
    if (wsProj) {
      get().setCurrentProject(wsProj.id);
    }
  },

  setCurrentProject: (id) => {
    set({ currentProjectId: id });
    storage.set('devcollab_current_proj', id);
  },

  setCurrentUser: (userId) => {
    set({ currentUser: userId });
    storage.set('devcollab_current_user', userId);
    
    // Broadcast active status when changing user
    if (userId) {
      get().broadcastPresence();
    }
  },

  logout: () => {
    set({ currentUser: null });
    storage.set('devcollab_current_user', null);
  },

  setProUser: (status) => {
    set({ proUser: status });
    storage.set('devcollab_pro_user', status);
  },

  // Task Mutations
  addTask: (task, shouldBroadcast = true) => {
    const newTasks = [...get().tasks, task];
    set({ tasks: newTasks });
    storage.set('devcollab_tasks', newTasks);

    // Activity feed logging
    get().logActivity(`${get().getUserName(get().currentUser)} created task "${task.title}"`);

    if (shouldBroadcast) {
      broadcaster.send('ADD_TASK', task);
    }
  },

  updateTask: (taskId, updatedFields, shouldBroadcast = true) => {
    const newTasks = get().tasks.map(t => t.id === taskId ? { ...t, ...updatedFields } : t);
    set({ tasks: newTasks });
    storage.set('devcollab_tasks', newTasks);

    if (shouldBroadcast) {
      broadcaster.send('UPDATE_TASK', { taskId, updatedFields });
    }
  },

  moveTask: (taskId, newStatus, shouldBroadcast = true) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;

    const oldStatus = task.status;
    if (oldStatus === newStatus) return;

    const newTasks = get().tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    set({ tasks: newTasks });
    storage.set('devcollab_tasks', newTasks);

    // Log this action
    const activityText = `${get().getUserName(get().currentUser)} moved "${task.title}" to ${newStatus}`;
    get().logActivity(activityText);

    // Trigger notification if assignee is another user
    if (task.assigneeId && task.assigneeId !== get().currentUser) {
      const notification = {
        id: `notif-${Date.now()}`,
        userId: task.assigneeId,
        text: `${get().getUserName(get().currentUser)} moved your task "${task.title}" to ${newStatus}`,
        read: false,
        createdAt: new Date().toISOString()
      };
      
      // Update local + notify other if broadcast
      if (shouldBroadcast) {
        broadcaster.send('ADD_NOTIFICATION', notification);
      } else {
        // Recipient updates their notifications list
        const updatedNotifs = [notification, ...get().notifications];
        set({ notifications: updatedNotifs });
        storage.set('devcollab_notifications', updatedNotifs);
      }
    }

    if (shouldBroadcast) {
      broadcaster.send('MOVE_TASK', { taskId, newStatus, actorId: get().currentUser });
    }
  },

  addComment: (taskId, commentText, shouldBroadcast = true) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return;

    const comment = {
      id: `comm-${Date.now()}`,
      userId: get().currentUser,
      text: commentText,
      createdAt: new Date().toISOString()
    };

    const newTasks = get().tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          comments: [...(t.comments || []), comment]
        };
      }
      return t;
    });

    set({ tasks: newTasks });
    storage.set('devcollab_tasks', newTasks);

    // Scan for @mention (e.g. "@Riya Patel")
    get().members.forEach(member => {
      if (commentText.toLowerCase().includes(`@${member.name.toLowerCase()}`)) {
        if (member.id !== get().currentUser) {
          const mentionNotif = {
            id: `notif-${Date.now()}`,
            userId: member.id,
            text: `${get().getUserName(get().currentUser)} mentioned you in "${task.title}"`,
            read: false,
            createdAt: new Date().toISOString()
          };
          
          if (shouldBroadcast) {
            broadcaster.send('ADD_NOTIFICATION', mentionNotif);
          } else {
            const updatedNotifs = [mentionNotif, ...get().notifications];
            set({ notifications: updatedNotifs });
            storage.set('devcollab_notifications', updatedNotifs);
          }
        }
      }
    });

    if (shouldBroadcast) {
      broadcaster.send('ADD_COMMENT', { taskId, comment });
    }
  },

  // Snippets
  addSnippet: (snippet, shouldBroadcast = true) => {
    const newSnippets = [...get().snippets, snippet];
    set({ snippets: newSnippets });
    storage.set('devcollab_snippets', newSnippets);

    get().logActivity(`${get().getUserName(get().currentUser)} added snippet "${snippet.title}"`);

    if (shouldBroadcast) {
      broadcaster.send('ADD_SNIPPET', snippet);
    }
  },

  deleteSnippet: (snippetId, shouldBroadcast = true) => {
    const newSnippets = get().snippets.filter(s => s.id !== snippetId);
    set({ snippets: newSnippets });
    storage.set('devcollab_snippets', newSnippets);

    if (shouldBroadcast) {
      broadcaster.send('DELETE_SNIPPET', snippetId);
    }
  },

  // Documents
  addDoc: (doc, shouldBroadcast = true) => {
    const newDocs = [...get().docs, doc];
    set({ docs: newDocs });
    storage.set('devcollab_docs', newDocs);

    get().logActivity(`${get().getUserName(get().currentUser)} created wiki page "${doc.title}"`);

    if (shouldBroadcast) {
      broadcaster.send('ADD_DOC', doc);
    }
  },

  updateDoc: (docId, updatedFields, shouldBroadcast = true) => {
    const newDocs = get().docs.map(doc => {
      if (doc.id === docId) {
        const nextVersion = doc.version + 1;
        const newHistory = [
          {
            version: nextVersion,
            title: updatedFields.title || doc.title,
            content: updatedFields.content || doc.content,
            updatedAt: new Date().toISOString(),
            userId: get().currentUser
          },
          ...(doc.history || [])
        ];
        return {
          ...doc,
          ...updatedFields,
          version: nextVersion,
          history: newHistory
        };
      }
      return doc;
    });

    set({ docs: newDocs });
    storage.set('devcollab_docs', newDocs);

    const doc = get().docs.find(d => d.id === docId);
    get().logActivity(`${get().getUserName(get().currentUser)} updated wiki page "${updatedFields.title || doc?.title}"`);

    if (shouldBroadcast) {
      broadcaster.send('UPDATE_DOC', { docId, updatedFields, actorId: get().currentUser });
    }
  },

  restoreDocVersion: (docId, version, shouldBroadcast = true) => {
    const newDocs = get().docs.map(doc => {
      if (doc.id === docId) {
        const targetVersion = doc.history.find(h => h.version === version);
        if (!targetVersion) return doc;

        const nextVersion = doc.version + 1;
        const newHistory = [
          {
            version: nextVersion,
            title: targetVersion.title,
            content: targetVersion.content,
            updatedAt: new Date().toISOString(),
            userId: get().currentUser
          },
          ...(doc.history || [])
        ];

        return {
          ...doc,
          title: targetVersion.title,
          content: targetVersion.content,
          version: nextVersion,
          history: newHistory
        };
      }
      return doc;
    });

    set({ docs: newDocs });
    storage.set('devcollab_docs', newDocs);

    const doc = get().docs.find(d => d.id === docId);
    get().logActivity(`${get().getUserName(get().currentUser)} restored wiki "${doc?.title}" to version ${version}`);

    if (shouldBroadcast) {
      broadcaster.send('RESTORE_DOC', { docId, version, actorId: get().currentUser });
    }
  },

  // Log global activity
  logActivity: (text) => {
    const newFeed = {
      id: `feed-${Date.now()}`,
      workspaceId: get().currentWorkspaceId,
      userId: get().currentUser,
      text,
      createdAt: new Date().toISOString()
    };
    const updatedFeeds = [newFeed, ...get().feeds].slice(0, 100);
    set({ feeds: updatedFeeds });
    storage.set('devcollab_feeds', updatedFeeds);
  },

  // Presence Updates
  broadcastPresence: (page = 'dashboard', taskOpened = null) => {
    broadcaster.send('PRESENCE', {
      userId: get().currentUser,
      page,
      taskOpened,
      activeAt: Date.now()
    });
  },

  updatePresenceStatus: (userId, data) => {
    set(state => ({
      presence: {
        ...state.presence,
        [userId]: { ...data, activeAt: Date.now() }
      }
    }));
  },

  clearNotification: (id) => {
    const updated = get().notifications.filter(n => n.id !== id);
    set({ notifications: updated });
    storage.set('devcollab_notifications', updated);
  },

  // Add Workspace Action
  addWorkspace: (workspace, shouldBroadcast = true) => {
    const newWorkspaces = [...get().workspaces, workspace];
    set({ workspaces: newWorkspaces });
    storage.set('devcollab_workspaces', newWorkspaces);
    get().logActivity(`${get().getUserName(get().currentUser)} created workspace "${workspace.name}"`);
    if (shouldBroadcast) {
      broadcaster.send('ADD_WORKSPACE', workspace);
    }
  },

  // Add Project Action
  addProject: (project, shouldBroadcast = true) => {
    const newProjects = [...get().projects, project];
    set({ projects: newProjects });
    storage.set('devcollab_projects', newProjects);
    get().logActivity(`${get().getUserName(get().currentUser)} created project "${project.name}"`);
    if (shouldBroadcast) {
      broadcaster.send('ADD_PROJECT', project);
    }
  },

  // Add Member / Invite Action
  addMember: (member, shouldBroadcast = true) => {
    if (get().members.find(m => m.id === member.id || m.email === member.email)) return;
    const newMembers = [...get().members, member];
    set({ members: newMembers });
    storage.set('devcollab_members', newMembers);
    get().logActivity(`${member.name} joined the workspace`);
    if (shouldBroadcast) {
      broadcaster.send('ADD_MEMBER', member);
    }
  },

  // Add Task Attachment Action
  addAttachment: (taskId, attachment, shouldBroadcast = true) => {
    const newTasks = get().tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          attachments: [...(t.attachments || []), attachment]
        };
      }
      return t;
    });
    set({ tasks: newTasks });
    storage.set('devcollab_tasks', newTasks);

    const task = get().tasks.find(t => t.id === taskId);
    get().logActivity(`${get().getUserName(get().currentUser)} attached "${attachment.name}" to task "${task?.title || 'Unknown'}"`);
    if (shouldBroadcast) {
      broadcaster.send('ADD_ATTACHMENT', { taskId, attachment });
    }
  },

  // Update User Profile Action
  updateUserProfile: (userId, profileFields, shouldBroadcast = true) => {
    const newMembers = get().members.map(m => m.id === userId ? { ...m, ...profileFields } : m);
    set({ members: newMembers });
    storage.set('devcollab_members', newMembers);
    get().logActivity(`${get().getUserName(userId)} updated their profile`);
    if (shouldBroadcast) {
      broadcaster.send('UPDATE_USER_PROFILE', { userId, profileFields });
    }
  },

  // Toggle Theme Action
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    storage.set('devcollab_theme', next);
  },

  // Helper selectors
  getUserName: (id) => {
    const member = get().members.find(m => m.id === id);
    return member ? member.name : 'Unknown User';
  },

  getUserAvatar: (id) => {
    const member = get().members.find(m => m.id === id);
    return member ? member.avatar : '??';
  }
}));
