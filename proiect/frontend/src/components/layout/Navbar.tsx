import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, User, Menu, LogOut, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const userEmail = localStorage.getItem("userEmail") || '';
  const profilePicture = localStorage.getItem("profilePicture") || "";
  const fallbackURL = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop&crop=face";
  const baseURL =  "http://localhost:3000";
  const profileSrc = profilePicture ? `${baseURL}${profilePicture}` : fallbackURL;

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("profile_picture");
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-excursia-blue">Excursia</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <form onSubmit={handleSearch} className="relative bg-gray-100 rounded-full px-4 py-2 flex items-center w-64">
                <Search className="h-4 w-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search events, people..." 
                  className="ml-2 bg-transparent outline-none w-full text-sm" 
                  value={searchQuery}
                  onChange={handleSearchInput}
                />
              </form>
            </div>
          </div>
          
          <div className="flex items-center">
            <Link to="/notifications" className="p-2 rounded-full hover:bg-gray-100 relative">
              <Bell className="h-6 w-6 text-gray-700" />
            </Link>
            <Link to="/chat" className="p-2 rounded-full hover:bg-gray-100 relative ml-2">
              <MessageSquare className="h-6 w-6 text-gray-700" />
            </Link>
            <Link to="/profile" className="ml-2 flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                <img 
                  src= {profileSrc}
                  alt="Profile" 
                  className="h-full w-full object-cover"
                />
              </div>
            </Link>
            
            {userEmail && (
              <button 
                onClick={handleLogout}
                className="ml-4 p-2 rounded-md hover:bg-gray-100 flex items-center text-sm"
                title="Logout"
              >
                <LogOut className="h-5 w-5 mr-1" />
                <span className="hidden md:inline">Logout</span>
              </button>
            )}
            
            <button 
              className="ml-4 md:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-4 py-2 text-base font-medium text-excursia-blue bg-blue-50 rounded-md">
                Home
              </Link>
              <Link to="/explore" className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                Explore
              </Link>
              <Link to="/recommendations" className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Recommendations
              </Link>
              <Link to="/create-event" className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                Create Event
              </Link>
              {userEmail && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              )}
              <div className="relative mt-3 px-4">
                <form onSubmit={handleSearch}>
                  <Search className="absolute left-8 top-3 h-4 w-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search events, people..." 
                    className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-full outline-none"
                    value={searchQuery}
                    onChange={handleSearchInput}
                  />
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
