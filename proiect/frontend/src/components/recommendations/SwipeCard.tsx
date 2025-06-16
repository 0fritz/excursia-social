import React, { useState, useRef } from 'react';
import { EventGPT } from '../../types/EventGPT';
import { MapPin, Calendar, Users, Heart, X } from 'lucide-react';
import { getImageUrl } from '@/api';

interface SwipeCardProps {
  event: EventGPT;
  onSwipe: (direction: 'left' | 'right') => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ event, onSwipe }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
    setIsDragging(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating) return;
    
    const deltaX = e.clientX - startPosition.x;
    const deltaY = e.clientY - startPosition.y;
    setDragPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (!isDragging || isAnimating) return;
    
    const threshold = 100;
    if (Math.abs(dragPosition.x) > threshold) {
      performSwipe(dragPosition.x > 0 ? 'right' : 'left');
    } else {
      // Snap back to center
      setDragPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setStartPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isAnimating) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosition.x;
    const deltaY = touch.clientY - startPosition.y;
    setDragPosition({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!isDragging || isAnimating) return;
    
    const threshold = 100;
    if (Math.abs(dragPosition.x) > threshold) {
      performSwipe(dragPosition.x > 0 ? 'right' : 'left');
    } else {
      // Snap back to center
      setDragPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  };

  const performSwipe = (direction: 'left' | 'right') => {
    setIsAnimating(true);
    setIsDragging(false);
    
    // Animate card flying off screen
    const flyDistance = direction === 'right' ? 400 : -400;
    setDragPosition({ x: flyDistance, y: -100 });
    
    // Call onSwipe after animation
    setTimeout(() => {
      onSwipe(direction);
      setIsAnimating(false);
      setDragPosition({ x: 0, y: 0 });
    }, 300);
  };

  const handleButtonSwipe = (direction: 'left' | 'right') => {
    if (isAnimating) return;
    performSwipe(direction);
  };

  const rotation = dragPosition.x * 0.1;
  const opacity = isAnimating ? 0 : Math.max(0.3, 1 - Math.abs(dragPosition.x) * 0.002);
  const scale = isDragging ? 0.95 : 1;

  return (
    <div className="relative h-full w-full">
      <div
        ref={cardRef}
        className="absolute inset-0 bg-white rounded-2xl shadow-xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{
          transform: `translateX(${dragPosition.x}px) translateY(${dragPosition.y}px) rotate(${rotation}deg) scale(${scale})`,
          opacity: opacity,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image */}
        <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 relative overflow-hidden">
          <img 
            src={getImageUrl(event.image)} 
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              console.log(event);
            }}
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-800">
            {event.attendees}/{event.maxAttendees}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-20"></div>
        </div>

        {/* Content */}
        <div className="p-6 h-72 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">{event.title}</h3>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3 text-blue-500" />
              <span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3 text-red-500" />
              <span className="font-medium">{event.location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="h-5 w-5 mr-3 text-green-500" />
              <span className="font-medium">{event.interested} people interested</span>
            </div>
          </div>

          <p className="text-gray-700 text-sm line-clamp-4 mb-4 flex-grow">
            {event.description}
          </p>

          {/* Organizer */}
          <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
            <img 
              src={getImageUrl(event.organizerAvatar)}
              alt={event.organizerName}
              className="h-10 w-10 rounded-full mr-3 border-2 border-gray-200"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop&crop=face";
              }}
            />
            <div>
              <span className="text-sm font-semibold text-gray-800">Organized by</span>
              <p className="text-sm text-gray-600">{event.organizerName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-6">
        <button
          onClick={() => handleButtonSwipe('left')}
          disabled={isAnimating}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white p-4 rounded-full shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <X className="h-7 w-7" />
        </button>
        <button
          onClick={() => handleButtonSwipe('right')}
          disabled={isAnimating}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white p-4 rounded-full shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <Heart className="h-7 w-7" />
        </button>
      </div>

      {/* Swipe indicators */}
      {dragPosition.x > 50 && !isAnimating && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500/90 text-white px-6 py-3 rounded-xl font-bold text-xl backdrop-blur-sm animate-pulse">
          INTERESTED ❤️
        </div>
      )}
      {dragPosition.x < -50 && !isAnimating && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500/90 text-white px-6 py-3 rounded-xl font-bold text-xl backdrop-blur-sm animate-pulse">
          PASS ✕
        </div>
      )}
    </div>
  );
};

export default SwipeCard;
