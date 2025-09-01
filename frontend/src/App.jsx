import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TryOnProducts from './pages/TryOnProducts';
import VirtualTryOn from './components/VirtualTryOn';
import TryOnStream from './components/TryOnStream';
import ThreeTierTryOn from './components/ThreeTierTryOn';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/try-on" element={<TryOnProducts />} />
          <Route path="/virtual-tryon" element={<VirtualTryOn />} />
          <Route path="/tryon-stream" element={<TryOnStream />} />
          <Route path="/three-tier-tryon" element={<ThreeTierTryOn />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 