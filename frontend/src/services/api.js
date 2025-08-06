import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:8000', // Adjust this to match your FastAPI server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => API.post('/signup', userData),
  login: (credentials) => API.post('/login', credentials),
};

// Chat API calls
export const chatAPI = {
  sendMessage: (messageData) => API.post('/chat', messageData),
};

// Conversation API calls
export const conversationAPI = {
  getConversations: () => API.get('/conversations'),
  getConversation: (conversationId) => API.get(`/conversations/${conversationId}`),
  createConversation: (title) => API.post('/conversations', { title }),
  deleteConversation: (conversationId) => API.delete(`/conversations/${conversationId}`),
};

export default API;
