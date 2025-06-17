



import React from "react";
import { Navigate } from "react-router-dom";
import { useRole } from "./AuthContext/AuthContext"; // adjust path as needed

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role } = useRole();

  if (!role) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(role.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;




// // ProtectedRoute.jsx
// import React from "react";
// import { Navigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";

// const ProtectedRoute = ({ allowedRoles, children }) => {
//   const token = localStorage.getItem("token");
//   if (!token) return <Navigate to="/" replace />;

//   try {
//     const { role } = jwtDecode(token);
//     if (!allowedRoles.includes(role.toLowerCase())) {
//       return <Navigate to="/" replace />;
//     }
//     return children;
//   } catch (error) {
//     return <Navigate to="/" replace />;
//   }
// };

// export default ProtectedRoute;