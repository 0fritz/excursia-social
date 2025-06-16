import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { MapPin, Calendar, Clock, Users, Heart, Share } from 'lucide-react';
import { useEvent} from '../hooks/useEvents';
import { useInterest } from '@/hooks/useInterest';
import { applyToEvent } from '@/api/eventsApi';
import { useUser } from '@/hooks/useUser';


const BASE_URL = 'http://localhost:3000';

interface LocalUser {
  id: number;
  profile_picture: string;
}

const getUserFromLocalStorage = (): LocalUser => {
  try {
    const user = localStorage.getItem('user');
    if (!user) return null;
    const parsed = JSON.parse(user);
    return {
      id: parsed.id,
      profile_picture: parsed.profile_picture,
    };
  } catch {
    return null;
  }
};

const Event: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id || '0');
  const user = useUser();
  const { event, loading, error, postComment } = useEvent(id!);
  const { isInterested, toggleInterest, interestedCount } = useInterest(eventId);

  const [showAllAttendees, setShowAllAttendees] = useState(false);
  const [comment, setComment] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);


  if (loading) return <MainLayout><div>Loading...</div></MainLayout>;
  if (error || !event) return <MainLayout><div>Error loading event.</div></MainLayout>;

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    await postComment( comment);
    setComment('');
  };

  const handleApplyToJoin = async () => {
    if (!user.id) return;
  
    try {
      setIsApplying(true);
      await applyToEvent(localStorage.getItem('token')!, eventId);
      setHasApplied(true);
      alert('Your application has been submitted!');
    } catch (err) {
      console.error('Failed to apply to event:', err);
      alert('Could not apply to event. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };
  


  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <img src={`${BASE_URL}${event.imageUrl}`} alt={event.title} className="w-full h-64 object-cover" />
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>

            <div className="flex items-center mb-4">
              <img src={`${BASE_URL}${event.organizer.avatar}`} alt={event.organizer.name} className="w-8 h-8 rounded-full object-cover" />
              <span className="ml-2 text-gray-700">
                Organized by <a href={`/profile/${event.organizer.id}`} className="font-medium hover:underline">{event.organizer.name}</a>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-1" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-gray-700">{event.location}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-500 mr-2 mt-1" />
                <div>
                  <h3 className="font-medium">Date</h3>
                  <p className="text-gray-700">{event.date}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-gray-500 mr-2 mt-1" />
                <div>
                  <h3 className="font-medium">Time</h3>
                  <p className="text-gray-700">N/A</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="w-5 h-5 text-gray-500 mr-2 mt-1" />
                <div>
                  <h3 className="font-medium">Attendees</h3>
                  <p className="text-gray-700">{event.attendees.length} / {event.maxAttendees} spots filled</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">About this event</h2>
              <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
            </div>

            <div className="flex flex-wrap gap-4">
            <button
              className="btn-primary flex-1 sm:flex-initial disabled:opacity-50"
              onClick={handleApplyToJoin}
              disabled={isApplying || event.applicationStatus === 'pending' || event.applicationStatus === 'accepted' || event.applicationStatus === 'rejected'}
            >
              {event.applicationStatus === 'pending' && 'Application Pending'}
              {event.applicationStatus === 'accepted' && 'Application Accepted'}
              {event.applicationStatus === 'rejected' && 'Application Rejected'}
              {!event.applicationStatus && (isApplying ? 'Applying...' : 'Apply to Join')}
            </button>

              <button className={`btn-outline flex items-center flex-1 sm:flex-initial ${isInterested ? 'text-red-500' : ''}`} onClick={toggleInterest}>
                <Heart className={`w-5 h-5 mr-2 ${isInterested ? 'fill-current' : ''}`} />
                <span>{isInterested ? 'Interested' : 'Show Interest'} ({interestedCount ?? event.interested})</span>
              </button>
              <button className="btn-outline flex items-center flex-1 sm:flex-initial">
                <Share className="w-5 h-5 mr-2" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Attendees ({event.attendees.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {(showAllAttendees ? event.attendees : event.attendees.slice(0, 8)).map((attendee) => (
              <a href={`/profile/${attendee.id}`} key={attendee.id} className="flex flex-col items-center">
                <img src={`${BASE_URL}${attendee.avatar}`} alt={attendee.name} className="w-16 h-16 rounded-full object-cover" />
                <span className="mt-2 text-sm font-medium">{attendee.name}</span>
              </a>
            ))}
          </div>
          {event.attendees.length > 8 && !showAllAttendees && (
            <button className="mt-4 text-excursia-blue hover:underline text-sm" onClick={() => setShowAllAttendees(true)}>
              Show all attendees
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Discussion ({event.comments.length})</h2>
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex space-x-3">
              <img src={`${BASE_URL}${user.profile_picture}`} alt="Your avatar" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1">
                <textarea className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3} placeholder="Write a comment..." value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                <div className="mt-2 flex justify-end">
                  <button type="submit" className="btn-primary text-sm px-4" disabled={!comment.trim()}>Post Comment</button>
                </div>
              </div>
            </div>
          </form>

          <div className="space-y-6">
            {event.comments.map((c) => (
              <div key={c.id} className="flex space-x-3">
                <img src={`${BASE_URL}${c.avatar??c.user.avatar}`} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium">{c.name}</div>
                    <p>{c.content}</p>
                  </div>
                  <div className="mt-1 flex items-center text-xs text-gray-500 space-x-3">
                    <span>{c.timestamp}</span>
                    <button className="hover:text-excursia-blue">Like</button>
                    <button className="hover:text-excursia-blue">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Event;

