import React from 'react';
import EventCard from './EventCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearch } from '@/hooks/useSearch';

interface EventFeedProps {
  audience: 'public' | 'friends';
  applied?: boolean;
}

const EventFeed: React.FC<EventFeedProps> = ({ audience, applied }) => {
  const isMobile = useIsMobile();
  const { events, loading, hasResults } = useSearch(audience, applied);

  return (
    <div className={`mx-auto ${isMobile ? 'w-full' : 'max-w-2xl'}`}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Event Feed</h1>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-8">Loading events...</div>
      ) : !hasResults ? (
        <div className="text-center text-gray-600 py-8">No events found.</div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventFeed;
