import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProfileQuiz from './pages/ProfileQuiz';
import Recommendations from './pages/Recommendations';
import AdminDashboard from './pages/admin/Dashboard';
import AdminInventory from './pages/admin/Inventory';
import Navbar from './components/Navbar';

function App() {
  const [preferences, setPreferences] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Navbar */}
        <Route path="/" element={<><Navbar /><Home /></>} />
        <Route path="/quiz" element={<><Navbar /><ProfileQuiz setPreferences={setPreferences} /></>} />
        <Route path="/recommendations" element={<><Navbar /><Recommendations preferences={preferences} /></>} />
        
        {/* Admin Routes (Custom layout with sidebar inside components) */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/inventory" element={<AdminInventory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
