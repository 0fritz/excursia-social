import { useState, useEffect } from 'react';
import { EventGPT } from '../types/EventGPT';
import { api } from '../api';
import { getGPTEvents } from '@/api/eventsApi';
import { useToken, useUser } from './useUser';

export const useRecommendations = () => {
  const user = useUser();
  const token = useToken();
  const [events, setEvents] = useState<EventGPT[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async () => {
    if (!token || !user?.id) {
      return;
    }

    setLoading(true);
    try {
      const recommended = await getGPTEvents();

      setEvents(recommended);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchRecommendations();
  };

  const markInterested = async (eventId: number) => {
    if (!token) {
      console.error('No auth token found');
      return;
    }

    try {
      await api.post(`/events/${eventId}/interested`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      console.log('Successfully marked interested for event:', eventId);
    } catch (error) {
      console.error('Failed to mark event as interested:', error);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [token, user?.id]);

  return {
    events,
    loading,
    loadMore,
    markInterested,
  };
};
