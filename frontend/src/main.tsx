
import ReactDOM  from 'react-dom/client'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import './index.css'
import App from './App.tsx'
import Login from './pages/Login.tsx'
import React from 'react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<App />} />
              <Route path="/login" element={<Login />} />
          </Routes>
      </BrowserRouter>
  </React.StrictMode>
)
