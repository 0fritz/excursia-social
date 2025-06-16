import { useState, useMemo, useEffect } from 'react';
import { UserEvent } from './useUser';

export const useSearch = (
  audience: 'public' | 'friends' = 'public',
  applied?: boolean,
  interested?: boolean
) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('search', searchQuery);
        if (audience) params.append('audience', audience);
        if (applied !== undefined) params.append('applied', applied.toString());
        if (interested !== undefined) params.append('interested', interested.toString());

        const res = await fetch(`http://localhost:3000/events?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, audience, applied]); 

  const hasResults = events.length > 0;

  return {
    searchQuery,
    setSearchQuery,
    events,
    hasResults,
    loading
  };
};
