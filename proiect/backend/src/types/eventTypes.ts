export interface Event {
    id: number;
    title: string;
    description: string;
    location: string;
    date: string;
    image: string | null;
    maxAttendees?: number;
    audience: 'public' | 'friends';
    organizer: {
      id: number;
      name: string;
      avatar: string | null;
    };
    attendees: number;
    interested: number;
    comments: number;
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
    attendees: {
      id: number;
      name: string;
      avatar: string;
    }[];
    comments: {
      id: number;
      content: string;
      timestamp: string;
      user: {
        id: number;
        name: string;
        avatar: string;
      };
    }[];
  }

  // types.ts
export interface EventGPT {
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
