import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import React from 'react'
import Home from './SignUp.jsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from './SignUp.jsx'
import Login from './Login.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/app" element={<App />} />
        <Route path="/" element={<Login />} />
        <Route path="/*" element={<Login />} />
      </Routes>
    </BrowserRouter>
)
