import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import FriendsList from './FriendsList';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        {!isMobile && <Sidebar />}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
          {children}
        </main>
        {!isMobile && <FriendsList />}
      </div>
    </div>
  );
};

export default MainLayout;
