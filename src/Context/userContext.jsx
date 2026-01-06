import React, { createContext, useState, useContext, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // =====================
  // Load user on refresh
  // =====================
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  // =====================
  // Login
  // =====================
  const login = (userData) => {
    /**
     * Backend sends:
     * - user object always
     * - token only in dev / HTTP
     */

    const userObj = {
      name: userData.name || "",
      phone: userData.phone || "",
      role: userData.role || "user",
      userId: userData.userId || userData.id,
    };

    // Save user (for UI state)
    localStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);

    // Save token ONLY if backend sends it (dev / HTTP)
    if (userData.token) {
      localStorage.setItem("authToken", userData.token);
    }

    console.log("User logged in:", userObj);
  };

  // =====================
  // Logout
  // =====================
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        isLoggedIn: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
