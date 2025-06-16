import { api, setAuthToken } from './index';

export interface CreateEventPayload {
  title: string;
  description: string;
  date: string;
  location: string;
  audience?: 'public' | 'friends';
  maxAttendees?: string;
  image?: string;
}

interface FetchEventsOptions {
  audience?: 'friends' | 'public';
  search?: string;
  userId?: number;
}

interface EventGPT {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  image: string;
  maxAttendees: number;
  organizerId: number;
  organizerName: string;
  organizerAvatar: string;
  attendees: number;
  interested: number;
  comments: number;
}

export async function getGPTEvents(): Promise<EventGPT[]> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    const response = await api.get('/gpt', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return response.data.events as EventGPT[];
  } catch (error: any) {
    console.error('Failed to fetch events:', error);
    throw new Error(error.response?.data?.message || 'Error fetching events');
  }
}



export const createEvent = async (
  token: string,
  eventData: CreateEventPayload
): Promise<{ id: number }> => {
  setAuthToken(token);

  const formData = new FormData();
  formData.append('title', eventData.title);
  formData.append('description', eventData.description);
  formData.append('date', eventData.date);
  formData.append('location', eventData.location);
  formData.append('audience', eventData.audience || 'public');
  if (eventData.maxAttendees) {
    formData.append('maxAttendees', eventData.maxAttendees);
  }
  if (eventData.image) {
    formData.append('image', eventData.image);
  }

  const response = await api.post('/events', formData);
  return response.data;
};
  

export const getEvents = async (): Promise<Event[]> => {
    const response = await api.get<Event[]>('/events');
    return response.data;
  };

export const getAppliedEvents = async (applied: boolean): Promise<Event[]> => {
  const response = await api.get<Event[]>('/events', {
    params: { applied: applied.toString() },
  });
  return response.data;
};
  

export const markInterested = async (token: string, eventId: number) => {
  setAuthToken(token);
  await api.post(`/events/${eventId}/interested`);
};

export const unmarkInterested = async (token: string, eventId: number) => {
  setAuthToken(token);
  await api.delete(`/events/${eventId}/interested`);
};

export const checkInterested = async (token: string, eventId: number): Promise<boolean> => {
  setAuthToken(token);
  const res = await api.get<{ interested: boolean }>(`/events/${eventId}/interested`);
  return res.data.interested;
};


export const applyToEvent = async (token: string, eventId: number): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/events/applications/apply', {
    eventId,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.data;
};

export const respondToEventApplication = async (
  token: string,
  userId: number,
  eventId: number,
  decision: 'accepted' | 'rejected'
): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>('/events/applications/respond', {
    userId,
    eventId,
    decision
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.data;
};

export const getPendingEventApplications = async (
  token: string
): Promise<{ applications: { user_id: number; event_id: number }[] }> => {
  const response = await api.get<{ applications: { user_id: number; event_id: number }[] }>(
    '/events/applications/pending',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }
  );
  return response.data;
};

  