import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import EventFeed from '../components/feed/EventFeed';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <MainLayout>
      <div className={isMobile ? 'px-0' : ''}>
        <EventFeed audience='friends' />
      </div>
    </MainLayout>
  );
};

export default Index;
