
import ReactDOM  from 'react-dom/client'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import './index.css'
import Login from './pages/Login.tsx'
import Register from "./pages/Register.tsx";
import Home from "./pages/Home.tsx"
import React from 'react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
          </Routes>
      </BrowserRouter>
  </React.StrictMode>
)
