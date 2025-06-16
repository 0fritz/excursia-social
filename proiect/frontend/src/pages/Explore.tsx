import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import EventFeed from '../components/feed/EventFeed';
import { useIsMobile } from '@/hooks/use-mobile';

const Explore: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <MainLayout>
      <div className={isMobile ? 'px-0' : ''}>
        <div className={`mx-auto ${isMobile ? 'w-full' : 'max-w-2xl'}`}>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Explore Events</h1>
          </div>
          <EventFeed audience='public' />
        </div>
      </div>
    </MainLayout>
  );
};

export default Explore;
