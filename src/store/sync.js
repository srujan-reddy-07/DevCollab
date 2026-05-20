// Synchronized Storage and Broadcast Manager

const CHANNEL_NAME = 'devcollab_sync_channel';

// Safeguarded localStorage access
export const storage = {
  get(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn('LocalStorage read blocked or unavailable, using fallback defaults.', e);
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage write failed.', e);
    }
  }
};

// Cross-tab Event Broadcast Channel
let syncChannel = null;
if (typeof BroadcastChannel !== 'undefined') {
  try {
    syncChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel failed to initialize.', e);
  }
}

export const broadcaster = {
  send(type, payload) {
    if (syncChannel) {
      try {
        syncChannel.postMessage({ type, payload });
      } catch (e) {
        console.error('Broadcast message failed to transmit.', e);
      }
    }
  },
  
  subscribe(onMessage) {
    if (syncChannel) {
      const handler = (event) => {
        if (event && event.data) {
          onMessage(event.data);
        }
      };
      syncChannel.addEventListener('message', handler);
      return () => {
        syncChannel.removeEventListener('message', handler);
      };
    }
    return () => {}; // Fallback un-subscriber
  }
};
