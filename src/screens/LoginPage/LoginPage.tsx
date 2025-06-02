import React, { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { API_BASE_URL } from "../../config/api";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export const LoginPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8000/server/api/auth/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email,
                password: password 
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        localStorage.setItem('authMethod', 'regular');
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Force refresh before navigation to update all components
        window.location.href = '/';
        
    } catch (err) {
        setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google/`;
};

  return (
    <div className="bg-white min-h-screen">
      <Header showSearch={false} showProfile={true} />
      
      <section className="py-16">
        <div className="max-w-[1440px] mx-auto px-6 flex items-center">
          <div className="w-1/2">
            <div className="bg-black rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="/laptop-login.png" 
                alt="Laptop" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          <div className="w-1/2 pl-16">
            <h1 className="text-3xl font-bold mb-8">Log in</h1>
            <p className="text-gray-600 mb-8">Enter your details below</p>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email or Phone Number
                </label>
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter your email or phone number"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter your password"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#04364A] focus:ring-[#04364A] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-[#04364A] hover:text-[#032a38]">
                    Forgot Password?
                  </a>
                </div>
              </div>
              
              <Button 
                type="submit"
                className="w-full bg-[#04364A] hover:bg-[#032a38] text-white py-2"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a 
                    href="#" 
                    className="font-medium text-[#04364A] hover:text-[#032a38]"
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/signup');
                    }}
                  >
                    Sign up
                  </a>
                </p>
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or log in with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 py-2"
                  // onClick={() => {
                  //   // Handle Google login
                  //   console.log("Google login");
                  // }}
                  onClick={handleGoogleLogin}
                >
                  <img src="/Icon-Google.png" alt="Google" className="w-5 h-5" />
                  Google
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};