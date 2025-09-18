import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.ketush.com.ar/api",
  // baseURL: "http://localhost:4100/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token si existe
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
