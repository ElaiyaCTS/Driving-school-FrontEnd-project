import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
   
  
  const clearAuthState = () => {
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
     window.location.href = "/"; // or use navigate() if available
        return;
  };

useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);

      // Check if token has expired
      const currentTime = Date.now() / 1000; // in seconds
      if (decoded.exp && decoded.exp < currentTime) {
        // Token expired — clear and redirect
        localStorage.removeItem("token");
        setUser(null);
        setRole(null);
        window.location.href = "/"; // or use navigate() if available
        return;
      }

      setUser(decoded);
      setRole(decoded.role.toLowerCase());
    } catch (error) {
      // Invalid token
      localStorage.removeItem("token");
      setUser(null);
      setRole(null);
      window.location.href = "/";
    }
  }
}, []);


  return (
    <RoleContext.Provider value={{ user ,role, setUser,setRole,clearAuthState }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => useContext(RoleContext);
