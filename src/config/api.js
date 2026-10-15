import axios from 'axios';

const API = axios.create({
  baseURL: "farm-backend-production-2834.up.railway.app",
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;