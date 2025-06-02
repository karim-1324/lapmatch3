import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Heart } from 'lucide-react';
import { getFavorites, toggleFavorite } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';

interface Laptop {
  id: string;
  name: string;
  brand: string;
  price: number | string;
  image_url?: string;
  in_stock: boolean;
  // Add other laptop properties as needed
}

interface Favorite {
  id: number;
  user: number;
  laptop: Laptop;
  created_at: string;
}

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/favorites' } });
        return;
      }
      
      fetchFavorites();
    }
  }, [isAuthenticated, loading, navigate]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching favorites...');
      const data = await getFavorites();
      console.log('Favorites data received:', data);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setFavorites(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.results)) {
        // Handle case where API returns { results: [...] }
        setFavorites(data.results);
      } else {
        console.error('Unexpected data format:', data);
        setFavorites([]);
        setError('Received invalid data format from server');
      }
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError(err.message || 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function to handle toggling favorites
  const handleToggleFavorite = async (e: React.MouseEvent, laptopId: string) => {
    e.stopPropagation(); // Prevent triggering the card click
    
    try {
      await toggleFavorite(laptopId);
      // Remove the favorite from the local state immediately
      setFavorites(prev => prev.filter(favorite => favorite.laptop.id !== laptopId));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) {
      return '/placeholder-laptop.png';
    }
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header showSearch={false} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Favorites</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading favorites...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
            <Button 
              onClick={fetchFavorites} 
              className="mt-2 bg-red-600 hover:bg-red-700 text-white"
            >
              Try Again
            </Button>
          </div>
        ) : Array.isArray(favorites) && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const laptop = favorite.laptop;
              return (
                <div 
                  key={favorite.id} 
                  className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={getImageUrl(laptop.image_url)}
                      alt={laptop.name}
                      className="w-full h-48 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-laptop.png'; }}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white rounded-full shadow-md hover:bg-red-50"
                      onClick={(e) => handleToggleFavorite(e, laptop.id)}
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2 line-clamp-2 h-14">{laptop.name}</h3>
                    <p className="text-2xl font-bold text-[#04364A] mb-4">
                      {laptop.price 
                        ? `${typeof laptop.price === 'string' 
                            ? parseFloat(laptop.price).toLocaleString() 
                            : (laptop.price as number).toLocaleString()} EGP`
                        : 'Price not listed'}
                    </p>
                    <p className={`text-sm mb-4 ${laptop.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                      {laptop.in_stock ? 'In Stock' : 'Out of Stock'}
                    </p>
                    <Button
                      className="w-full bg-[#04364A] hover:bg-[#032a38] text-white"
                      onClick={() => navigate(`/product/${laptop.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 border border-gray-200 rounded-lg p-8">
            <Heart className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg text-gray-600 mb-2">No favorites yet</p>
            <p className="text-sm text-gray-500 mb-4">Start adding laptops to your favorites!</p>
            <Button 
              onClick={() => navigate('/products')}
              className="bg-[#04364A] hover:bg-[#032a38] text-white"
            >
              Browse Laptops
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};