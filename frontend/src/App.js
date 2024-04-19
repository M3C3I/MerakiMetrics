import React from 'react';
import logo from './logo.svg';
import './App.css';
import Dashboard from './Dashboard';

function App() {
  return (

    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <div className="Components">
          <Dashboard />
        </div>
      </header>
    </div>
  );
}
export default App;
