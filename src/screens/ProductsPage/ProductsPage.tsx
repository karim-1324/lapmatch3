import { useState, useEffect, useCallback, useRef, JSX } from "react";
import { useNavigate,useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Checkbox } from "../../components/ui/checkbox";
import { Slider } from "../../components/ui/slider";
import { PlusIcon, MinusIcon, ChevronLeft, ChevronRight, Menu, X, Filter } from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { XCircle } from "lucide-react";
import { ChatbotButton } from "../../components/ChatbotButton";
import { Heart } from "lucide-react";
import { getFavoriteLaptopIds, toggleFavorite } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Product {
  id: string;
  name: string;
  seller: string;
  condition: string;
  brand: string;
  model: string;
  category: string;
  processor: string;
  graphics: string;
  ram: string;
  storage: string;
  display: string;
  display_size?: string; 
  displaySize?: string;
  display_resolution?: string;
  displayResolution?: string;
  price: string | number | null;
  product_url?: string; 
  productUrl?: string;
  image_url?: string;
  imageUrl?: string;
  in_stock: boolean;
  inStock?: boolean;
}

interface FilterOption {
  id: string;
  label: string;
}

const brands: FilterOption[] = [
  { id: "HP", label: "HP" },
  { id: "Asus", label: "ASUS" },
  { id: "Dell", label: "Dell" },
  { id: "Lenovo", label: "Lenovo" },
  { id: "Apple", label: "Apple" },
  { id: "MSI", label: "MSI" },
  { id: "Acer", label: "Acer" },
  { id: "ACEMAGIC", label: "ACEMAGIC" },
];

const categories: FilterOption[] = [
  { id: "Gaming", label: "Gaming" },
  { id: "Study", label: "Study" },
  { id: "Business", label: "Business" },
  { id: "Work", label: "Work" },
  { id: "Standard", label: "Standard" },
  { id: "UltraBook", label: "Ultrabook" },
  { id: "2-in-1", label: "2-in-1" },

];

const storage: FilterOption[] = [
  { id: "64,128,192,160,256", label: "-256 GB" },
  { id: "512", label: "512 GB" },
  { id: "960,1024,1120,1256,1500", label: "1-1.5 TB" },
  { id: "2048", label: "2 TB" },
  { id: "4096", label: "4 TB" },
  { id: "8192", label: "8 TB" },
];

const performance: FilterOption[] = [
  { id: "high", label: "High" },
  { id: "moderate", label: "Moderate" },
  { id: "basic", label: "Basic" },
];

const environment: FilterOption[] = [
  { id: "high-temp", label: "High temp" },
  { id: "dusty", label: "Dusty" },
  { id: "humidity", label: "High humidity" },
];

const screenSizes: FilterOption[] = [
  { id: "7,10,11,12,13", label: "-13 inch" },
  { id: "14", label: "14 inch" },
  //{ id: "15", label: "15 inch" },
  { id: "15.6,15", label: "15 inch" },
  { id: "16", label: "16 inch" },
  { id: "17,18", label: "17+ inch" },
  
];

interface PaginationData {
  count: number;
  next: string | null;
  previous: string | null;
  results: any[];
}

export const ProductsPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatbotLoading, setIsChatbotLoading] = useState(false);
  const [chatbotError, setChatbotError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [compareNotification, setCompareNotification] = useState<string | null>(null);
  const compareTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('page') || '1', 10));
  const [totalPages, setTotalPages] = useState(1);
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => searchParams.getAll('brand') || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => searchParams.getAll('category') || []);
  const [selectedStorage, setSelectedStorage] = useState<string[]>(() => searchParams.getAll('storage') || []);
  const [selectedPerformance, setSelectedPerformance] = useState<string[]>(() => searchParams.getAll('performance') || []);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string[]>(() => searchParams.getAll('environment') || []);
  const [selectedScreenSizes, setSelectedScreenSizes] = useState<string[]>(() => searchParams.getAll('screen_size') || []);
    //const [priceRange, setPriceRange] = useState([0, 200000]);
    const [priceRange, setPriceRange] = useState<[number, number]>(() => [
    parseInt(searchParams.get('min_price') || '0', 10),
    // parseInt(searchParams.get('max_price') || '200000', 10)
    parseInt(searchParams.get('max_price') || '260000', 10)
  ]);
  // const handleSearch = (query: string) => {
  //   setSearchQuery(query);
  //   setCurrentPage(1);
  // };
  const handleChatbotSubmit = async () => {
    if (!chatbotQuery.trim()) return;

    setIsChatbotLoading(true);
    setChatbotError(null);
    setIsLoading(true);
    setShowingChatbotResults(true); // Set state first
    // Clear filter states (optional, but good practice)
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedStorage([]);
    setSelectedPerformance([]);
    setSelectedScreenSizes([]);
    // setPriceRange([0, 200000]);
    setPriceRange([0, 260000]);
    setSearchQuery("");
    setSortOrder("");
    setCurrentPage(1);

    // Save user message to chat history in sessionStorage
    const savedMessages = sessionStorage.getItem("chatMessages");
    let chatHistory = [];
    try {
      chatHistory = savedMessages ? JSON.parse(savedMessages) : [];
    } catch (e) {
      console.error("Failed to parse chat messages from sessionStorage", e);
      chatHistory = [];
    }
    
    // Add user message to chat history
    chatHistory.push({ sender: "user", text: chatbotQuery });
    
    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatbotQuery }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Chatbot request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Assuming the chatbot API returns { laptops: Product[], specs: any }
      if (data.laptops && Array.isArray(data.laptops)) {
        const mappedProducts = data.laptops.map((product: any) => ({
          ...product,
          // Add mappings if chatbot API returns different field names than filter API
          displaySize: product.display_size ?? product.displaySize,
          displayResolution: product.display_resolution ?? product.displayResolution,
          productUrl: product.product_url ?? product.productUrl,
          imageUrl: product.image_url ?? product.imageUrl,
          inStock: product.in_stock ?? product.inStock
        }));
        setProducts(mappedProducts);
        setPagination(null);
        setTotalPages(1);
        localStorage.setItem('chatbotResults', JSON.stringify(mappedProducts));
        localStorage.setItem('chatbotQuery', chatbotQuery);
        
        // Add bot response to chat history with the laptops
        chatHistory.push({ 
          sender: "bot", 
          text: "Here are some laptops that match your requirements:", 
          laptops: mappedProducts,
          specs: data.specs
        });
      } else {
        setProducts([]);
        setPagination(null);
        setTotalPages(1);
        localStorage.removeItem('chatbotResults');
        
        // Add bot response with no results
        chatHistory.push({ 
          sender: "bot", 
          text: "I couldn't find any laptops matching your requirements. Could you try a different query?" 
        });
      }
      
      // Save updated chat history
      sessionStorage.setItem("chatMessages", JSON.stringify(chatHistory));
      
      console.log("Chatbot Specs:", data.specs);
      setIsChatbotInputVisible(false);

    } catch (error: any) {
      console.error("Error fetching from chatbot:", error);
      setChatbotError(error.message || "Failed to get results from AI assistant.");
      setProducts([]);
      setPagination(null);
      setTotalPages(1);
      localStorage.removeItem('chatbotResults');
      
      // Add error message to chat history
      chatHistory.push({ 
        sender: "bot", 
        error: error.message || "Failed to get results from AI assistant."
      });
      sessionStorage.setItem("chatMessages", JSON.stringify(chatHistory));
    } finally {
      setIsChatbotLoading(false);
      setIsLoading(false);
    }
  };

  // --- Function to clear chatbot results and revert to filters ---
  const clearChatbotResults = () => {
    setShowingChatbotResults(false);
    setChatbotQuery(""); // Clear the query state
    setChatbotError(null);
    setCurrentPage(1); // Reset page
    // Clear localStorage when clearing results
    localStorage.removeItem('chatbotResults');
    localStorage.removeItem('chatbotQuery');
    // No need to call fetchProducts explicitly, useEffect will handle it
    // when showingChatbotResults changes.
    // updateSearchParams will be called by the useEffect below.
  };
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || "");
  const [sortOrder, setSortOrder] = useState<string>(() => searchParams.get('ordering') || "");
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    category: false,
    storage: false,
    performance: false,
    environment: false,
    screenSize: false,
  });
  // Add this with your other useState declarations in ProductsPage.tsx
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [allExpanded, setAllExpanded] = useState(false);
  const [chatbotQuery, setChatbotQuery] = useState(() => searchParams.get('chatbotQuery') || "");
  const [showingChatbotResults, setShowingChatbotResults] = useState(() => searchParams.get('source') === 'chatbot');
  const [isChatbotInputVisible, setIsChatbotInputVisible] = useState(false);
  // Add this new function
  const toggleAllSections = () => {
    setExpandedSections({
      brand: !allExpanded,
      category: !allExpanded,
      storage: !allExpanded,
      performance: !allExpanded,
      environment: !allExpanded,
      screenSize: !allExpanded,
    });
    setAllExpanded(!allExpanded);
  };
  const updateSearchParams = useCallback(() => {
    const params = new URLSearchParams();

    if (showingChatbotResults) {
        params.set('source', 'chatbot');
        if (chatbotQuery) params.set('chatbotQuery', chatbotQuery);
        // Don't add filter params when showing chatbot results
    } else {
        // Add filter params only when not showing chatbot results
        if (searchQuery) params.set('search', searchQuery);
        if (currentPage > 1) params.set('page', currentPage.toString());
        if (sortOrder) params.set('ordering', sortOrder);
        selectedBrands.forEach(val => params.append('brand', val));
        selectedCategories.forEach(val => params.append('category', val));
        selectedStorage.forEach(val => params.append('storage', val));
        selectedPerformance.forEach(val => params.append('performance', val));
        selectedScreenSizes.forEach(val => params.append('screen_size', val));
        // Add environment if used: selectedEnvironment.forEach(val => params.append('environment', val));
        if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
        // if (priceRange[1] < 200000) params.set('max_price', priceRange[1].toString());
        if (priceRange[1] < 260000) params.set('max_price', priceRange[1].toString());
    }

    // Use replace: true to avoid adding entries to browser history for filter changes
    setSearchParams(params, { replace: true });
  }, [
      searchQuery, currentPage, sortOrder, selectedBrands, selectedCategories,
      selectedStorage, selectedPerformance, selectedScreenSizes, priceRange,
      showingChatbotResults, chatbotQuery, setSearchParams // Add setSearchParams dependency
  ]);
  const fetchProducts = useCallback(async () => {
    if (showingChatbotResults) {
      setIsLoading(false); // Ensure loading state is off if we skip fetching
      return;
  }
    try {
      setIsLoading(true);
      setChatbotError(null);
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);
      queryParams.append('page', currentPage.toString());
      if (sortOrder) queryParams.append('ordering', sortOrder);
      if (selectedBrands.length > 0) queryParams.append('brand', selectedBrands.join(','));
      if (selectedCategories.length > 0) queryParams.append('category', selectedCategories.join(','));
      if (selectedStorage.length > 0) queryParams.append('storage', selectedStorage.join(','));
      if (selectedPerformance.length > 0) queryParams.append('performance', selectedPerformance.join(','));
      if (selectedScreenSizes.length > 0) {
         // Keep your existing screen size mapping logic here
         const screenSizeValues = selectedScreenSizes.map(size => {
            // ... your switch case ...
            return size; // Simplified for example
         }).join(',');
         queryParams.append('screen_size', screenSizeValues);
      }
      queryParams.append('min_price', priceRange[0].toString());
      queryParams.append('max_price', priceRange[1].toString());

      const response = await fetch(`${API_BASE_URL}/laptops?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      if (data.count !== undefined && data.next !== undefined && data.previous !== undefined) {
        setPagination(data);
        const pageSize = 10; // Assuming 10 items per page, adjust if needed
        setTotalPages(Math.ceil(data.count / pageSize));
      }
      else {
        setPagination(null); // Handle cases where pagination info might be missing
        setTotalPages(1);
      }
      const mapProductData = (product: any) => ({
        ...product,
        displaySize: product.display_size ?? product.displaySize,
        displayResolution: product.display_resolution ?? product.displayResolution,
        productUrl: product.product_url ?? product.productUrl,
        imageUrl: product.image_url ?? product.imageUrl,
        inStock: product.in_stock ?? product.inStock
      });
      if (data.results) {
        setProducts(data.results.map(mapProductData));
      } else if (Array.isArray(data)) { // Handle cases where API might return just an array
        setProducts(data.map(mapProductData));
      } else {
        console.error("Unexpected API response format:", data);
        setProducts([]);
      }

    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]); // Clear products on error
      setPagination(null);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  },[
    showingChatbotResults, searchQuery, currentPage, sortOrder, selectedBrands,
    selectedCategories, selectedStorage, selectedPerformance, selectedScreenSizes,
    priceRange
]);

const fetchFavoriteIds = useCallback(async () => {
  if (isAuthenticated) {
    try {
      const ids = await getFavoriteLaptopIds();
      setFavoriteIds(ids);
    } catch (error) {
      console.error("Error fetching favorite IDs:", error);
    }
  }
}, [isAuthenticated]);

// Add this to your useEffect that runs on mount
useEffect(() => {
  fetchFavoriteIds();
}, [fetchFavoriteIds]);

// Add this function to handle toggling favorites
const handleToggleFavorite = async (e: React.MouseEvent, productId: string) => {
  e.stopPropagation(); // Prevent triggering the card click
  
  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/products' } });
    return;
  }
  
  try {
    await toggleFavorite(productId);
    // Update local state
    setFavoriteIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  } catch (error) {
    console.error("Error toggling favorite:", error);
  }
};
  // Add this useEffect to restore chatbot results from localStorage
  useEffect(() => {
    // Check if we should restore chatbot results
    const savedChatbotResults = localStorage.getItem('chatbotResults');
    const savedChatbotQuery = localStorage.getItem('chatbotQuery');
    
    if (savedChatbotResults && savedChatbotQuery && searchParams.get('source') === 'chatbot') {
      try {
        const parsedResults = JSON.parse(savedChatbotResults);
        setProducts(parsedResults);
        setChatbotQuery(savedChatbotQuery);
        setShowingChatbotResults(true);
        setPagination(null);
        setTotalPages(1);
        setIsLoading(false); // Ensure loading is turned off
      } catch (error) {
        console.error("Error restoring chatbot results:", error);
        // If restoration fails, fall back to normal product fetching
        if (!showingChatbotResults) {
          fetchProducts();
        }
      }
    } else if (showingChatbotResults && !savedChatbotResults) {
      // If showing chatbot results but no saved results, clear the flag
      setShowingChatbotResults(false);
      fetchProducts();
    } else if (!showingChatbotResults) {
      // Normal case - fetch products with filters
      fetchProducts();
    }
  }, []);  // Empty dependency array means this runs once on mount

  useEffect(() => {
    updateSearchParams();
    if (!showingChatbotResults) {
      fetchProducts();
    } else {
      if (products.length === 0 && !isChatbotLoading && chatbotQuery) {

      }
    }
  // Add updateSearchParams to dependency array
  }, [fetchProducts, showingChatbotResults, updateSearchParams, products.length, isChatbotLoading, chatbotQuery]); // Add dependencies
  
  const handleCheckboxChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, _currentValues: string[], id: string) => {
    setter(prev =>
      prev.includes(id) ? prev.filter(val => val !== id) : [...prev, id]
    );
    setCurrentPage(1); // Reset page on filter change
  };

  const handlePriceChange = (newRange: number[]) => {
    setPriceRange(newRange as [number, number]);
    // Debounce or handle onValueCommit in Slider if needed
    setCurrentPage(1);
  };

   const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
    setCurrentPage(1);
  };

   const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProductClick = (productId: string) => {
    // Navigate to product detail page while preserving the source parameter
    if (showingChatbotResults) {
      navigate(`/product/${productId}?source=chatbot`);
    } else {
      navigate(`/product/${productId}`);
    }
  };

  const handleCompare = (productId: string) => {
    const compareProductId = localStorage.getItem('compareProductId');
    if (compareProductId) {
      navigate(`/compare/${compareProductId}/${productId}`);
      localStorage.removeItem('compareProductId');
    } else {
      localStorage.setItem('compareProductId', productId);
      setCompareNotification("Product added for comparison. Select another product.");
      if (compareTimeoutRef.current) clearTimeout(compareTimeoutRef.current);
      compareTimeoutRef.current = setTimeout(() => setCompareNotification(null), 3000);
    }
  };

  // Add this new function to clear all filters
  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSelectedStorage([]);
    setSelectedPerformance([]);
    setSelectedEnvironment([]);
    setSelectedScreenSizes([]);
    // setPriceRange([0, 200000]);
    setPriceRange([0, 260000]);
    setSearchQuery("");
    setSortOrder("");
    setCurrentPage(1);
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
      
      <Header 
        showSearch={true} 
        showProfile={false}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      <main className="max-w-[1440px] mx-auto px-6 py-8">
        {/* --- Chatbot Input Section --- */}
        {/* <div className="mb-4 p-3 border border-blue-200 rounded-lg bg-blue-50">
           <div className="flex justify-between items-center">
             <h2 className="text-lg font-semibold text-blue-800 flex items-center">
               <Bot className="w-5 h-5 mr-2" />
               AI Assistant
             </h2>
             <div className="flex gap-2">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => navigate('/chatbot')}
                 className="text-blue-600 hover:bg-blue-100"
               >
                 View Chat History
               </Button>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setIsChatbotInputVisible(!isChatbotInputVisible)}
                 className="text-blue-600 hover:bg-blue-100"
               >
                 {isChatbotInputVisible ? "Hide" : "Ask for recommendations"}
               </Button>
             </div>
           </div>
           {isChatbotInputVisible && (
             <div className="mt-4 flex gap-2">
               <Input
                 type="text"
                 placeholder="e.g., 'Gaming laptop under 50000 EGP with RTX graphics'"
                 value={chatbotQuery}
                 onChange={(e) => setChatbotQuery(e.target.value)} // Update chatbot query state directly
                 onKeyPress={(e) => e.key === 'Enter' && handleChatbotSubmit()}
                 className="flex-grow"
                 disabled={isChatbotLoading}
               />
               <Button onClick={handleChatbotSubmit} disabled={isChatbotLoading || !chatbotQuery.trim()}>
                 <Send className="w-4 h-4 mr-2" />
                 {isChatbotLoading ? "Searching..." : "Get Laptops"}
               </Button>
             </div>
           )}
        </div> */}

        {/* Sorting */}
        <div className="flex justify-between items-center mb-2">
          {/* Conditionally render title based on source */}
          <h1 className="text-2xl font-bold">{showingChatbotResults ? "AI Assistant Results" : "Products"}</h1>
           {/* Clear All Filters button - only show when filters are active */}
            {(selectedBrands.length > 0 || 
              selectedCategories.length > 0 || 
              selectedStorage.length > 0 || 
              selectedPerformance.length > 0 || 
              selectedEnvironment.length > 0 || 
              selectedScreenSizes.length > 0 || 
              priceRange[0] > 0 || 
              // priceRange[1] < 200000 ||
              priceRange[1] < 260000 ||
              searchQuery.trim() !== "" ||
              sortOrder !== "") && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearAllFilters}
                className="w-72 mb-1 ml-52 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          <div className="flex items-center space-x-2">
            <label htmlFor="sortOrder" className=" font-medium text-gray-700">
              Sort by :
            </label>
            <div className="relative">
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={handleSortChange} // Use the handler
                className="block w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8  text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={showingChatbotResults} // Disable sorting for chatbot results
                >
                {/* ... options ... */}
                 <option value="">Default</option>
                 <option value="price">Min Price</option>
                 <option value="-price">Max Price</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex gap-8">
        {/* Desktop Filters - Add hidden md:block to hide on mobile */}
        <div className={`hidden md:block w-[300px] bg-white rounded-lg shadow-lg p-6 ${showingChatbotResults ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filter</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleAllSections}
                className="text-gray-600 hover:bg-gray-100"
              >
                {allExpanded ? (
                  <>
                    <MinusIcon className="h-4 w-4 mr-2" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Expand All
                  </>
                )}
              </Button>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('brand')}>
                <h3 className="font-medium">Brand</h3>
                {expandedSections.brand ? (
                  <MinusIcon className="h-4 w-4" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
              </div>
              {expandedSections.brand && (
                  <div className="space-y-2 mt-3">
                    {brands.map((brand) => (
                      <label key={brand.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedBrands.includes(brand.id)}
                          onCheckedChange={() => handleCheckboxChange(setSelectedBrands, selectedBrands, brand.id)} // Use handler
                        />
                        <span>{brand.label}</span>
                      </label>
                    ))}
                </div>
              )}
            </div>
            <Separator className="my-4" />

            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('category')}>
                <h3 className="font-medium">Category</h3>
                {expandedSections.category ? (
                  <MinusIcon className="h-4 w-4" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
              </div>
              {expandedSections.category && (
                <div className="space-y-2 mt-3">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category.id]);
                          } else {
                            setSelectedCategories(selectedCategories.filter((id) => id !== category.id));
                          }
                        }}
                      />
                      <span>{category.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Separator className="my-4" />

            {/* Storage Filter */}
            <div className="mb-6">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('storage')}>
                <h3 className="font-medium">Storage</h3>
                {expandedSections.storage ? (
                  <MinusIcon className="h-4 w-4" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
              </div>
              {expandedSections.storage && (
                <div className="space-y-2 mt-3">
                  {storage.map((option) => (
                    <label key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedStorage.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStorage([...selectedStorage, option.id]);
                          } else {
                            setSelectedStorage(selectedStorage.filter((id) => id !== option.id));
                          }
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Separator className="my-4" />

            {/* Performance */}
            <div className="mb-6">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('performance')}>
                <h3 className="font-medium">Performance</h3>
                {expandedSections.performance ? (
                  <MinusIcon className="h-4 w-4" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
              </div>
              {expandedSections.performance && (
                <div className="space-y-2 mt-3">
                  {performance.map((option) => (
                    <label key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedPerformance.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPerformance([...selectedPerformance, option.id]);
                          } else {
                            setSelectedPerformance(selectedPerformance.filter((id) => id !== option.id));
                          }
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Separator className="my-4" />

            {/* Environmental */}
            {/*<div className="mb-6">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('environment')}>
                <h3 className="font-medium">Environmental Condition</h3>
                {expandedSections.environment ? (
                  <MinusIcon className="h-4 w-4" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
              </div>
              {expandedSections.environment && (
                <div className="space-y-2 mt-3">
                  {environment.map((option) => (
                    <label key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedEnvironment.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEnvironment([...selectedEnvironment, option.id]);
                          } else {
                            setSelectedEnvironment(selectedEnvironment.filter((id) => id !== option.id));
                          }
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Separator className="my-4" />*/}

            {/* Screen Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('screenSize')}>
                <h3 className="font-medium">Screen Size</h3>
                {expandedSections.screenSize ? (
                  <MinusIcon className="h-4 w-4" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
              </div>
              {expandedSections.screenSize && (
                <div className="space-y-2 mt-3">
                  {screenSizes.map((option) => (
                    <label key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedScreenSizes.includes(option.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedScreenSizes([...selectedScreenSizes, option.id]);
                          } else {
                            setSelectedScreenSizes(selectedScreenSizes.filter((id) => id !== option.id));
                          }
                        }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <Separator className="my-4" />

            {/* Budget */}
            <div className="mb-6">
                 <h3 className="font-medium mb-3">Budget</h3>
                 <Slider
                   value={priceRange} // Use state value
                  //  max={200000}
                  max={260000}
                   step={1000}
                   onValueChange={handlePriceChange} // Use handler (consider onValueCommit if available/needed)
                 />
                 <div className="flex justify-between mt-2">
                   <span>${priceRange[0].toLocaleString()}</span>
                   <span>${priceRange[1].toLocaleString()}</span>
                 </div>
               </div>
          </div>

          <div className="flex-1">
          {showingChatbotResults && !isChatbotLoading && (
              <div className="mb-2 text-red-800 border-red-200 hover:bg-red-50 hover:text-red-700">
                <Button variant="outline" size="sm" onClick={clearChatbotResults}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear AI Results & Show Filters
                </Button>
              </div>

            )}
            {/* --- End Clear Button --- */}
           
            {/* --- Display Chatbot Error --- */}
            {chatbotError && (
                <div className="mb-4 p-4 border border-red-300 bg-red-50 text-red-700 rounded-md">
                    <p><strong>AI Assistant Error:</strong> {chatbotError}</p>
                </div>
            )}
            <div className="flex justify-between items-center mb-8">
              <div></div>
              {pagination && !showingChatbotResults && (
                <p className="text-gray-600">
                  Showing {products.length} of {pagination.count} products
                </p>
              )}
              {showingChatbotResults && !isChatbotLoading && (
                <p className="text-gray-600">
                  Showing {products.length} products from AI Assistant
                </p>
              )}
            </div>
            
            {isLoading || isChatbotLoading ? (
              <div className="flex justify-center items-center h-64">
                <p>{isChatbotLoading ? "AI Assistant is searching..." : "Loading products..."}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex justify-center items-center h-64 border border-gray-200 rounded-lg p-8">
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-4">
                    {showingChatbotResults ? "AI Assistant couldn't find matching laptops." : "No products found matching your criteria."}
                  </p>
                  <p className="text-sm text-gray-500">
                    {showingChatbotResults ? "Try rephrasing your request or clear the AI results." : "Try adjusting your filters or check back later."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                    <Card key={product.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-48 object-contain cursor-pointer"
                        onClick={() => handleProductClick(product.id)}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-laptop.png'; }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white rounded-full shadow-md hover:bg-red-50"
                        onClick={(e) => handleToggleFavorite(e, product.id)}
                      >
                        <Heart 
                          className={`h-5 w-5 ${favoriteIds.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
                        />
                      </Button>
                    </div>
                      <div className="p-4">
                        <h3 className="font-medium text-lg mb-2 line-clamp-2 h-14">{product.name}</h3>
                        <p className="text-2xl font-bold text-[#04364A] mb-4">
                          {product.price 
                            ? `${typeof product.price === 'string' 
                                ? parseFloat(product.price).toLocaleString() 
                                : (product.price as number).toLocaleString()} EGP`
                            : 'Price not listed'}
                        </p>
                        <p className={`text-sm mb-4 ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </p> 
                        <div className="flex gap-2">
                        <Button
                            className="flex-1 bg-[#04364A] hover:bg-[#032a38] text-white"
                            onClick={() => handleProductClick(product.id)} // Use navigation handler
                          >
                            View more
                          </Button>
                          <Button
                            className="flex-1 bg-[#04364A] hover:bg-[#032a38] text-white"
                            onClick={() => handleCompare(product.id)} // Use compare handler
                          >
                            Compare
                          </Button>
                        </div>
                      </div>
                    </Card>
                ))}
              </div>
              {/* Pagination */}
              {totalPages > 1 && !showingChatbotResults && (
                <div className="flex justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }     
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="icon"
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden mb-4">
          <Button 
            onClick={() => setShowMobileFilters(true)} 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            disabled={showingChatbotResults}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
            <div className="bg-white h-full w-[85%] max-w-sm overflow-auto p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowMobileFilters(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Copy of your filters with simplified styling */}
              <div className="space-y-6">
                {/* Brand Filter - Mobile */}
                <div>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('brand')}>
                    <h3 className="font-medium">Brand</h3>
                    {expandedSections.brand ? (
                      <MinusIcon className="h-4 w-4" />
                    ) : (
                      <PlusIcon className="h-4 w-4" />
                    )}
                  </div>
                  {expandedSections.brand && (
                    <div className="space-y-2 mt-3">
                      {brands.map((brand) => (
                        <label key={brand.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedBrands.includes(brand.id)}
                            onCheckedChange={() => handleCheckboxChange(setSelectedBrands, selectedBrands, brand.id)}
                          />
                          <span>{brand.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4"></div>
                
                {/* Category Filter - Mobile */}
                <div>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('category')}>
                    <h3 className="font-medium">Category</h3>
                    {expandedSections.category ? (
                      <MinusIcon className="h-4 w-4" />
                    ) : (
                      <PlusIcon className="h-4 w-4" />
                    )}
                  </div>
                  {expandedSections.category && (
                    <div className="space-y-2 mt-3">
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category.id]);
                              } else {
                                setSelectedCategories(selectedCategories.filter((id) => id !== category.id));
                              }
                            }}
                          />
                          <span>{category.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4"></div>
                
                {/* Storage Filter - Mobile */}
                <div>
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection('storage')}>
                    <h3 className="font-medium">Storage</h3>
                    {expandedSections.storage ? (
                      <MinusIcon className="h-4 w-4" />
                    ) : (
                      <PlusIcon className="h-4 w-4" />
                    )}
                  </div>
                  {expandedSections.storage && (
                    <div className="space-y-2 mt-3">
                      {storage.map((option) => (
                        <label key={option.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedStorage.includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStorage([...selectedStorage, option.id]);
                              } else {
                                setSelectedStorage(selectedStorage.filter((id) => id !== option.id));
                              }
                            }}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-4"></div>
                
                {/* Other filters continue with same pattern */}
                
                {/* Budget - Mobile */}
                <div>
                  <h3 className="font-medium mb-3">Budget</h3>
                  <Slider
                    value={priceRange}
                    max={260000}
                    step={1000}
                    onValueChange={handlePriceChange}
                  />
                  <div className="flex justify-between mt-2">
                    <span>${priceRange[0].toLocaleString()}</span>
                    <span>${priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4"></div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      clearAllFilters();
                      setShowMobileFilters(false);
                    }}
                  >
                    Clear All
                  </Button>
                  <Button 
                    className="flex-1 bg-[#04364A]"
                    onClick={() => setShowMobileFilters(false)}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {compareNotification && (
          <div
            className="fixed top-6 right-6 bg-[#04364A] text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-md animate-in slide-in-from-right"
            style={{
              animation: "slideIn 0.3s ease-out forwards",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div>
              <p className="font-medium">{compareNotification}</p>
            </div>
          </div>
        )}
      </main>
      {/* {isAuthenticated && <ChatbotButton />} */}
      <ChatbotButton />
      <Footer />
    </div>
  );
};
