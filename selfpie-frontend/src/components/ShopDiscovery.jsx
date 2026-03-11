import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapPin, ShoppingBag, Navigation } from 'lucide-react';
import { calculateDistance } from '../utils/location';

const ShopDiscovery = ({ onSelectShop }) => {
  // Ensure we start with an empty array
  const [shops, setShops] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setUserLoc({ lat: latitude, lng: longitude });

      axios.get(`${import.meta.env.VITE_API_URL}/api/shops/nearby?lat=${latitude}&lng=${longitude}`)
        .then(res => {
          // If backend returns an array, set it. Otherwise, set empty array.
          setShops(Array.isArray(res.data) ? res.data : []);
          setLoading(false);
        })
        .catch(err => {
          console.error("Fetch Error:", err);
          setShops([]); // Fail gracefully with empty array
          setLoading(false);
        });
    }, (err) => {
      console.error("Location Error:", err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-10 text-center text-white">Finding shops nearby...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
        <MapPin className="text-red-500" /> Shops Near You
      </h2>
      
      <div className="space-y-4">
        {shops.length > 0 ? (
          shops.map(shop => {
            const distance = userLoc ? calculateDistance(
              userLoc.lat, userLoc.lng, 
              shop.location.coordinates[1], shop.location.coordinates[0]
            ) : '...';

            return (
              <div 
                key={shop._id} 
                onClick={() => onSelectShop(shop)}
                className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center active:scale-95 transition-transform cursor-pointer"
              >
                <div>
                  <h3 className="font-bold text-gray-800">{shop.shopName}</h3>
                  <p className="text-xs text-gray-500">{shop.category}</p>
                  <div className="flex items-center gap-1 mt-2 text-blue-600 font-semibold text-sm">
                    <Navigation size={12} />
                    <span>{distance} km away</span>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-full">
                  <ShoppingBag className="text-green-600" />
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-gray-400 text-center mt-10">
            No shops found within 5km of your location.
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopDiscovery;