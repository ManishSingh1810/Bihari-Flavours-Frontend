import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // REQUIRED for cookies
});
console.log("VITE_API_URL =", import.meta.env.VITE_API_URL)/api;

// Attach token ONLY if it exists (HTTP / dev)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message =
      err.response?.data?.message || "Something went wrong";

    // Auth failures
    if (status === 401 || status === 403) {
      toast.error("Session expired. Please login again.");

      localStorage.removeItem("user");
      localStorage.removeItem("authToken");

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } 
    // Other API errors
    else {
      toast.error(message);
    }

    return Promise.reject(err);
  }
);

export default api;


