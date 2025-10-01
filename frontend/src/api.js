import axios from "axios";

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://onehub-q86m.onrender.com/api'
  : 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;