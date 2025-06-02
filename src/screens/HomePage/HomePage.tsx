// @ts-ignore
import React, { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Search, Heart} from "lucide-react"; 
import { ChatbotButton } from "../../components/ChatbotButton";
import {getLaptops, getFavorites } from "../../services/api";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

interface Laptop {
  id: string;
  name: string;
  brand: string;
  price: number | string;
  image_url?: string;
  in_stock?: boolean;
}

interface Brand {
  name: string;
  logo?: string;
}

export const HomePage = (): JSX.Element => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [featuredLaptops, setFeaturedLaptops] = useState<Laptop[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use hardcoded brands data since there's no API endpoint
  const brandsList: Brand[] = [
    { name: "HP", logo: "/HP-01.png" },
    { name: "Asus", logo: "/ASUS.png" },
    { name: "Dell", logo: "/Dell.png" },
    { name: "Lenovo", logo: "/Lenovo.png" },
    { name: "Apple", logo: "/Apple.png" },
    { name: "MSI", logo: "/Msi.png" },
    { name: "Acer", logo: "/Acer.png" },
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use hardcoded brands directly instead of fetching
        setBrands(brandsList);
        
        // Fetch featured laptops (newest or most popular)
        try {
          const laptopsData = await getLaptops({ ordering: '-id', page_size: 6 });
          setFeaturedLaptops(laptopsData.slice(0, 6));
        } catch (error) {
          console.error("Error fetching laptops:", error);
          setFeaturedLaptops([]);
        }
        
        // Fetch favorites if user is authenticated
        if (isAuthenticated) {
          try {
            const favoritesData = await getFavorites();
            setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
          } catch (error) {
            console.error("Error fetching favorites:", error);
            setFavorites([]);
          }
        }
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);
  
  // Navigation handlers
  const handleExploreClick = () => {
    navigate("/products");
  };

  const handleCompareClick = () => {
    navigate("/compare/1");
  };

  const handleLaptopFinderClick = () => {
    navigate("/laptop-finderr");
  };
  
  const handleBrandClick = (brand: string) => {
    navigate(`/products?brand=${brand}`);
  };
  
  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
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
    <div className="bg-white min-h-screen">
    <style>
      {`
        @keyframes chatbotBlueGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 #43e0ff55, 0 0 0 0 #176B87;
          }
          50% {
            box-shadow: 0 0 12px 4px #FFAB5B, 0 0 8px 2px #176B87;
          }
        }
        .chatbot-glow {
          animation: chatbotBlueGlow 1.5s infinite alternate;
        }

        .brand-card {
          transition: all 0.3s ease;
        }

        .brand-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .product-card {
          transition: all 0.3s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
      `}
    </style>
      <Header showSearch={false} showProfile={true} />
      
      {/* Hero Section */}  
      <section 
        className="relative py-20 sm:py-32 lg:py-40 z-30" 
        style={{ 
          backgroundImage: `url('/laptop.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#000',
          minHeight: '60vh', // Reduce height on mobile
        }}
      >
        <div className="max-w-[1540px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center justify-between relative z-10">
          <div className="lg:w-1/2 w-full text-center lg:text-left lg:pl-[117px]">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-l from-[#036777] to-[#7EF6EE] bg-clip-text text-transparent mb-4 drop-shadow-lg">
              Find The Perfect <span className="text-white">Laptop</span><br />
              For You
            </h1>
            <p className="text-sm sm:text-base text-gray-200 mb-6 sm:mb-8 drop-shadow-md">
              Choose from the best devices based on<br className="hidden sm:block" />
              your need and preferences
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start items-center gap-4">
              <Button
                className="w-full sm:w-auto bg-gradient-to-r from-[#FFAB5B] to-[#FFAB5B] hover:from-[#032a38] hover:to-[#125a72] text-black px-6 sm:px-8 py-4 sm:py-6 rounded-full"
                onClick={handleExploreClick}
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Browse Laptops
              </Button>

              {isAuthenticated && (
                  <Button
                    variant="outline"
                    className="border-[#ff9c4a] text-[#000000] bg-[#ffffff] hover:bg-[#e88c3d]/10 px-8 py-6 rounded-full flex items-center gap-2 shadow-md chatbot-glow"
                    onClick={handleLaptopFinderClick}
                  >
                    <img src="/chatbot small icon.png" alt="Chatbot Finder" className="h-6 w-6 mr-2" />
                    Ask Chatbot
                  </Button>
                )}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Brands Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold text-[#04364A]">Popular Brands</h2>
            <Button 
              variant="ghost" 
              className="text-[#04364A] hover:bg-[#e6f0f8]"
              onClick={handleExploreClick}
            >
              View All Brands →
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {loading ? (
              Array(6).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 flex items-center justify-center h-32 animate-pulse">
                  <div className="w-24 h-12 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : (
              brands.slice(0, 6).map((brand, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer brand-card border border-gray-100"
                  onClick={() => handleBrandClick(brand.name)}
                >
                  <div className="w-24 h-12 flex items-center justify-center mb-3">
                    <img 
                      src={brand.logo} 
                      alt={brand.name} 
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-brand.png'; }}
                    />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{brand.name}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Your Favorites Section - Only shown when user is logged in and has favorites */}
      {isAuthenticated && favorites.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-[#04364A] flex items-center">
                <Heart className="h-6 w-6 mr-2 text-red-500 fill-red-500" />
                Your Favorites
              </h2>
              <Button 
                variant="ghost" 
                className="text-[#04364A] hover:bg-[#e6f0f8]"
                onClick={() => navigate('/favorites')}
              >
                View All Favorites →
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {favorites.slice(0, 3).map((favorite) => {
                const laptop = favorite.laptop;
                return (
                  <div 
                    key={favorite.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden product-card border border-gray-100"
                  >
                    <div className="relative">
                      <img
                        src={getImageUrl(laptop.image_url)}
                        alt={laptop.name}
                        className="w-full h-48 object-contain cursor-pointer p-4"
                        onClick={() => handleProductClick(laptop.id)}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-laptop.png'; }}
                      />
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 
                        className="font-medium text-lg mb-2 line-clamp-2 h-14 cursor-pointer hover:text-[#176B87]"
                        onClick={() => handleProductClick(laptop.id)}
                      >
                        {laptop.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{laptop.brand}</p>
                      <p className="text-xl font-bold text-[#04364A] mb-4">
                        {laptop.price 
                          ? `${typeof laptop.price === 'string' 
                              ? parseFloat(laptop.price).toLocaleString() 
                              : (laptop.price as number).toLocaleString()} EGP`
                          : 'Price not listed'}
                      </p>
                      <Button
                        className="w-full bg-[#04364A] hover:bg-[#032a38] text-white"
                        onClick={() => handleProductClick(laptop.id)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-[1440px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">SERVICES</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-white p-4 rounded-full mb-6">
                <img src="/chatbot-icon.png" alt="Custom Suggestions" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Chatbot</h3>
              <p className="text-gray-600 mb-6">Get smart recommendations based on your using</p>
              <Button 
                variant="ghost" 
                className="text-[#04364A]"
                onClick={handleLaptopFinderClick}
              >
                View more →
              </Button>
            </div>
            <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-white p-4 rounded-full mb-6">
                <img src="/comparison-icon.png" alt="Easy Comparison" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy Comparison</h3>
              <p className="text-gray-600 mb-6">Compare the best laptops side by side</p>
              <Button 
                variant="ghost" 
                className="text-[#04364A]"
                onClick={handleCompareClick}
              >
                View more →
              </Button>
            </div>
            <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
              <div className="bg-white p-4 rounded-full mb-6">
                <img src="/filtering-icon.png" alt="Smart Filtering" className="w-16 h-16" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Smart Filtering</h3>
              <p className="text-gray-600 mb-6">Filter based on specifications, performance, and budget</p>
              <Button 
                variant="ghost" 
                className="text-[#04364A]"
                onClick={handleExploreClick}
              >
                View more →
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {isAuthenticated && <ChatbotButton />}
      <Footer />
    </div>
  );
};