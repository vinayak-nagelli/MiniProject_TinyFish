import axios from 'axios';

// We create an axios instance pointing to our FastAPI backend.
const api = axios.create({
  // Uses the environment variable if deployed, otherwise falls back to local server
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
});

// Add a request interceptor to attach the JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth Endpoints ---
export const loginUser = async (email, password) => {
  // OAuth2 expects form-urlencoded data for login
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await api.post("/login", formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return response.data;
};

export const registerUser = async (email, password) => {
  const response = await api.post("/register", { email, password });
  return response.data;
};

export const fetchUserProfile = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await api.put("/me/profile", profileData);
  return response.data;
};

// --- Agent Endpoints ---
export const parseIntent = async (userInput) => {
  try {
    const response = await api.post('/parse-intent', { user_input: userInput });
    return response.data;
  } catch (error) {
    console.error("Error parsing intent:", error);
    throw error;
  }
};

export const runAgent = async (intentData) => {
  try {
    const response = await api.post('/run-agent', intentData);
    return response.data; // Returns the list of ranked deals
  } catch (error) {
    console.error("Error running agent:", error);
    throw error;
  }
};


