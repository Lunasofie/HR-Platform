import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import PrivateRoute from './components/PrivateRoute';

function App(){
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    if (token){
      fetch((process.env.REACT_APP_API||'http://localhost:4000') + '/api/me', { headers: { 'Authorization':'Bearer ' + token } })
        .then(r=>r.json())
        .then(data=> setMe(data))
        .catch(()=> { setToken(null); setMe(null); localStorage.removeItem('token'); });
    }
  }, [token]);

  function handleLogin(token){
    setToken(token); localStorage.setItem('token', token); navigate('/');
  }

  function handleLogout(){
    setToken(null); setMe(null); localStorage.removeItem('token'); navigate('/login');
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/" element={<PrivateRoute token={token}><Dashboard me={me} onLogout={handleLogout} /></PrivateRoute>} />
     <Route
  path="/reports"
  element={
    <PrivateRoute token={token} requiredRole={'admin'}>
      <Reports me={me} token={token} onLogout={handleLogout} />
    </PrivateRoute>
  }
/>
    </Routes>
  );
}

export default App;
