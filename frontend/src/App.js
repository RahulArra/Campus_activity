// frontend/src/App.js

import React from 'react';
import SubmitActivity from './pages/ActivityAddPage'; // Import your new page
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* We'll just show your page directly for testing */}
        <SubmitActivity />
      </header>
    </div>
  );
}

export default App;