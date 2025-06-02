import React, { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { API_BASE_URL } from "../../config/api";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";

export const SignupPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all fields");
        return;
    }
    
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    
    if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
    }

    try {
        setIsLoading(true);
        const response = await fetch('http://localhost:8000/server/api/auth/signup/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: formData.username,
                email: formData.email,
                password: formData.password,
                backend: 'django.contrib.auth.backends.ModelBackend'
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }
        
        localStorage.setItem('authMethod', 'regular');
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isLoggedIn', 'true');
        
        // Force refresh before navigation to update all components
        window.location.href = '/';
        
    } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
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
      
      <section className="py-8 md:py-16">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          {/* Desktop view */}
          <div className="hidden md:flex items-center">
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
              <h1 className="text-3xl font-bold mb-8">Create an account</h1>
              <p className="text-gray-600 mb-8">Enter your details below</p>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Choose a username"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Create a password"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Confirm your password"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    className="h-4 w-4 text-[#04364A] focus:ring-[#04364A] border-gray-300 rounded"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-[#04364A] hover:text-[#032a38]">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#04364A] hover:text-[#032a38]">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-[#04364A] hover:bg-[#032a38] text-white py-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
                
                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <a 
                      href="#" 
                      className="font-medium text-[#04364A] hover:text-[#032a38]"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                      }}
                    >
                      Log in
                    </a>
                  </p>
                </div>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 py-2"
                    onClick={handleGoogleLogin}
                  >
                    <img src="/Icon-Google.png" alt="Google" className="w-5 h-5" />
                    Google
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Mobile view */}
          <div className="md:hidden">
            <div className="mb-6 bg-black rounded-2xl overflow-hidden shadow-lg mx-auto max-w-xs">
              <img 
                src="/laptop-login.png" 
                alt="Laptop" 
                className="w-full h-auto object-cover"
              />
            </div>
            
            <div className="px-4">
              <h1 className="text-2xl font-bold mb-4">Create account</h1>
              <p className="text-gray-600 mb-6">Enter your details below</p>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <Input
                    id="username-mobile"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    placeholder="Choose a username"
                  />
                </div>
                
                <div>
                  <label htmlFor="email-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    id="email-mobile"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label htmlFor="password-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    id="password-mobile"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    placeholder="Create a password"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <Input
                    id="confirmPassword-mobile"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                    placeholder="Confirm your password"
                  />
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms-mobile"
                      name="terms"
                      type="checkbox"
                      className="h-4 w-4 text-[#04364A] focus:ring-[#04364A] border-gray-300 rounded"
                    />
                  </div>
                  <label htmlFor="terms-mobile" className="ml-2 block text-xs text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-[#04364A] hover:text-[#032a38]">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#04364A] hover:text-[#032a38]">
                      Privacy Policy
                    </a>
                  </label>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-[#04364A] hover:bg-[#032a38] text-white py-2 text-sm mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
                
                <div className="text-center mt-3">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <a 
                      href="#" 
                      className="font-medium text-[#04364A] hover:text-[#032a38]"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/login');
                      }}
                    >
                      Log in
                    </a>
                  </p>
                </div>
                
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or sign up with</span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700 py-2 text-sm"
                  onClick={handleGoogleLogin}
                >
                  <img src="/Icon-Google.png" alt="Google" className="w-4 h-4" />
                  Google
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};