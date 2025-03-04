import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Adventure from './pages/Adventure';
import Playground from './pages/Playground';

const App = () => {
  return (
    <Router>
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/adventure" element={<Adventure />} />
            <Route path="/playground" element={<Playground />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
