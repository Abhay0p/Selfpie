import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Kulish_CustomerShopIn from './components/Kulish_CustomerShopIn';
import Yatharth_ShopkeeperPickup from './components/Yatharth_ShopkeeperPickup';

function App() {
  return (
    <Router>
      <div className="font-sans min-h-screen text-slate-200">
        <div className="bg-aurora"></div>
        <nav className="p-4 flex justify-between items-center backdrop-blur-md bg-slate-900/50 border-b border-slate-800 sticky top-0 z-50 shadow-sm">
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter">
            Selfpie
          </div>
          <div className="space-x-4">
            <Link to="/" className="font-semibold text-slate-300 hover:text-indigo-400 transition-colors">Customer</Link>
            <Link to="/merchant" className="font-semibold px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all">Merchant Login</Link>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <Routes>
            <Route path="/" element={<Kulish_CustomerShopIn />} />
            <Route path="/merchant/*" element={<Yatharth_ShopkeeperPickup />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
