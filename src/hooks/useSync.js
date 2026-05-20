import { useEffect } from 'react';
import { useStore } from '../store/store';
import { broadcaster } from '../store/sync';

export function useSync() {
  useEffect(() => {
    const store = useStore.getState();

    const unsubscribe = broadcaster.subscribe((event) => {
      const { type, payload } = event;
      
      switch (type) {
        case 'ADD_TASK':
          store.addTask(payload, false);
          break;
          
        case 'UPDATE_TASK':
          store.updateTask(payload.taskId, payload.updatedFields, false);
          break;
          
        case 'MOVE_TASK':
          // Move task locally, log movement locally
          store.moveTask(payload.taskId, payload.newStatus, false);
          break;
          
        case 'ADD_COMMENT':
          // Add comment to task directly in store
          useStore.setState((state) => {
            const nextTasks = state.tasks.map(t => {
              if (t.id === payload.taskId) {
                return { ...t, comments: [...(t.comments || []), payload.comment] };
              }
              return t;
            });
            return { tasks: nextTasks };
          });
          break;
          
        case 'ADD_SNIPPET':
          store.addSnippet(payload, false);
          break;
          
        case 'DELETE_SNIPPET':
          store.deleteSnippet(payload, false);
          break;
          
        case 'ADD_DOC':
          store.addDoc(payload, false);
          break;
          
        case 'UPDATE_DOC':
          store.updateDoc(payload.docId, payload.updatedFields, false);
          break;
          
        case 'RESTORE_DOC':
          store.restoreDocVersion(payload.docId, payload.version, false);
          break;
          
        case 'ADD_NOTIFICATION':
          // Check if notification targets this current client user
          if (payload.userId === store.currentUser) {
            useStore.setState((state) => {
              const updated = [payload, ...state.notifications];
              return { notifications: updated };
            });
          }
          break;
          
        case 'PRESENCE':
          // Record active status of other user
          if (payload.userId !== store.currentUser) {
            store.updatePresenceStatus(payload.userId, payload);
          }
          break;
          
        case 'ADD_WORKSPACE':
          store.addWorkspace(payload, false);
          break;

        case 'ADD_PROJECT':
          store.addProject(payload, false);
          break;

        case 'ADD_MEMBER':
          store.addMember(payload, false);
          break;

        case 'ADD_ATTACHMENT':
          store.addAttachment(payload.taskId, payload.attachment, false);
          break;

        case 'UPDATE_USER_PROFILE':
          store.updateUserProfile(payload.userId, payload.profileFields, false);
          break;

        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
