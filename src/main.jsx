import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
// src/App.js or src/main.jsx
import { RoleProvider  } from './Components/AuthContext/AuthContext.jsx';


createRoot(document.getElementById('root')).render(
  <React.Fragment>
  {/* <RoleProvider> */}
         <App />
  {/* </RoleProvider> */}
  </React.Fragment>,
);
