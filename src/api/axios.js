import axios from "axios";
import { toast } from "react-hot-toast";

const BACKEND_BASE =
  import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${BACKEND_BASE}/api`,
  withCredentials: true,
});

console.log("API BASE =", `${BACKEND_BASE}/api`);

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
    const message = err.response?.data?.message || "Something went wrong";

    // ✅ Only logout when truly unauthenticated
    if (status === 401) {
      toast.error("Session expired. Please login again.");

      localStorage.removeItem("user");
      localStorage.removeItem("authToken");

      setTimeout(() => {
        window.location.href = "/login";
      }, 800);

      return Promise.reject(err);
    }

    // ✅ 403 = forbidden (role/permission), don't logout
    if (status === 403) {
      toast.error(message || "You don't have permission to do this.");
      return Promise.reject(err);
    }

    // Other API errors
    toast.error(message);
    return Promise.reject(err);
  }
);

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status = err.response?.status;
//     const message =
//       err.response?.data?.message || "Something went wrong";

//     // Auth failures
//     if (status === 401 || status === 403 ) {
//       toast.error("Session expired. Please login again.");

//       localStorage.removeItem("user");
//       localStorage.removeItem("authToken");

//       setTimeout(() => {
//         window.location.href = "/login";
//       }, 1500);
//     } 
//     // Other API errors
//     else {
//       toast.error(message);
//     }

//     return Promise.reject(err);
//   }
// );

export default api;





