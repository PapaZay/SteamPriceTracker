
import ReactDOM  from 'react-dom/client'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import './index.css'
import Login from './pages/Login.tsx'
import Register from "./pages/Register.tsx";
import Home from "./pages/Home.tsx"
import Search from "./pages/Search.tsx";
import React from 'react';
import {ThemeProvider} from "./contexts/ThemeContext.tsx";
import {AuthProvider} from "./contexts/AuthContext.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <AuthProvider>
      <ThemeProvider>
          <BrowserRouter>
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/search" element={<Search />} />
              </Routes>
          </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)
