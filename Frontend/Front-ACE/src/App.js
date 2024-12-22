import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import './App.css';

function App() {
  return (
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar />
          <MainContent />
        </div>
      </div>
  );
}

export default App;
