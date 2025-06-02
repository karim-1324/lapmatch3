import { useState, useEffect, JSX } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
// import { Slider } from "../../components/ui/slider";
import { API_BASE_URL } from "../../config/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";

interface Laptop {
  id: string;
  name: string;
  brand: string;
  model: string;
  ram: string;
  storage: string;
  display: string;
  graphics: string;
  price: number;
  imageUrl: string;
  similarity: number;
  specialized_score?: number;
  specialized_comments?: string;
  description?: string;
  performanceLevel?: string;
}

export const LaptopFinderPage2 = (): JSX.Element => {
  // Initialize state from localStorage if available
  const [primaryUse, setPrimaryUse] = useState(() => localStorage.getItem('laptopFinder_primaryUse') || "");
  const [minPrice, setMinPrice] = useState(() => localStorage.getItem('laptopFinder_minPrice') || "");
  const [maxPrice, setMaxPrice] = useState(() => localStorage.getItem('laptopFinder_maxPrice') || "");
  const [preferredBrand, setPreferredBrand] = useState(() => localStorage.getItem('laptopFinder_preferredBrand') || "");
  const [minRam, setMinRam] = useState(() => localStorage.getItem('laptopFinder_minRam') || "");
  const [minStorage, setMinStorage] = useState(() => localStorage.getItem('laptopFinder_minStorage') || "");
  const [screenSize, setScreenSize] = useState(() => localStorage.getItem('laptopFinder_screenSize') || "");
  const [sortOption, setSortOption] = useState(() => localStorage.getItem('laptopFinder_sortOption') || "default");
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Laptop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterMessages, setFilterMessages] = useState<string[]>([]);

  // Create custom state setters that also update localStorage
  const updatePrimaryUse = (value: string) => {
    setPrimaryUse(value);
    localStorage.setItem('laptopFinder_primaryUse', value);
  };

  const updateMinPrice = (value: string) => {
    setMinPrice(value);
    localStorage.setItem('laptopFinder_minPrice', value);
  };

  const updateMaxPrice = (value: string) => {
    setMaxPrice(value);
    localStorage.setItem('laptopFinder_maxPrice', value);
  };

  const updatePreferredBrand = (value: string) => {
    setPreferredBrand(value);
    localStorage.setItem('laptopFinder_preferredBrand', value);
  };

  const updateMinRam = (value: string) => {
    setMinRam(value);
    localStorage.setItem('laptopFinder_minRam', value);
  };

  const updateMinStorage = (value: string) => {
    setMinStorage(value);
    localStorage.setItem('laptopFinder_minStorage', value);
  };

  const updateScreenSize = (value: string) => {
    setScreenSize(value);
    localStorage.setItem('laptopFinder_screenSize', value);
  };

  const updateSortOption = (value: string) => {
    setSortOption(value);
    localStorage.setItem('laptopFinder_sortOption', value);
  };
  
  // Add a function to clear all filters
  const clearAllFilters = () => {
    updatePrimaryUse("");
    updateMinPrice("");
    updateMaxPrice("");
    updatePreferredBrand("");
    updateMinRam("");
    updateMinStorage("");
    updateScreenSize("");
    updateSortOption("default");
    setResults([]);
    setFilterMessages([]);
  };
  //for prevent mouse wheel
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if the active element is an input with type number
      if (
        document.activeElement &&
        document.activeElement.tagName === 'INPUT' &&
        (document.activeElement as HTMLInputElement).type === 'number'
      ) {
        // Prevent the default behavior (changing the input value)
        e.preventDefault();
      }
    };

    // Add the event listener to the window
    window.addEventListener('wheel', handleWheel, { passive: false });

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Example values for dropdowns
  const priceRanges = [
    { label: "20,000", value: 20000 },
    { label: "40,000", value: 40000 },
    { label: "60,000", value: 60000 },
    { label: "80,000", value: 80000 },
    { label: "100,000", value: 100000 },
    { label: "150,000", value: 150000 },
    { label: "200,000", value: 200000 }
  ];

  const ramOptions = [
    { label: "4 GB", value: 4 },
    { label: "8 GB", value: 8 },
    { label: "16 GB", value: 16 },
    { label: "32 GB", value: 32 },
    { label: "64 GB", value: 64 }
  ];

  const storageOptions = [
    { label: "256 GB", value: 256 },
    { label: "512 GB", value: 512 },
    { label: "1 TB", value: 1024 },
    { label: "2 TB", value: 2048 },
    { label: "4 TB", value: 4096 }
  ];

  const screenSizeOptions = [
    { label: "13.3\"", value: 13.3 },
    { label: "14\"", value: 14 },
    { label: "15.6\"", value: 15.6 },
    { label: "16\"", value: 16 },
    { label: "17.3\"", value: 17.3 }
  ];

  const brandOptions = [
    { label: "Dell", value: "Dell" },
    { label: "HP", value: "HP" },
    { label: "Lenovo", value: "Lenovo" },
    { label: "ASUS", value: "ASUS" },
    { label: "Acer", value: "Acer" },
    { label: "Microsoft", value: "Microsoft" },
    { label: "MSI", value: "MSI" },
    { label: "Razer", value: "Razer" }
  ];
  // Add sorting options
  const sortOptions = [
    { label: "Default", value: "default" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFilterMessages([]);
    
    try {
      const query = primaryUse;
      const filters: Record<string, any> = {};
      
      if (minPrice && !isNaN(Number(minPrice))) {
        filters.price_min = Number(minPrice);
      }
      
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filters.price_max = Number(maxPrice);
      }
      
      if (preferredBrand) {
        filters.brand = preferredBrand;
      }
      
      if (minRam && !isNaN(Number(minRam))) {
        filters.ram_min = Number(minRam);
      }
      
      if (minStorage && !isNaN(Number(minStorage))) {
        filters.storage_min = Number(minStorage);
      }
      
      if (screenSize && !isNaN(Number(screenSize))) {
        filters.screen_size = Number(screenSize);
      }
      
      // Add sort option to the request
      if (sortOption !== "default") {
        filters.sort = sortOption;
      }
      
      const response = await fetch(`${API_BASE_URL}/laptop-finder/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, filters }),
      });
      
      if (!response.ok) {
        // If we get a 500 error, it might be due to filter criteria that can't be met
        if (response.status === 500) {
          setFilterMessages([
            `No laptops found matching your criteria. Please try relaxing some filters.`
          ]);
          setResults([]);
          return;
        }
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // If no results were found
      if (data.results && data.results.length === 0) {
        setFilterMessages([
          `No laptops found matching your criteria. Please try relaxing some filters.`
        ]);
        setResults([]);
        return;
      }
      
      setResults(data.results.map((laptop: any) => ({
        id: laptop.ID || laptop.id,
        name: laptop.Model || laptop.name,
        brand: laptop.Brand || laptop.brand,
        processor: laptop.Processor || laptop.processor,
        ram: `${laptop.RAM_GB}GB` || laptop.ram,
        storage: `${laptop.Storage_GB}GB ${laptop.Storage_Type}` || laptop.storage,
        display: `${laptop.Screen_Size}" ${laptop.Resolution || ''}` || laptop.display,
        graphics: laptop.GPU || laptop.graphics,
        price: typeof laptop.price === 'number' ? laptop.price : parseFloat(laptop.price) || 0,
        imageUrl: laptop.image_url || laptop.imageUrl,
        similarity: typeof laptop.similarity === 'number' ? laptop.similarity : 0,
        specialized_score: typeof laptop.specialized_score === 'number' ? laptop.specialized_score : undefined,
        specialized_comments: laptop.specialized_comments,
        description: laptop.Description || laptop.description,
        performanceLevel: laptop.Performance_Level || laptop.performanceLevel
      })));
      
      // Set filter messages if they exist
      if (data.filter_messages && Array.isArray(data.filter_messages)) {
        // Filter for specific messages we want to show - only those about filters that couldn't be applied
        const relevantMessages = data.filter_messages.filter((msg: string) => 
          msg.includes("No laptops found")
        );
        setFilterMessages(relevantMessages.length > 0 ? relevantMessages : []);
      }
      
    } catch (err) {
      console.error("Error fetching laptop recommendations:", err);
      setError("Failed to get laptop recommendations. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this function after the handleSubmit function
  const handleSort = async (sortValue: string) => {
    setIsLoading(true);
    
    try {
      const query = primaryUse;
      const filters: Record<string, any> = {};
      
      if (minPrice && !isNaN(Number(minPrice))) {
        filters.price_min = Number(minPrice);
      }
      
      if (maxPrice && !isNaN(Number(maxPrice))) {
        filters.price_max = Number(maxPrice);
      }
      
      if (preferredBrand) {
        filters.brand = preferredBrand;
      }
      
      if (minRam && !isNaN(Number(minRam))) {
        filters.ram_min = Number(minRam);
      }
      
      if (minStorage && !isNaN(Number(minStorage))) {
        filters.storage_min = Number(minStorage);
      }
      
      if (screenSize && !isNaN(Number(screenSize))) {
        filters.screen_size = Number(screenSize);
      }
      
      // Explicitly set the sort option
      filters.sort = sortValue;
      
      const response = await fetch(`${API_BASE_URL}/laptop-finder/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, filters }),
      });
      
      if (!response.ok) {
        if (response.status === 500) {
          setFilterMessages([
            `No laptops found matching your criteria. Please try relaxing some filters.`
          ]);
          setResults([]);
          return;
        }
        throw new Error(`Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length === 0) {
        setFilterMessages([
          `No laptops found matching your criteria. Please try relaxing some filters.`
        ]);
        setResults([]);
        return;
      }
      
      setResults(data.results.map((laptop: any) => ({
        id: laptop.ID || laptop.id,
        name: laptop.Model || laptop.name,
        brand: laptop.Brand || laptop.brand,
        processor: laptop.Processor || laptop.processor,
        ram: `${laptop.RAM_GB}GB` || laptop.ram,
        storage: `${laptop.Storage_GB}GB ${laptop.Storage_Type}` || laptop.storage,
        display: `${laptop.Screen_Size}" ${laptop.Resolution || ''}` || laptop.display,
        graphics: laptop.GPU || laptop.graphics,
        price: typeof laptop.price === 'number' ? laptop.price : parseFloat(laptop.price) || 0,
        imageUrl: laptop.image_url || laptop.imageUrl,
        similarity: typeof laptop.similarity === 'number' ? laptop.similarity : 0,
        specialized_score: typeof laptop.specialized_score === 'number' ? laptop.specialized_score : undefined,
        specialized_comments: laptop.specialized_comments,
        description: laptop.Description || laptop.description,
        performanceLevel: laptop.Performance_Level || laptop.performanceLevel
      })));
      
      if (data.filter_messages && Array.isArray(data.filter_messages)) {
        const relevantMessages = data.filter_messages.filter((msg: string) => 
          msg.includes("No laptops found")
        );
        setFilterMessages(relevantMessages.length > 0 ? relevantMessages : []);
      }
      
    } catch (err) {
      console.error("Error fetching laptop recommendations:", err);
      setError("Failed to get laptop recommendations. Please try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };


    return (
      <div className="bg-white min-h-screen">
        <Header />
        
        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900">Find Your Perfect Laptop</h1>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={clearAllFilters}
                >
                  Clear Search
                </Button>
              </div>
              
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <Label htmlFor="primaryUse" className="text-base font-medium text-gray-900 block mb-3">
                      What is the primary use of the laptop you want?
                    </Label>
                    <div className="flex">
                      <Input
                        id="primaryUse"
                        placeholder="i want laptop for multimedia"
                        value={primaryUse}
                        onChange={(e) => updatePrimaryUse(e.target.value)}
                        required
                        className="rounded-md border-gray-300 flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label htmlFor="minPrice" className="text-base font-medium text-gray-900 block mb-3">
                        Minimum price
                      </Label>
                      <div className="flex">
                        <Input
                          id="minPrice"
                          type="number"
                          placeholder="Enter minimum price"
                          value={minPrice}
                          onChange={(e) => updateMinPrice(e.target.value)}
                          className="rounded-r-none border-r-0 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Select
                          onValueChange={(value) => updateMinPrice(value)}
                        >
                          <SelectTrigger className="w-[80px] rounded-l-none border-l-0 bg-gray-50">
                            <SelectValue placeholder="Ex" />
                          </SelectTrigger>
                          <SelectContent>
                            {priceRanges.map(option => (
                              <SelectItem key={`min-price-${option.value}`} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="maxPrice" className="text-base font-medium text-gray-900 block mb-3">
                        Maximum price
                      </Label>
                      <div className="flex">
                        <Input
                          id="maxPrice"
                          type="number"
                          placeholder="Enter maximum price"
                          value={maxPrice}
                          onChange={(e) => updateMaxPrice(e.target.value)}
                          className="rounded-r-none border-r-0 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Select
                          onValueChange={(value) => updateMaxPrice(value)}
                        >
                          <SelectTrigger className="w-[80px] rounded-l-none border-l-0 bg-gray-50">
                            <SelectValue placeholder="Ex" />
                          </SelectTrigger>
                          <SelectContent>
                            {priceRanges.map(option => (
                              <SelectItem key={`max-price-${option.value}`} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="preferredBrand" className="text-base font-medium text-gray-900 block mb-3">
                        Preferred brand
                      </Label>
                      <div className="flex">
                        <Input
                          id="preferredBrand"
                          placeholder="e.g., Dell, HP, Lenovo"
                          value={preferredBrand}
                          onChange={(e) => updatePreferredBrand(e.target.value)}
                          className="rounded-r-none border-r-0 flex-1"
                        />
                        <Select
                          onValueChange={(value) => updatePreferredBrand(value)}
                        >
                          <SelectTrigger className="w-[80px] rounded-l-none border-l-0 bg-gray-50">
                            <SelectValue placeholder="Ex" />
                          </SelectTrigger>
                          <SelectContent>
                            {brandOptions.map(option => (
                              <SelectItem key={`brand-${option.value}`} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="minRam" className="text-base font-medium text-gray-900 block mb-3">
                        Minimum RAM in GB
                      </Label>
                      <div className="flex">
                        <Input
                          id="minRam"
                          type="number"
                          placeholder="e.g., 8, 16, 32"
                          value={minRam}
                          onChange={(e) => updateMinRam(e.target.value)}
                          className="rounded-r-none border-r-0 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Select
                          onValueChange={(value) => updateMinRam(value)}
                        >
                          <SelectTrigger className="w-[80px] rounded-l-none border-l-0 bg-gray-50">
                            <SelectValue placeholder="Ex" />
                          </SelectTrigger>
                          <SelectContent>
                            {ramOptions.map(option => (
                              <SelectItem key={`ram-${option.value}`} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="minStorage" className="text-base font-medium text-gray-900 block mb-3">
                        Minimum storage in GB
                      </Label>
                      <div className="flex">
                        <Input
                          id="minStorage"
                          type="number"
                          placeholder="e.g., 256, 512, 1000"
                          value={minStorage}
                          onChange={(e) => updateMinStorage(e.target.value)}
                          className="rounded-r-none border-r-0 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Select
                          onValueChange={(value) => updateMinStorage(value)}
                        >
                          <SelectTrigger className="w-[80px] rounded-l-none border-l-0 bg-gray-50">
                            <SelectValue placeholder="Ex" />
                          </SelectTrigger>
                          <SelectContent>
                            {storageOptions.map(option => (
                              <SelectItem key={`storage-${option.value}`} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="screenSize" className="text-base font-medium text-gray-900 block mb-3">
                        Preferred screen size in inches
                      </Label>
                      <div className="flex">
                        <Input
                          id="screenSize"
                          type="number"
                          step="0.1"
                          placeholder="e.g., 15.6"
                          value={screenSize}
                          onChange={(e) => updateScreenSize(e.target.value)}
                          className="rounded-r-none border-r-0 flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Select
                          onValueChange={(value) => updateScreenSize(value)}
                        >
                          <SelectTrigger className="w-[80px] rounded-l-none border-l-0 bg-gray-50">
                            <SelectValue placeholder="Ex" />
                          </SelectTrigger>
                          <SelectContent>
                            {screenSizeOptions.map(option => (
                              <SelectItem key={`screen-${option.value}`} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-[#04364A] hover:bg-[#032a38] text-white py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Finding laptops..." : "Find Laptops"}
                  </Button>
                </form>
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-700 p-4 border-t border-gray-200">
                  {error}
                </div>
              )}
              
              {filterMessages.length > 0 && (
                <div className="bg-blue-50 text-blue-800 p-4 border-t border-gray-200">
                  <h3 className="font-medium mb-2">Search Information:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {filterMessages.map((message, index) => (
                      <li key={index}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {results.length > 0 && (
                <div className="border-t border-gray-200">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">Recommended Laptops</h2>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Sort by:</span>
                        <Select
                          value={sortOption}
                          onValueChange={(value) => {
                            updateSortOption(value);
                            handleSort(value);
                          }}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                          </SelectTrigger>
                          <SelectContent>
                            {sortOptions.map(option => (
                              <SelectItem key={`sort-${option.value}`} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {results.map((laptop) => (
                        <div key={laptop.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                            {laptop.imageUrl ? (
                              <img 
                                src={laptop.imageUrl} 
                                alt={laptop.description} 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="text-gray-400">No image available</div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{laptop.description}</h3>
                            
                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                              <p><span className="font-medium">ID:</span> {laptop.id}</p>
                              <p><span className="font-medium">Brand:</span> {laptop.brand}</p>
                              <p><span className="font-medium">Graphics:</span> {laptop.graphics}</p>
                              <p><span className="font-medium">RAM:</span> {laptop.ram}</p>
                              <p><span className="font-medium">Storage:</span> {laptop.storage}</p>
                              <p><span className="font-medium">Display:</span> {laptop.display}</p>
                              <p><span className="font-medium">Performance:</span> {laptop.performanceLevel || 'N/A'}</p>
                              {laptop.price && (
                                <p className="text-base font-bold text-[#04364A]">{laptop.price.toLocaleString()}</p>
                              )}
                            </div>
                            <Button 
                              className="mt-3 w-full bg-[#176B87] hover:bg-[#125a72] text-white"
                              onClick={() => window.open(`/product/${laptop.id}`, '_blank')}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
        
        <Footer />
      </div>
    );
  };