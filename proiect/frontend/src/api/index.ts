import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});


const setAuthToken = (token: string) => {
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
};

const getImageUrl = (imagePath: string) => {
  return `http://localhost:3000${imagePath}`;
};

export { api, setAuthToken, getImageUrl };
