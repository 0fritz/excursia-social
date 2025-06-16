import React from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import EventCard from '../components/feed/EventCard';
import { useSearch } from '@/hooks/useSearch';
import { useIsMobile } from '@/hooks/use-mobile';

const Favorites: React.FC = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q') || '';
  const isMobile = useIsMobile();

  const { setSearchQuery, events, hasResults, loading } = useSearch('public',true);

  React.useEffect(() => {
    setSearchQuery(query);
  }, [query, setSearchQuery]);

  return (
    <MainLayout>
      <div className={isMobile ? 'px-0' : ''}>
        <div className={`mx-auto ${isMobile ? 'w-full' : 'max-w-2xl'}`}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Favorites</h1>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-600">Loading events...</div>
          ) : !hasResults && query ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse all events.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Favorites;
