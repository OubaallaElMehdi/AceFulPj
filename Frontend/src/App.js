import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
    return (
        <div>
            <AnimatedBackground />
            <Header />
            <Hero />
            <Features />
            <Footer />
        </div>
    );
}
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/login';
import Signup from './components/login/signup';
import Home from './components/login/Home';

const App = () => {
  const token = localStorage.getItem('token'); 

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};
export default App;
