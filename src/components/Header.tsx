import react, { useNavigate, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { JSX } from "react/jsx-runtime";
import React from "react";

// ]]import React, { useState, useEffect } from "react";

interface HeaderProps {
  showSearch?: boolean;
  showProfile?: boolean;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const Header = ({ 
  showSearch = true, 
  showProfile = true,
  onSearch,
  searchQuery = ""
}: HeaderProps): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authMethod'); // Also remove auth method
    
    // Force refresh before navigation to update all components
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="LapMatch" 
              className="h-8 sm:h-10 mr-2 sm:mr-3"
            />
            <span className="text-lg sm:text-xl font-bold text-[#04364A]">LapMatch</span>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a 
              href="#" 
              className={`${isHomePage ? 'text-white' : 'text-gray-700'} hover:text-gray-900 font-medium `}
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
            >
              HOME
            </a>
            <a 
              href="#" 
              className={`${isHomePage ? 'text-white' : 'text-gray-700'} hover:text-gray-900 font-medium `}
              onClick={(e) => {
                e.preventDefault();
                navigate('/about');
              }}
            >
              ABOUT US
            </a>
            <a 
              href="#" 
              className={`${isHomePage ? 'text-white' : 'text-gray-700'} hover:text-gray-900 font-medium `}
              onClick={(e) => {
                e.preventDefault();
                navigate('/contact');
              }}
            >
              CONTACT US
            </a>
            {isLoggedIn && (
              <a 
                href="#" 
                className={`${isHomePage ? 'text-white' : 'text-gray-700'} hover:text-gray-900 font-medium flex items-center`}
                onClick={(e) => {e.preventDefault();navigate('/favorites');}}
                // onClick={() => window.location.href = 'http://localhost:5173/favorites'}
              >
                <Heart className="w-4 h-4 mr-1" />  
                FAVORITES
              </a>
            )}
            {isLoggedIn ? (
              <>
                <a 
                  href="#" 
                  className={`${isHomePage ? 'text-white' : 'text-gray-700'} hover:text-gray-900 font-medium `}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                >
                  LOGOUT
                </a>
              </>
            ) : (
              <a 
                href="#" 
                className={`${isHomePage ? 'text-white' : 'text-gray-700'} hover:text-gray-900 font-medium `}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                LOGIN
              </a>
            )}
            {/* Add Favorites link for logged in users */}

          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2 pt-4">
              {/* Mobile navigation items */}
              <a href="/" className="text-gray-700 hover:text-gray-900 py-2">HOME</a>
              <a href="/products" className="text-gray-700 hover:text-gray-900 py-2">PRODUCTS</a>
              <a href="/about" className="text-gray-700 hover:text-gray-900 py-2">ABOUT</a>
              <a href="/contact" className="text-gray-700 hover:text-gray-900 py-2">CONTACT US</a>
              {/* Add other navigation items */}
            </div>
          </nav>
        )}

        {showSearch && (
          <div className="relative">
            <input
              type="search"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && onSearch) {
                  onSearch(searchQuery);
                }
              }}
              className="pl-10 pr-4 py-2 w-[300px] rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <img
              src="/group-98.png"
              alt="Search"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
            />
          </div>
        )}
          
          {showProfile && isLoggedIn && (
            <div className="flex items-center gap-4">
              <img
                src="/user.png"
                alt="Profile"
                className={`w-10 h-10 rounded-full cursor-pointer ${
                  isHomePage ? 'filter invert brightness-0 contrast-100' : ''
                }`}
                // onClick={() => window.location.href = 'http://localhost:5173/profile'}
                onClick={() => navigate('/profile')}
              />
            </div>
          )}

        {/*use this if the profile error happen again*/ }
      {/* {showProfile && isLoggedIn && (
          <div className="flex items-center gap-4">
            <img
              src="/user.png"
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => window.location.href = 'http://localhost:5173/profile'}
            />
          </div>
        )
      } */}


        {/*old version of handle error of profile page */}
        
        {/* {isLoggedIn ? (
        <div className="flex items-center gap-4">
          <img
            src="/user.png"
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => window.location.href = 'http://localhost:5173/profile'}
          />
        </div>
        ) : null} */}
      </div>
    </header>
  );
};