import { useEffect } from 'react';
import { useStore } from '../store/store';

export function usePresence(currentPage = 'dashboard', activeTaskId = null) {
  const broadcastPresence = useStore(state => state.broadcastPresence);
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    // Send initial presence status immediately
    broadcastPresence(currentPage, activeTaskId);

    // Heartbeat every 4 seconds to maintain active presence status across tabs
    const interval = setInterval(() => {
      broadcastPresence(currentPage, activeTaskId);
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [currentPage, activeTaskId, currentUser, broadcastPresence]);
}
