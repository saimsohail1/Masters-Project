import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import TryOnProducts from './pages/TryOnProducts';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/try-on" element={<TryOnProducts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
