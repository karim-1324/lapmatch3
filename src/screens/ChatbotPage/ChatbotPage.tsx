// @ts-ignore
import React, { useState, useRef, useEffect, JSX } from "react";
import { Header } from "../../components/Header";
//import { Footer } from '../../components/Footer';
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Send } from "lucide-react";
import { API_BASE_URL } from "../../config/api";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  sender: "user" | "bot";
  text?: string;
  laptops?: Product[];
  specs?: any;
  error?: string;
}

interface Product {
  id: string;
  name: string;
  price: string | number | null;
  imageUrl?: string;
  inStock?: boolean;
}

const initialBotMessage: ChatMessage = {
  sender: "bot",
  text: "Hello! How can I help you find the laptop today? Describe what is in your mind.",
};

export const ChatbotPage = (): JSX.Element => {
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedMessages = sessionStorage.getItem("chatMessages");
    try {
      return savedMessages ? JSON.parse(savedMessages) : [initialBotMessage];
    } catch (e) {
      console.error("Failed to parse chat messages from sessionStorage", e);
      return [initialBotMessage]; 
    }
  });

  // Add a function to clear chat history
  const clearChatHistory = () => {
    setMessages([initialBotMessage]);
    sessionStorage.removeItem("chatMessages");
    // Also clear any related localStorage items
    localStorage.removeItem('chatbotResults');
    localStorage.removeItem('chatbotQuery');
  };

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    sessionStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const userMessage = inputValue.trim();
    if (!userMessage) return;

    const newUserMessage: ChatMessage = { sender: "user", text: userMessage };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response from bot");
      }

      let botResponse: ChatMessage = { sender: "bot" };
      if (data.laptops && data.laptops.length > 0) {
        botResponse.text = data.message || `Okay, based on your request, I found these laptops for you:`;
        botResponse.laptops = data.laptops.map((laptop: any) => ({
          id: laptop.id,
          name: laptop.name,
          price: laptop.price,
          imageUrl: laptop.image_url,
          inStock: laptop.in_stock,
        }));
        botResponse.specs = data.extracted_specs;
      } else if (data.message) {
        // Handle the case where the backend returns a specific message
        botResponse.text = data.message;
        botResponse.specs = data.extracted_specs;
      } else if (data.extracted_specs) {
        // Improve message for specialized categories
        const categorySpecs = data.extracted_specs.category;
        const specializedCategories = ["multimedia", "engineering", "data science", "content creation", "logic circuit"];
        
        let hasSpecialCategory = false;
        if (categorySpecs) {
          const categories = Array.isArray(categorySpecs) ? categorySpecs : [categorySpecs];
          hasSpecialCategory = categories.some(cat => 
            specializedCategories.some(special => 
              String(cat).toLowerCase().includes(special.toLowerCase())
            )
          );
        }
        
        if (hasSpecialCategory) {
          botResponse.text = data.message || 
            `I understand you're looking for a specialized laptop. Let me suggest some specifications that would work well for your needs.`;
        } else {
          botResponse.text = `I understood you're looking for specific features, but couldn't find matching laptops with the current data. Try another feature?`;
        }
        botResponse.specs = data.extracted_specs;
      } else {
        botResponse.text =
          "Sorry, I couldn't find any laptops matching that description right now. Could you try describing it differently?";
      }

      setMessages((prev) => [...prev, botResponse]);
    } catch (error: any) {
      console.error("Chatbot error:", error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          error: `Sorry, something went wrong: ${error.message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (url: string | undefined) => {
    if (!url) return "/placeholder-laptop.png";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${url.startsWith("/") ? "" : "/"}${url}`;
  };

  useEffect(() => {

    const savedChatbotResults = localStorage.getItem('chatbotResults');
    const savedChatbotQuery = localStorage.getItem('chatbotQuery');
    
    if (savedChatbotResults && savedChatbotQuery) {
      try {
        const parsedResults = JSON.parse(savedChatbotResults);
        const queryExists = messages.some(
          msg => msg.sender === "user" && msg.text === savedChatbotQuery
        );
        
        if (!queryExists) {
          setMessages(prev => [
            ...prev,
            { sender: "user", text: savedChatbotQuery },
            { 
              sender: "bot", 
              text: "Here are some laptops that match your requirements:", 
              laptops: parsedResults 
            }
          ]);
        }
      } catch (error) {
        console.error("Error processing saved chatbot results:", error);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header showSearch={false} showProfile={true} />{" "}
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#04364A]">
            Describe the laptop you need
          </h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearChatHistory}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Clear Chat History
          </Button>
        </div>
        <div className="flex-grow bg-white border border-gray-200 rounded-lg shadow-sm p-4 overflow-y-auto mb-4 h-96">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg p-3 max-w-lg ${
                  msg.sender === "user"
                    ? "bg-[#04364A] text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text && <p className="text-sm">{msg.text}</p>}
                {msg.laptops && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.laptops.map((laptop) => (
                      <Card
                        key={laptop.id}
                        className="overflow-hidden text-gray-800 bg-white p-2 text-left"
                      >
                        <img
                          src={getImageUrl(laptop.imageUrl)}
                          alt={laptop.name}
                          className="w-full h-24 object-contain mb-1 cursor-pointer"
                          onClick={() => navigate(`/product/${laptop.id}`)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-laptop.png";
                          }}
                        />
                        <h4 className="font-semibold text-xs line-clamp-2 mb-1">
                          {laptop.name}
                        </h4>
                        <p className="text-xs font-bold mb-1">
                          {laptop.price
                            ? `${parseFloat(
                                laptop.price as string
                              ).toLocaleString()} EGP`
                            : "N/A"}
                        </p>
                        <p
                          className={`text-xs ${
                            laptop.inStock ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {laptop.inStock ? "In Stock" : "Out of Stock"}
                        </p>
                        <Button
                          size="sm"
                          variant="link"
                          className="text-xs p-0 h-auto text-[#04364A]"
                          onClick={() => navigate(`/product/${laptop.id}`)}
                        >
                          View Details
                        </Button>
                      </Card>
                    ))}
                  </div>
                )}
                {msg.specs && (
                  <details className="mt-2 text-xs opacity-70">
                    <summary>Detected Specs (Debug)</summary>
                    <pre className="text-xs whitespace-pre-wrap break-all">
                      {JSON.stringify(msg.specs, null, 2)}
                    </pre>
                  </details>
                )} 
                {msg.error && (
                  <p className="text-sm text-red-500">{msg.error}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="rounded-lg p-3 max-w-xs bg-gray-200 text-gray-800">
                <p className="text-sm italic">Bot is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Write What is in you mind"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && !isLoading && handleSendMessage()
            }
            disabled={isLoading}
            className="flex-grow"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-[#176B87] hover:bg-[#125a72]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};
