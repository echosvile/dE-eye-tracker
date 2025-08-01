import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import App from './App'
import TeammateDetail from './TeammateDetail'
import { AuthProvider } from './AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<App />} />
          <Route path='/teammate/:id' element={<TeammateDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
)