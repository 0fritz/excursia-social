import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import SwipeCards from '../components/recommendations/SwipeCards';
import { useIsMobile } from '@/hooks/use-mobile';

const Recommendations: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <MainLayout>
      <div className={`mx-auto ${isMobile ? 'w-full px-4' : 'max-w-2xl'}`}>
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Recommendations</h1>
          <p className="text-gray-600">Discover events tailored just for you</p>
        </div>
        <SwipeCards />
      </div>
    </MainLayout>
  );
};

export default Recommendations;
