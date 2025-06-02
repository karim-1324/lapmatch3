import { ChevronDownIcon, ChevronUpIcon, Heart } from "lucide-react";
import React, { JSX, useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { getFavoriteLaptopIds, toggleFavorite } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { mockLaptops, placeholderImages } from "../../data/mockLaptops";


interface LaptopDetails {
  id: string;
  seller: string;
  condition: string;
  brand: string;
  model: string;
  name: string;
  category: string;
  processor: string;
  graphics: string;
  ram: string;
  storage: string;
  display: string;
  displaySize: string;
  displayResolution: string;
  price: number | null;
  productUrl: string;
  imageUrl: string;
  inStock: boolean;
}

const getImageUrl = (url: string | undefined) => {
  if (!url) {
    return '/placeholder-laptop.png';
  }
  
  // Use the placeholder images from our mock data
  // if (url.startsWith('/laptops/') && placeholderImages[url]) {
  //   return placeholderImages[url];
  // }
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getProductUrl = (url: string | undefined) => {
  if (!url) {
    return '#';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatStorage = (value: string | number) => {
  const numValue = Number(value);
  if (numValue >= 1024) {
    return `${numValue / 1024} TB`;
  }
  return `${numValue} GB`;
};

export const DetailsPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  
  const [laptop, setLaptop] = useState<LaptopDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const whereToBuyRef = React.useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchLaptopDetails = async () => {
      try {
        setIsLoading(true);
        if (!id) {
          throw new Error('No laptop ID provided');
        }
        
        // Use mockLaptops instead of API call
        const laptopId = parseInt(id);
        const mockLaptop = mockLaptops.find(laptop => laptop.id === laptopId);
        
        if (!mockLaptop) {
          throw new Error('Laptop not found');
        }
        
        setLaptop({
          id: mockLaptop.id.toString(),
          seller: "Store",
          condition: "New",
          brand: mockLaptop.brand,
          model: mockLaptop.name,
          name: mockLaptop.name,
          category: mockLaptop.category,
          processor: mockLaptop.specs.processor,
          graphics: mockLaptop.specs.gpu,
          ram: mockLaptop.specs.ram,
          storage: mockLaptop.specs.storage,
          display: mockLaptop.specs.display,
          displaySize: mockLaptop.specs.display.split('-')[0].trim(),
          displayResolution: mockLaptop.specs.display.includes('FHD') ? 'FHD' : 
                            mockLaptop.specs.display.includes('QHD') ? 'QHD' : 
                            mockLaptop.specs.display.includes('OLED') ? 'OLED' : 'HD',
          price: mockLaptop.price,
          productUrl: "#",
          imageUrl: mockLaptop.image,
          inStock: mockLaptop.inStock
        });
        
      } catch (error) {
        console.error("Error fetching laptop details:", error);
        setLaptop({
          id: "1",
          seller: "Amazon",
          condition: "New",
          brand: "HP",
          model: "EliteBook 845 G8",
          name: "HP EliteBook 845 Business Laptop",
          category: "Business",
          processor: "AMD Ryzen 5 PRO 5650U",
          graphics: "AMD Radeon Vega 7",
          ram: "32 GB",
          storage: "1 TB SSD",
          display: "14-inch FHD (1920x1080)",
          displaySize: "14 inch",
          displayResolution: "FHD",
          price: null,
          productUrl: "https://www.amazon.com/dp/B0CNSLZHL4",
          imageUrl: "https://m.media-amazon.com/images/I/71b1KNPVIGL._AC_UY218_.jpg",
          inStock: true
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaptopDetails();
    
    // Check if this laptop is in favorites
    const checkFavoriteStatus = async () => {
      if (isAuthenticated && id) {
        try {
          const favoriteIds = await getFavoriteLaptopIds();
          setIsFavorite(favoriteIds.includes(id));
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [id, isAuthenticated]); 

  if (isLoading || !laptop) {
    return <div>Loading...</div>;
  }

  const basicSpecificationData = [
    { label: "Brand", value: laptop.brand },
    { label: "Condition", value: laptop.condition },
    { label: "Category", value: laptop.category },
    { label: "Model", value: laptop.model },
  ];

  const additionalSpecificationData = [
    { label: "Processor", value: laptop.processor },
    { label: "Graphics", value: laptop.graphics },
    { label: "RAM", value: formatStorage(laptop.ram) },
    { label: "Storage", value: formatStorage(laptop.storage) },
    { label: "Display", value: laptop.display },
    { label: "Display Size", value: `${laptop.displaySize}"` },
    { label: "Display Resolution", value: laptop.displayResolution },
  ];

  const visibleSpecifications = showAllSpecs 
    ? [...basicSpecificationData, ...additionalSpecificationData]
    : basicSpecificationData;

  const handleCompare = () => {
    if (laptop) {
      const compareProductId = localStorage.getItem('compareProductId');
      
      if (compareProductId) {
        navigate(`/compare/${compareProductId}/${laptop.id}`);

        localStorage.removeItem('compareProductId');
      } else {

        navigate(`/compare/${laptop.id}`);
      }
    }
  };

  const scrollToWhereToBuy = () => {
    if (whereToBuyRef.current) {
      const elementRect = whereToBuyRef.current.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;
      const middle = absoluteElementTop - (window.innerHeight / 2) + (elementRect.height / 2);
      window.scrollTo({
        top: middle,
        behavior: 'smooth'
      });
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${id}` } });
      return;
    }
    
    if (id) {
      try {
        await toggleFavorite(id);
        setIsFavorite(!isFavorite);
      } catch (error) {
        console.error("Error toggling favorite:", error);
      }
    }
  };

  return (
    <div className="bg-white min-h-screen">
      
      <Header showSearch={false} showProfile={false} />
      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Product Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="flex gap-12">
            {/* Product Image */}
            <div className="w-[500px]">
              <div className="relative">
                <a href={laptop.productUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={getImageUrl(laptop.imageUrl)}
                    alt={laptop.name}
                    className="w-full rounded-lg"
                  />
                </a>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-white rounded-full shadow-md hover:bg-red-50"
                    onClick={handleToggleFavorite}
                  >
                    <Heart 
                      className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
                    />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-6">
                {laptop.name}
              </h1>

              <div className="mt-6 mb-8">
                <p className="text-lg font-medium text-gray-700">Price:</p>
                <p className="text-3xl font-bold text-[#04364A]">
                  {laptop.price ? `${laptop.price.toLocaleString()} EGP` : 'Price not listed'}
                </p>
              </div>

              <div className="space-y-4">
                <Button 
                  className="w-full bg-[#04364A] hover:bg-[#032a38] text-white text-lg py-6"
                  onClick={scrollToWhereToBuy}
                >
                  where to buy it
                </Button>
                <Button 
                  className="w-full bg-[#04364A] hover:bg-[#032a38] text-white text-lg py-6"
                  onClick={handleCompare}
                >
                  Compare
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-xl font-medium text-center mb-6">Features</h2>

          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Product information</h3>
          </div>

          <div className="space-y-4">
            {visibleSpecifications.map((spec, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{spec.label}</span>
                <div className="flex-1 mx-4">
                  <Separator className="my-2" />
                </div>
                <span className="text-right font-medium">{spec.value}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => setShowAllSpecs(!showAllSpecs)}
            >
              {showAllSpecs ? 'Show less' : 'Show more'}
              {showAllSpecs ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </section>
        {/* Where to Buy*/}
        <section 
          ref={whereToBuyRef}
          className="bg-white rounded-lg shadow-lg p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-center mb-2">Where can I buy it</h2>
          <div className="flex justify-center items-center gap-16">
            {laptop.seller && (
              <a 
                href={getProductUrl(laptop.productUrl)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-75 transition-opacity flex flex-col items-center gap-2"
              >
              <span className="font-medium text-gray-800">{laptop.seller}</span>
                <img
                  className="h-16"
                  alt={laptop.seller}
                  src={getImageUrl(laptop.imageUrl)}
                />
                <h4 className="opacity-50 transition-opacity">click here</h4>
                <span className={`text-sm ${laptop.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {laptop.inStock ? "In Stock" : "Out of Stock"}
                </span>
              </a>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
