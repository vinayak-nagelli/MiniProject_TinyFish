import { create } from 'zustand';

// Zustand is a lightweight state management library.
// It allows us to access these variables from ANY component in our React app
// without having to pass them down manually (prop drilling).

const useStore = create((set) => ({
  // Core State
  activeIntent: null,
  agentStatus: 'idle', // idle, running, complete, error
  currentResults: [],
  errorMessage: null,
  
  // Auth State
  token: localStorage.getItem("token") || null,
  user: null, // Holds the profile data
  isAuthModalOpen: false,

  // Core Actions
  setActiveIntent: (intent) => set({ activeIntent: intent }),
  setAgentStatus: (status) => set({ agentStatus: status }),
  setCurrentResults: (results) => set({ currentResults: results }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),

  // Auth Actions
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  
  // Reset everything (e.g., when a user starts a new search)
  resetState: () => set({
    activeIntent: null,
    agentStatus: 'idle',
    currentResults: [],
    errorMessage: null
  })
}));

export default useStore;
