import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Kulish_CustomerShopIn from './components/Kulish_CustomerShopIn';
import Yatharth_ShopkeeperPickup from './components/Yatharth_ShopkeeperPickup';

function App() {
  return (
    <Router>
      <div className="font-sans min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-800">
        <nav className="p-4 flex justify-between items-center backdrop-blur-md bg-white/70 border-b border-indigo-100 sticky top-0 z-50 shadow-sm">
          <div className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter">
            Selfpie
          </div>
          <div className="space-x-4">
            <Link to="/" className="font-semibold text-slate-600 hover:text-indigo-600 transition-colors">Customer</Link>
            <Link to="/merchant" className="font-semibold px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all">Merchant Login</Link>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
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
