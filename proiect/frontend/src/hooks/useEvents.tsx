import { useQuery } from '@tanstack/react-query';
import { getEvents } from '../api/eventsApi';
import { createEvent, CreateEventPayload } from '../api/eventsApi';
import { useToken } from './useUser';
import { checkInterested } from '../api/eventsApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markInterested, unmarkInterested } from '../api/eventsApi';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { api } from '@/api';
import { useInterest } from './useInterest';

const baseURL = "http://localhost:3000"

export interface Attendee {
  id: number;
  name: string;
  avatar: string;
}

export interface Comment {
  id: number;
  content: string;
  timestamp: string;
  user: {
    id: number;
    name: string;
    avatar: string;
  };
}

export interface EventDetail {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  imageUrl: string;
  maxAttendees: number;
  audience: 'public' | 'friends';
  interested: number;
  userId: number;
  applicationStatus: 'pending' | 'rejected' | 'accepted' | null;
  organizer: {
    id: number;
    name: string;
    avatar: string;
  };
  attendees: Attendee[];
  comments: Comment[];
}


export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreateEvent = () => {
  const token = useToken();

  return useMutation({
    mutationFn: (eventData: CreateEventPayload) => {
      if (!token) throw new Error('No token provided');
      return createEvent(token, eventData);
    },
  });
};


export const useInterestStatus = (eventId: number) => {
  const token = useToken();

  return useQuery({
    queryKey: ['interest', eventId],
    queryFn: () => {
      if (!token) throw new Error('No token');
      return checkInterested(token, eventId);
    },
    enabled: !!token,
  });
};


export const useEventCard = (eventId: number) =>
  useQuery({
    queryKey: ['eventCard', eventId],
    queryFn: async () => {
      const { data } = await axios.get(`/events/${eventId}`);
      return data;
    },
  });

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useToken();
  const { isInterested, toggleInterest, interestedCount } = useInterest(Number(eventId || 0));

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [eventRes, commentsRes] = await Promise.all([
          api.get(`/events/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/events/${eventId}/comments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setEvent(eventRes.data);
        setComments(commentsRes.data as Comment[]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch event or comments');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, token]);

  const postComment = async (content: string) => {
    if (!token) return;
  
    try {
      const res = await api.post(
        `/events/${eventId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(prev => [res.data, ...prev]);
    } catch (e) {
      console.error('Error posting comment:', e);
    }
  };
  

  return {
    event: event ? { ...event, comments } : null,
    loading,
    error,
    isInterested,
    toggleInterest,
    interestedCount,
    postComment,
  };
}




  



