import { useNavigate,useLocation } from "react-router-dom";
import { Heart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('authMethod'); // Also remove auth method
    
    // Force refresh before navigation to update all components
    window.location.href = '/';
  };

  return (
    <header className={`sticky top-0 z-50 ${isHomePage ? "bg-black" : "bg-white shadow-sm"} ${isScrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <img
            className="w-[50px] h-[50px] sm:w-[70px] sm:h-[70px]"
            alt="Logo"
            src={isHomePage ? "image-57.png" : "image-56.png"}
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6 lg:space-x-8 absolute left-1/2 transform -translate-x-1/2">
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
          </nav>

          {/* Right side: Search & Profile */}
          <div className="flex items-center">
            {/* Search Box - Show on medium screens and up */}
            {showSearch && (
              <div className="relative hidden sm:block">
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
                  className="pl-10 pr-4 py-2 w-[200px] md:w-[300px] rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <img
                  src="/group-98.png"
                  alt="Search"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                />
              </div>
            )}
              
            {/* Profile Icon - if logged in */}
            {showProfile && isLoggedIn && (
              <div className="flex items-center ml-4">
                <img
                  src="/user.png"
                  alt="Profile"
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer ${
                    isHomePage ? 'filter invert brightness-0 contrast-100' : ''
                  }`}
                  onClick={() => window.location.href = 'http://localhost:5173/profile'}
                />
              </div>
            )}

            {/* Mobile menu button */}
            <button 
              className="inline-flex items-center justify-center p-2 ml-4 md:hidden rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className={`h-6 w-6 ${isHomePage ? 'text-white' : 'text-gray-500'}`} />
              ) : (
                <Menu className={`h-6 w-6 ${isHomePage ? 'text-white' : 'text-gray-500'}`} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white shadow-lg rounded-b-lg absolute left-0 right-0 p-4">
            <div className="flex flex-col space-y-4">
              <a 
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium block py-2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  setMobileMenuOpen(false);
                }}
              >
                HOME
              </a>
              <a 
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium block py-2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/about');
                  setMobileMenuOpen(false);
                }}
              >
                ABOUT US
              </a>
              <a 
                href="#"
                className="text-gray-700 hover:text-gray-900 font-medium block py-2"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/contact');
                  setMobileMenuOpen(false);
                }}
              >
                CONTACT US
              </a>
              {isLoggedIn && (
                <a 
                  href="#"
                  className="text-gray-700 hover:text-gray-900 font-medium flex items-center py-2"
                  onClick={() => {
                    window.location.href = 'http://localhost:5173/favorites';
                    setMobileMenuOpen(false);
                  }}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  FAVORITES
                </a>
              )}
              {isLoggedIn ? (
                <a 
                  href="#"
                  className="text-gray-700 hover:text-gray-900 font-medium block py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  LOGOUT
                </a>
              ) : (
                <a 
                  href="#"
                  className="text-gray-700 hover:text-gray-900 font-medium block py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  LOGIN
                </a>
              )}

              {/* Mobile Search */}
              {showSearch && (
                <div className="relative sm:hidden pt-2">
                  <input
                    type="search"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => onSearch && onSearch(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && onSearch) {
                        onSearch(searchQuery);
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <img
                    src="/group-98.png"
                    alt="Search"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};