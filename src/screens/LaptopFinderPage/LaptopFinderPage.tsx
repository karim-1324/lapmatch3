import { useState, useEffect, JSX } from "react";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
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

const questions = [
  {
    key: "primaryUse",
    label: "What is the primary use of the laptop you want?",
    required: true,
    placeholder: "e.g., I want a laptop for multimedia",
    type: "text",
  },
  {
    key: "minPrice",
    label: "What is your minimum price? (optional)",
    required: false,
    placeholder: "e.g., 20000",
    type: "number",
  },
  {
    key: "maxPrice",
    label: "What is your maximum price? (optional)",
    required: false,
    placeholder: "e.g., 80000",
    type: "number",
  },
  {
    key: "preferredBrand",
    label: "Do you have a preferred brand? (optional)",
    required: false,
    placeholder: "e.g., Dell, HP, Lenovo",
    type: "select",
    options: [
      { label: "Dell", value: "Dell" },
      { label: "HP", value: "HP" },
      { label: "Lenovo", value: "Lenovo" },
      { label: "ASUS", value: "ASUS" },
      { label: "Acer", value: "Acer" },
      { label: "Microsoft", value: "Microsoft" },
      { label: "MSI", value: "MSI" },
      { label: "Razer", value: "Razer" }
    ]
  },
  {
    key: "minRam",
    label: "Minimum RAM in GB? (optional)",
    required: false,
    placeholder: "e.g., 8",
    type: "select",
    options: [
      { label: "4 GB", value: "4" },
      { label: "8 GB", value: "8" },
      { label: "16 GB", value: "16" },
      { label: "32 GB", value: "32" },
      { label: "64 GB", value: "64" }
    ]
  },
  {
    key: "minStorage",
    label: "Minimum storage in GB? (optional)",
    required: false,
    placeholder: "e.g., 256",
    type: "select",
    options: [
      { label: "256 GB", value: "256" },
      { label: "512 GB", value: "512" },
      { label: "1 TB", value: "1024" },
      { label: "2 TB", value: "2048" },
      { label: "4 TB", value: "4096" }
    ]
  },
  {
    key: "screenSize",
    label: "Preferred screen size in inches? (optional)",
    required: false,
    placeholder: "e.g., 15.6",
    type: "select",
    options: [
      { label: "13.3\"", value: "13.3" },
      { label: "14\"", value: "14" },
      { label: "15.6\"", value: "15.6" },
      { label: "16\"", value: "16" },
      { label: "17.3\"", value: "17.3" }
    ]
  }
];

const sortOptions = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" }
];

export const LaptopFinderPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [chat, setChat] = useState<{ sender: "bot" | "user", text: string }[]>([
    { sender: "bot", text: questions[0].label }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Laptop[]>([]);
  const [filterMessages, setFilterMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState(() => localStorage.getItem('laptopFinder_sortOption') || "default");

    const sortOptions = [
    { label: "Default", value: "default" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" }
  ];
  // Handle user reply to each question
  const handleUserReply = async () => {
    const q = questions[currentStep];
    if (q.required && !inputValue.trim()) {
      // Show error or shake input
      return;
    }
    // Save answer
    setAnswers(prev => ({ ...prev, [q.key]: inputValue.trim() }));
    setChat(prev => [...prev, { sender: "user", text: inputValue.trim() || "(skipped)" }]);
    setInputValue("");
    // Next question or fetch results
    if (currentStep < questions.length - 1) {
      setTimeout(() => {
        setChat(prev => [...prev, { sender: "bot", text: questions[currentStep + 1].label }]);
        setCurrentStep(currentStep + 1);
      }, 400);
    } else {
      // All questions answered, fetch results
      setIsLoading(true);
      setChat(prev => [...prev, { sender: "bot", text: "Searching for laptops that match your preferences..." }]);
      await fetchLaptops();
    }
  };

  // Fetch laptops (reuse your logic)
  const fetchLaptops = async () => {
    setError(null);
    setFilterMessages([]);
    const filters: Record<string, any> = {};
    if (answers.minPrice) filters.price_min = Number(answers.minPrice);
    if (answers.maxPrice) filters.price_max = Number(answers.maxPrice);
    if (answers.preferredBrand) filters.brand = answers.preferredBrand;
    if (answers.minRam) filters.ram_min = Number(answers.minRam);
    if (answers.minStorage) filters.storage_min = Number(answers.minStorage);
    if (answers.screenSize) filters.screen_size = Number(answers.screenSize);

    try {
      const response = await fetch(`${API_BASE_URL}/laptop-finder/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: answers.primaryUse, filters }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
      if (data.results && data.results.length === 0) {
        setChat(prev => [...prev, { sender: "bot", text: "No laptops found matching your criteria. Please try relaxing some filters." }]);
        setResults([]);
        setIsLoading(false);
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
      // Show filter messages if any
      if (data.filter_messages && Array.isArray(data.filter_messages)) {
        const relevantMessages = data.filter_messages.filter((msg: string) =>
          msg.includes("No laptops found")
        );
        if (relevantMessages.length > 0) {
          setFilterMessages(relevantMessages);
          setChat(prev => [...prev, ...relevantMessages.map((msg: any) => ({ sender: "bot", text: msg }))]);
        }
      }
      setIsLoading(false);
    } catch (err) {
      setError("Failed to get laptop recommendations. Please try again.");
      setIsLoading(false);
    }
  };

  // Add a clear function
  const clearChatbot = () => {
    setCurrentStep(0);
    setAnswers({});
    setChat([{ sender: "bot", text: questions[0].label }]);
    setInputValue("");
    setResults([]);
    setFilterMessages([]);
    setError(null);
    setIsLoading(false);
    setSortOption("default");
  };

  // Add sort handler
  const handleSort = async (sortValue: string) => {
    setSortOption(sortValue);
    setIsLoading(true);
    // Re-fetch laptops with the new sort option
    const filters: Record<string, any> = {};
    if (answers.minPrice) filters.price_min = Number(answers.minPrice);
    if (answers.maxPrice) filters.price_max = Number(answers.maxPrice);
    if (answers.preferredBrand) filters.brand = answers.preferredBrand;
    if (answers.minRam) filters.ram_min = Number(answers.minRam);
    if (answers.minStorage) filters.storage_min = Number(answers.minStorage);
    if (answers.screenSize) filters.screen_size = Number(answers.screenSize);
    if (sortValue !== "default") filters.sort = sortValue;

    try {
      const response = await fetch(`${API_BASE_URL}/laptop-finder/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: answers.primaryUse, filters }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
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
      setIsLoading(false);
    } catch (err) {
      setError("Failed to get laptop recommendations. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header />
      <section className="flex-1 flex flex-col items-center justify-center py-8">
        <div
          className={`w-full max-w-4xl mx-auto bg-gray-50 rounded-lg shadow-md p-6 flex flex-col ${
            results.length > 0 ? "h-[90vh]" : "h-[70vh]"
          }`}
        >
          {/* Clear Button */}
          <div className="flex justify-between items-center mb-4">
            <Button variant="outline" onClick={clearChatbot}>
              Clear Search
            </Button>
            {/* Show sort dropdown only when results are present */}
            {results.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select
                  value={sortOption}
                  onValueChange={(value) => handleSort(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto mb-4">
            {chat.map((msg, idx) => (
              <div key={idx} className={`flex mb-2 ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}>
                {msg.sender === "bot" && (
                  <img src="/chatbot-icon.png" alt="Bot" className="w-8 h-8 mr-2 self-end" />
                )}
                <div className={`rounded-lg px-4 py-2 ${msg.sender === "bot" ? "bg-blue-100 text-gray-900" : "bg-green-100 text-gray-900"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-2">
                <img src="/chatbot-icon.png" alt="Bot" className="w-8 h-8 mr-2 self-end" />
                <div className="rounded-lg px-4 py-2 bg-blue-100 text-gray-900">Searching...</div>
              </div>
            )}
            {results.length > 0 && (
              <>
                <div className="flex justify-start mb-4">
                  <img src="/chatbot-icon.png" alt="Bot" className="w-8 h-8 mr-2 self-end" />
                  <div className="rounded-lg px-4 py-2 bg-blue-100 text-gray-900">
                    Here are some laptops that match your preferences:
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.map(laptop => (
                    <div key={laptop.id} className="border rounded-lg overflow-hidden shadow bg-white flex flex-col">
                      <div className="flex items-center justify-center bg-gray-100" style={{ height: "180px" }}>
                        <img
                          src={laptop.imageUrl}
                          alt={laptop.description}
                          className="w-48 h-32 object-contain"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="font-semibold mb-1">{laptop.description}</div>
                        <div className="text-sm text-gray-600 mb-2">{laptop.brand} | {laptop.ram} | {laptop.storage} | {laptop.display}</div>
                        <div className="text-[#04364A] font-bold mb-2">{laptop.price.toLocaleString()}</div>
                        <Button
                          className="mt-auto bg-[#176B87] hover:bg-[#125a72] text-white"
                          onClick={() => window.open(`/product/${laptop.id}`, '_blank')}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {error && (
              <div className="flex justify-start mt-2">
                <img src="/chatbot-icon.png" alt="Bot" className="w-8 h-8 mr-2 self-end" />
                <div className="rounded-lg px-4 py-2 bg-red-100 text-red-700">{error}</div>
              </div>
            )}
          </div>
          {/* Input area for current question */}
          {results.length === 0 && !isLoading && (
            <div className="flex gap-2">
              {questions[currentStep].type === "select" ? (
                <Select
                  value={inputValue}
                  onValueChange={setInputValue}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={questions[currentStep].placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {questions[currentStep].options!.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={questions[currentStep].type}
                  placeholder={questions[currentStep].placeholder}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  className="flex-1"
                  onKeyDown={e => { if (e.key === "Enter") handleUserReply(); }}
                />
              )}
              <Button onClick={handleUserReply} disabled={questions[currentStep].required && !inputValue.trim()}>
                Send
              </Button>
              {!questions[currentStep].required && (
                <Button variant="outline" onClick={handleUserReply}>Skip</Button>
              )}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};
