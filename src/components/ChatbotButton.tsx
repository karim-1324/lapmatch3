import { JSX, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ChatbotButton = (): JSX.Element => {
  const navigate = useNavigate();
  const chatbotAnimationStyle = `
  @keyframes chatbotWelcome {
    0% { transform: scale(1.5) translateY(100px); opacity: 0; }
    50% { transform: scale(1.2) translateY(-20px); opacity: 1; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
    
  @keyframes helloFade {
    0% { opacity: 1; transform: scale(1); }
    80% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.8); }
  }
  @keyframes chatbotFlyIn {
    0% { transform: translateX(200px) translateY(200px) scale(0.5); opacity: 0; }
    50% { transform: translateX(-20px) translateY(-20px) scale(1.1); opacity: 1; }
    100% { transform: translateX(0) translateY(0) scale(1); opacity: 1; }
  }
  @keyframes chatbotGlow {
    0%, 100% { box-shadow: 0 0 0 0 #43e0ff; }
    50% { box-shadow: 0 0 32px 8px #43e0ff; }
  }
  @keyframes chatbotAttention {
    0% { transform: translateY(0) scale(1) rotate(0deg); box-shadow: 0 0 0 0 #43e0ff; }
    10% { transform: translateY(-20px) scale(1.08) rotate(-8deg); box-shadow: 0 0 16px 8px #43e0ff; }
    20% { transform: translateY(0) scale(1) rotate(8deg); }
    30% { transform: translateY(-10px) scale(1.05) rotate(-6deg); }
    40% { transform: translateY(0) scale(1) rotate(6deg); }
    50% { transform: translateY(-5px) scale(1.03) rotate(-4deg); }
    60% { transform: translateY(0) scale(1) rotate(4deg); }
    70% { transform: translateY(-3px) scale(1.01) rotate(-2deg); }
    80% { transform: translateY(0) scale(1) rotate(2deg); }
    90% { transform: translateY(-2px) scale(1.01) rotate(-1deg); }
    100% { transform: translateY(0) scale(1) rotate(0deg); box-shadow: 0 0 0 0 #43e0ff; }
  }
  
  @keyframes periodicVibration {
    0% { transform: translateY(0) scale(1) rotate(0deg); }
    10% { transform: translateY(-10px) scale(1.08) rotate(-5deg);  }
    20% { transform: translateY(0) scale(1) rotate(5deg); }
    30% { transform: translateY(-10px) scale(1.05) rotate(-2deg); }
    40% { transform: translateY(0) scale(1) rotate(6deg); }
    50% { transform: translateY(-5px) scale(1.03) rotate(-4deg); }
    60% { transform: translateY(0) scale(1) rotate(4deg); }
    70% { transform: translateY(-3px) scale(1.01) rotate(-2deg); }
    80% { transform: translateY(0) scale(1) rotate(2deg); }
    90% { transform: translateY(-2px) scale(1.01) rotate(-1deg); }
    100% { transform: translateY(0) scale(1) rotate(0deg); }
  }
  `;

  // --- Chatbot floating button state for animation ---
  const [animateChatbot, setAnimateChatbot] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateChatbot(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const animationTimer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000);
    return () => clearTimeout(animationTimer);
  }, []);
  
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = chatbotAnimationStyle;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const handleChatbotClick = () => {
    navigate("/laptop-finderr");
  };

  return (
    <button
      onClick={handleChatbotClick}
      className={`
        fixed z-50 bottom-8 right-8
        rounded-full shadow-lg
        flex items-center justify-center
        w-24 h-24
        bg-transparent
        border-none
        p-0
        transition-all duration-300
        hover:scale-110 hover:shadow-2xl
      `}
      aria-label="Open Chatbot"
      style={{
        boxShadow: "0 8px 24px rgba(23,107,135,0.25)",
        animation: animateChatbot
          ? "chatbotFlyIn 1.5s cubic-bezier(.68,-0.55,.27,1.55) 0s 1, chatbotAttention 2s ease-in-out 1.5s 1, chatbotGlow 2s ease-in-out 3.5s infinite alternate"
          : "periodicVibration 5s ease-in-out infinite, chatbotGlow 2s ease-in-out infinite alternate"
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative w-full h-full">
        {/* Bot Icon */}
        <img
          src="/ai 1.png"
          alt="Chatbot"
          className="w-full h-full object-contain transition-transform duration-300"
        />
        {/* Hello Icon positioned top-left */}
        <img
          src="/hello.png"
          alt="Hello"
          className={`absolute -top-6 -left-16 w-22 h-16 transition-all duration-800 ${
            (showWelcome || hovered) ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{
            animation: showWelcome ? "helloFade 4s ease-out forwards" : "none"
          }}
        />
      </div>
    </button>
  );
};