import { api } from '@/api';
import { useState, useEffect } from 'react';
import { useToken } from './useUser';


export function useInterest(eventId: number) {
  const token = useToken();
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    api.get(`/events/${eventId}/interested`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      setIsInterested(res.data.interested);
      setInterestedCount(res.data.count);
    }).catch(err => {
      console.error('Failed to fetch interest status', err);
    });
  }, [eventId, token]);

  const toggleInterest = async () => {
    if (!token) return;
    try {
      if (!isInterested) {
        await api.post(`/events/${eventId}/interested`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInterestedCount((prev) => (prev ?? 0) + 1);
        setIsInterested(true);
      } else {
        await api.delete(`/events/${eventId}/interested`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInterestedCount((prev) => Math.max((prev ?? 1) - 1, 0));
        setIsInterested(false);
      }
    } catch (e) {
      console.error('Error toggling interest:', e);
    }
  };

  return { isInterested, toggleInterest, interestedCount };
}
