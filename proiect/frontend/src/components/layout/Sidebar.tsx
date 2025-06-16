import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, User, Settings, Heart, Plus, Zap } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4 h-[calc(100vh-64px)] sticky top-16">
      <div className="space-y-1">
        <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
          <Home className="h-5 w-5" />
          <span>Home</span>
        </Link>
        <Link to="/explore" className={`nav-link ${isActive("/explore") ? "active" : ""}`}>
          <Map className="h-5 w-5" />
          <span>Explore Events</span>
        </Link>
        <Link to="/recommendations" className={`nav-link ${isActive("/recommendations") ? "active" : ""}`}>
          <Zap className="h-5 w-5" />
          <span>Recommendations</span>
        </Link>
        <Link to="/profile" className={`nav-link ${isActive("/profile") ? "active" : ""}`}>
          <User className="h-5 w-5" />
          <span>My Profile</span>
        </Link>
        <Link to="/favorites" className={`nav-link ${isActive("/favorites") ? "active" : ""}`}>
          <Heart className="h-5 w-5" />
          <span>Applied Events</span>
        </Link>
        <Link to="/interested" className={`nav-link ${isActive("/interested") ? "active" : ""}`}>
          <Heart className="h-5 w-5" />
          <span>Liked Events</span>
        </Link>
        <Link to="/create-event" className={`nav-link ${isActive("/create-event") ? "active" : ""}`}>
          <Plus className="h-5 w-5" />
          <span>Create Event</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
