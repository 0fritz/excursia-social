import React, { useState, useEffect, useMemo } from 'react';
import { EventGPT } from '../../types/EventGPT';
import SwipeCard from './SwipeCard';
import { useRecommendations } from '../../hooks/useRecommendations';

const SwipeCards: React.FC = () => {
  const { events, loading, loadMore, markInterested } = useRecommendations();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentEvent = useMemo(() => events[currentIndex], [events, currentIndex]);
  const nextEvent = useMemo(() => events[currentIndex + 1], [events, currentIndex]);


  useEffect(()=>{
    console.log("Events:",events);
    console.log("Current",currentIndex);
    console.log("CurrentEvent", currentEvent);
  },[events])

  const handleSwipe = async (direction: 'left' | 'right', eventId: number) => {
    if (direction === 'right') {
      await markInterested(eventId);
    } else {
      // Mock left swipe request
      console.log('Left swipe (mock request) for event:', eventId);
    }
    
    setCurrentIndex(prev => prev + 1);
    console.log("CurrentIndex",currentIndex);
    // Load more events when we're running low
    if (currentIndex >= events.length - 2) {
      loadMore();
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI recommendations...</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= events.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No more recommendations</h3>
          <p className="text-gray-600">Check back later for more personalized events!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] w-full max-w-md mx-auto mb-20">
      {nextEvent && (
        <div className="absolute inset-0 transform scale-95 opacity-40 z-0">
          <SwipeCard key={nextEvent.id} event={nextEvent} onSwipe={() => {}} />
        </div>
      )}
  
      {currentEvent && (
        <div className="absolute inset-0 z-10">
          <SwipeCard key={currentEvent.id} event={currentEvent} onSwipe={(direction) => handleSwipe(direction, currentEvent.id)} />
        </div>
      )}
    </div>
  );  
};

export default SwipeCards;
