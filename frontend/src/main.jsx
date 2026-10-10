import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import React from 'react'
import Home from './SignUp.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import SignUp from './SignUp.jsx'
import LogIn from './LogIn.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/app" element={<App />} />
        <Route path="/" element={<LogIn />} />
        <Route path="/*" element={<LogIn />} />
      </Routes>
    </BrowserRouter>
)
