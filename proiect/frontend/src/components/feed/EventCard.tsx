import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, User, Heart, MessageCircle, Share } from 'lucide-react';
import { useInterest } from '@/hooks/useInterest';
import { UserEvent } from '@/hooks/useUser';

interface EventCardProps {
  event: UserEvent;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { isInterested, toggleInterest, interestedCount } = useInterest(event.id);

  const handleToggleInterest = () => {
    toggleInterest();
  };

  return (
    <div className="excursia-card animate-fade-in">
      {/* Event creator */}
      <div className="flex items-center mb-4">
        <Link to={`/profile/${event.organizerId}`}>
          <img 
            src={`http://localhost:3000${event.organizerAvatar}`} 
            alt={event.organizerName} 
            className="w-10 h-10 rounded-full object-cover"
          />
        </Link>
        <div className="ml-3">
          <Link to={`/profile/${event.organizerId}`} className="font-medium hover:underline">
            {event.organizerName}
          </Link>
          <p className="text-xs text-gray-500">Posted an event</p>
        </div>
      </div>

      {/* Event content */}
      <Link to={`/event/${event.id}`}>
        <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
        <p className="text-gray-600 mb-3 text-sm">{event.description}</p>
      </Link>

      {/* Event details */}
      <div className="mb-4 text-sm">
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center text-gray-600 mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date(event.date).toLocaleString()}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <User className="w-4 h-4 mr-2" />
          <span>
            {event.attendees} attending
            {event.maxAttendees ? ` · ${event.maxAttendees - event.attendees} spots left` : ''}
          </span>
        </div>
      </div>

      {/* Event image */}
      <Link to={`/event/${event.id}`} className="block mb-4">
        <img 
          src={`http://localhost:3000${event.image}`} 
          alt={event.title} 
          className="w-full h-64 object-cover rounded-lg"
        />
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-b border-gray-200 py-3 px-2 mb-3">
        <button 
          className={`flex items-center ${isInterested ? 'text-red-500' : 'text-gray-600'} hover:bg-gray-100 px-3 py-1 rounded-md`}
          onClick={handleToggleInterest}
        >
          <Heart className={`w-5 h-5 mr-1 ${isInterested ? 'fill-current' : ''}`} />
          <span>{interestedCount ?? event.interested} Interested</span>
        </button>

        <Link to={`/event/${event.id}`} className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-md">
          <MessageCircle className="w-5 h-5 mr-1" />
          <span>{event.comments} Comments</span>
        </Link>

        <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-md">
          <Share className="w-5 h-5 mr-1" />
          <span>Share</span>
        </button>
      </div>

      {/* Apply button */}
      <div className="flex justify-between">
        <Link 
          to={`/event/${event.id}`} 
          className="text-excursia-blue hover:underline text-sm"
        >
          View details
        </Link>
        {event.maxAttendees && event.attendees >= event.maxAttendees ? (
          <span className="text-red-500 text-sm">Event Full</span>
        ) : (
          <Link 
            to={`/event/${event.id}`} 
            className="btn-primary text-sm"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
};

export default EventCard;
