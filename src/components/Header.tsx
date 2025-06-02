import { useNavigate,useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

// ]]import React, { useState, useEffect } from "react";

interface HeaderProps {
  showSearch?: boolean;
  showProfile?: boolean;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export const Header = ({ 
  showSearch = false, 
  showProfile = false,
  onSearch,
  searchQuery = ""
}: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authMethod'); // Also remove auth method
    
    // Force refresh before navigation to update all components
    window.location.href = '/';
  };

  return (
    <header className={isHomePage ? "bg-black" : ""}>
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <img
            className="w-[70px] h-[70px]"
            alt="Logo"
            src={isHomePage ? "image-57.png" : "image-56.png"}
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />

          <nav className="absolute left-1/2 transform -translate-x-1/2 flex space-x-8">
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
                // onClick={(e) => {e.preventDefault();navigate('/favorites');}}
                onClick={() => window.location.href = 'http://localhost:5173/favorites'}
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
                  onClick={() => window.location.href = 'http://localhost:5173/profile'}
                  // onClick={() => navigate('/profile')}
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
          )} */}


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
      </div>
    </header>
  );
};