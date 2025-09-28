import './utils/sentry';
import ReactDOM  from 'react-dom/client'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import './index.css'
import Login from './pages/Login.tsx'
import Register from "./pages/Register.tsx";
import Home from "./pages/Home.tsx"
import Search from "./pages/Search.tsx";
import DashBoard from "./pages/Dashboard.tsx";
import Admin from "./pages/Admin.tsx";
import Alerts from "./pages/Alerts.tsx";
import React from 'react';
import {ThemeProvider} from "./contexts/ThemeContext.tsx";
import {AuthProvider} from "./contexts/AuthContext.tsx";
import { Toaster } from 'react-hot-toast'
import DonationSuccess from "./pages/DonationSuccess.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <AuthProvider>
      <ThemeProvider>
          <BrowserRouter>
              <Toaster position="top-right"
                       toastOptions={{
                           duration: 4000,
                           success: {
                               duration: 3000,
                           },
                           error: {
                               duration: 5000,
                           }
                       }}
              />
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/dashboard" element={<DashBoard />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/donation-success" element={<DonationSuccess />} />
              </Routes>
          </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
)
