import { useState, useEffect, JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { ChevronDownIcon, ChevronUpIcon, PlusCircleIcon, XCircleIcon, Heart } from "lucide-react";
import { API_BASE_URL } from '../../config/api';
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { getFavoriteLaptopIds, toggleFavorite } from "../../services/api";
import { mockLaptops, placeholderImages } from "../../data/mockLaptops";

const formatStorage = (value: string | number) => {
  const numValue = Number(value);
  if (numValue >= 1024) {
    return `${numValue / 1024} TB`;
  }
  return `${numValue} GB`;
};

interface LaptopDetails {
  id: string;
  name: string;
  brand: string;
  model: string;
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

export const ComparePage = (): JSX.Element => {
  const { productId, secondProductId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product1, setProduct1] = useState<LaptopDetails | null>(null);
  const [product2, setProduct2] = useState<LaptopDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [isFavorite1, setIsFavorite1] = useState(false);
  const [isFavorite2, setIsFavorite2] = useState(false);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        if (!productId) {
          throw new Error('No product ID provided');
        }
        
        // Get first product from mock data
        const firstProductId = parseInt(productId);
        const mockProduct1 = mockLaptops.find(laptop => laptop.id === firstProductId);
        
        if (!mockProduct1) {
          throw new Error('First product not found');
        }
        
        setProduct1({
          id: mockProduct1.id.toString(),
          name: mockProduct1.name,
          brand: mockProduct1.brand,
          model: mockProduct1.name,
          category: mockProduct1.category,
          processor: mockProduct1.specs.processor,
          graphics: mockProduct1.specs.gpu,
          ram: mockProduct1.specs.ram,
          storage: mockProduct1.specs.storage,
          display: mockProduct1.specs.display,
          displaySize: mockProduct1.specs.display.split('-')[0].trim(),
          displayResolution: mockProduct1.specs.display.includes('FHD') ? 'FHD' : 
                            mockProduct1.specs.display.includes('QHD') ? 'QHD' : 
                            mockProduct1.specs.display.includes('OLED') ? 'OLED' : 'HD',
          price: mockProduct1.price,
          productUrl: "#",
          imageUrl: mockProduct1.image,
          inStock: mockProduct1.inStock
        });

        if (secondProductId) {
          const secondProductIdInt = parseInt(secondProductId);
          const mockProduct2 = mockLaptops.find(laptop => laptop.id === secondProductIdInt);
          
          if (mockProduct2) {
            setProduct2({
              id: mockProduct2.id.toString(),
              name: mockProduct2.name,
              brand: mockProduct2.brand,
              model: mockProduct2.name,
              category: mockProduct2.category,
              processor: mockProduct2.specs.processor,
              graphics: mockProduct2.specs.gpu,
              ram: mockProduct2.specs.ram,
              storage: mockProduct2.specs.storage,
              display: mockProduct2.specs.display,
              displaySize: mockProduct2.specs.display.split('-')[0].trim(),
              displayResolution: mockProduct2.specs.display.includes('FHD') ? 'FHD' : 
                              mockProduct2.specs.display.includes('QHD') ? 'QHD' : 
                              mockProduct2.specs.display.includes('OLED') ? 'OLED' : 'HD',
              price: mockProduct2.price,
              productUrl: "#",
              imageUrl: mockProduct2.image,
              inStock: mockProduct2.inStock
            });
          } else {
            console.error("Second product not found in mock data");
            setProduct2(null);
          }
        } else {
          setProduct2(null);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        const mockProduct1 = {
          id: "1",
          name: "HP EliteBook 845 Business Laptop",
          brand: "HP",
          model: "EliteBook 845 G8",
          category: "Business",
          processor: "AMD Ryzen 5 PRO 5650U",
          graphics: "AMD Radeon Vega 7",
          ram: "32 GB",
          storage: "1 TB SSD",
          display: "14-inch FHD (1920x1080)",
          displaySize: "14 inch",
          displayResolution: "FHD",
          price: 1299,
          productUrl: "https://www.amazon.com/dp/B0CNSLZHL4",
          imageUrl: "https://m.media-amazon.com/images/I/71b1KNPVIGL._AC_UY218_.jpg",
          inStock: true
        };

        setProduct1(mockProduct1);
        
        // Only set product2 if secondProductId is provided
        if (secondProductId) {
          const mockProduct2 = {
            id: "2",
            name: "HP ZBook 15 G3 Workstation Laptop",
            brand: "HP",
            model: "ZBook 15 G3",
            category: "Workstation",
            processor: "Intel Core i7-6700HQ",
            graphics: "AMD Firepro W5170M 2GB",
            ram: "8 GB",
            storage: "256 GB",
            display: "15.6-inch FHD IPS (1920x1080, 60Hz)",
            displaySize: "15.6 inch",
            displayResolution: "FHD",
            price: 13250,
            productUrl: "https://www.awfarlak.com/p/22226u7/",
            imageUrl: "https://www.awfarlak.com/wp-content/uploads/2024/05/HP_T7V51EA-NL-APPROVED-ONE_INT_11-400x457.jpg",
            inStock: false
          };
          setProduct2(mockProduct2);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    
    // Check if products are in favorites
    const checkFavoriteStatus = async () => {
      if (isAuthenticated && (productId || secondProductId)) {
        try {
          const favoriteIds = await getFavoriteLaptopIds();
          
          if (productId) {
            setIsFavorite1(favoriteIds.includes(productId));
          }
          
          if (secondProductId) {
            setIsFavorite2(favoriteIds.includes(secondProductId));
          }
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [productId, secondProductId, isAuthenticated]);

  const handleToggleFavorite = async (productId: string, isProduct1: boolean) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/compare/${productId}${secondProductId ? `/${secondProductId}` : ''}` } });
      return;
    }
    
    try {
      await toggleFavorite(productId);
      if (isProduct1) {
        setIsFavorite1(!isFavorite1);
      } else {
        setIsFavorite2(!isFavorite2);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleAddProduct = () => {
    if (productId) {
      localStorage.setItem('compareProductId', productId);
    }
    navigate('/products');
  };

  if (isLoading || !product1) {
    return <div>Loading...</div>;
  }

  // Create specification data for the first product
  const basicSpecificationData = [
    { label: "Brand", value1: product1.brand, value2: product2?.brand },
    { label: "Model", value1: product1.model, value2: product2?.model },
    { label: "Category", value1: product1.category, value2: product2?.category },
  ];

  const additionalSpecificationData = [
    { label: "Processor", value1: product1.processor, value2: product2?.processor },
    { label: "Graphics", value1: product1.graphics, value2: product2?.graphics },
    { label: "RAM", value1: formatStorage(product1.ram), value2: product2 ? formatStorage(product2.ram) : null },
    { label: "Storage", value1: formatStorage(product1.storage), value2: product2 ? formatStorage(product2.storage) : null },
    { label: "Display", value1: product1.display, value2: product2?.display },
    { label: "Display Size", value1: `${product1.displaySize}"`, value2: product2 ? `${product2.displaySize}"` : null },
    { label: "Display Resolution", value1: product1.displayResolution, value2: product2?.displayResolution },
  ];
  // @ts-ignore
  const visibleSpecifications = showAllSpecs
    ? [...basicSpecificationData, ...additionalSpecificationData]
    : basicSpecificationData;

  return (
    <div className="bg-white min-h-screen">
    <Header showSearch={false} showProfile={false} />

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8">Compare Laptops</h1>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-4 relative">
              <div className="absolute top-2 left-2">
                <button 
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => {
                    if (product2) {
                      navigate(`/compare/${product2.id}`);
                    } else {
                      navigate('/products');
                    }
                  }}
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="absolute top-2 right-2">
                {product1 && (
                  <button
                    className="bg-white rounded-full p-1 hover:bg-gray-100"
                    onClick={() => handleToggleFavorite(product1.id, true)}
                  >
                    <Heart 
                      className={`h-5 w-5 ${isFavorite1 ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
                    />
                  </button>
                )}
              </div>
              
              <div className="flex justify-center mb-6">
                <img 
                  src={getImageUrl(product1.imageUrl)} 
                  alt={product1.name} 
                  className="h-48 object-contain" 
                />
              </div>
              <div className="min-h-[80px] flex items-center justify-center">
                <h2 className="text-xl font-bold text-center">{product1.name}</h2>
              </div>
              <p className="text-2xl font-bold text-[#04364A] text-center mb-2">
                {product1.price ? `$${product1.price.toLocaleString()}` : 'Price not listed'}
              </p>
              <Button 
                className="w-full bg-[#04364A] hover:bg-[#032a38] text-white mt-4"
                onClick={() => navigate(`/product/${product1.id}`)}
              >
                Details
              </Button>
            </div>
          </div>

          <div>
            {product2 ? (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4 relative">
                <div className="absolute top-2 left-2">
                  <button 
                    className="text-gray-500 hover:text-red-500"
                    onClick={() => {
                      navigate(`/compare/${product1.id}`);
                    }}
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="absolute top-2 right-2">
                  <button
                    className="bg-white rounded-full p-1 hover:bg-gray-100"
                    onClick={() => handleToggleFavorite(product2.id, false)}
                  >
                    <Heart 
                      className={`h-5 w-5 ${isFavorite2 ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} 
                    />
                  </button>
                </div>
                
                <div className="flex justify-center mb-6">
                  <img 
                    src={getImageUrl(product2.imageUrl)} 
                    alt={product2.name} 
                    className="h-48 object-contain" 
                  />
                </div>
                <div className="min-h-[80px] flex items-center justify-center">
                  <h2 className="text-xl font-bold text-center">{product2.name}</h2>
                </div>
                <p className="text-2xl font-bold text-[#04364A] text-center mb-2">
                  {product2.price ? `$${product2.price.toLocaleString()}` : 'Price not listed'}
                </p>
                <Button 
                  className="w-full bg-[#04364A] hover:bg-[#032a38] text-white mt-4"
                  onClick={() => navigate(`/product/${product2.id}`)}
                >
                  Details
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4 flex flex-col items-center justify-center h-[300px] hover:bg-[#F5F5F5]" 
              onClick={handleAddProduct}>
                <PlusCircleIcon className="h-16 w-16 text-[#04364A] mb-4"/>
                <h2 className="text-xl font-bold mb-6 text-center">Add a product to compare</h2>
                <Button 
                  className="w-full bg-[#04364A] hover:bg-[#032a38] text-white"
                >
                  Select Product
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {product2 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Specs Comparison</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="font-medium">{product1.brand} {product1.model}</div>
              <div className="font-medium">{product2.brand} {product2.model}</div>
            </div>
            
            <Separator className="mb-4" />
            
            {basicSpecificationData.map((spec, index) => (
              <div key={`basic-${index}`} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-700">{spec.label}</span>
                  <span>{spec.value1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">{spec.label}</span>
                  <span>{spec.value2 || '-'}</span>
                </div>
              </div>
            ))}
            
            {showAllSpecs && additionalSpecificationData.map((spec, index) => (
              <div key={`additional-${index}`} className="grid grid-cols-2 gap-4 py-2 border-b border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-700">{spec.label}</span>
                  <span>{spec.value1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">{spec.label}</span>
                  <span>{spec.value2 || '-'}</span>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center mt-6">
              <Button 
                variant="ghost" 
                className="flex items-center gap-2"
                onClick={() => setShowAllSpecs(!showAllSpecs)}
              >
                {showAllSpecs ? (
                  <>Show less <ChevronUpIcon className="h-4 w-4" /></>
                ) : (
                  <>Show more <ChevronDownIcon className="h-4 w-4" /></>
                )}
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};