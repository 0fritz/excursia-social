import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Bell, Calendar, UserPlus, Check, X } from 'lucide-react';
import { UserEvent, useToken, useUser } from '@/hooks/useUser';
import { getPendingFriendRequests, getUserProfiles, respondToFriendRequest } from '@/api/friendsApi';
import { getPendingEventApplications, respondToEventApplication, getEvents } from '@/api/eventsApi';
import { useUserEvents } from '@/hooks/useUser';

interface Notification {
  id: number;
  type: 'event_application' | 'friend_request';
  title: string;
  message: string;
  from: {
    id: number;
    name: string;
    avatar: string | null;
  };
  eventId?: number;
  eventTitle?: string;
}


const baseUrl = "http://localhost:3000";

const Notifications: React.FC = () => {
  const token = useToken();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const user = useUser(); // ✅ call this at the top level
  const { data: events = [] } = useUserEvents(user?.id); // ✅ also at the top

  useEffect(() => {
    const loadNotifications = async () => {
      if (!token) return;

      try {
        const [friendsPending, users, eventApps] = await Promise.all([
          getPendingFriendRequests(token),
          getUserProfiles(),
          getPendingEventApplications(token),
        ]);

        const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
        const eventMap = Object.fromEntries(events.map((e) => [e.id, e]));

        const friendNotifications: Notification[] = friendsPending.requests.map((req, index) => {
          const fromUser = userMap[req.fromUserId];
          return {
            id: index + 1,
            type: 'friend_request',
            title: 'Friend Request',
            message: 'sent you a friend request',
            from: {
              id: fromUser.id,
              name: fromUser.name,
              avatar: fromUser.profile_picture,
            },
          };
        });

        const eventNotifications: Notification[] = eventApps.applications.map((app, index) => {
          const fromUser = userMap[app.user_id];
          const event = eventMap[app.event_id];
          console.log('fromUser object:', fromUser);
          return {
            id: 1000 + index,
            type: 'event_application',
            title: 'Event Application',
            message: `wants to join your event "${event?.title}"`,
            from: {
              id: fromUser.id,
              name: fromUser.name,
              avatar: fromUser.profile_picture,
            },
            eventId: event?.id,
            eventTitle: event?.title,
          };
        });

        setNotifications([...friendNotifications, ...eventNotifications]);
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    loadNotifications();
  }, [token, events]);


  const handleAccept = async (notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || !token) return;

    try {
      if (notification.type === 'friend_request') {
        await respondToFriendRequest(token, notification.from.id, 'accepted');
        alert(`You are now friends with ${notification.from.name}!`);
      } else if (notification.type === 'event_application') {
        await respondToEventApplication(token, notification.from.id, notification.eventId!, 'accepted');
        alert(`${notification.from.name} has been accepted to "${notification.eventTitle}"!`);
      }

      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to accept request:", error);
    }
  };

  const handleDecline = async (notificationId: number) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification || !token) return;

    try {
      if (notification.type === 'friend_request') {
        await respondToFriendRequest(token, notification.from.id, 'rejected');
        alert(`Friend request from ${notification.from.name} has been declined.`);
      } else if (notification.type === 'event_application') {
        await respondToEventApplication(token, notification.from.id, notification.eventId!, 'rejected');
        alert(`${notification.from.name}'s application to "${notification.eventTitle}" has been declined.`);
      }

      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Failed to reject request:", error);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Bell className="w-6 h-6 mr-3 text-excursia-blue" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">You're all caught up! Check back later for new notifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow p-6`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        notification.type === 'event_application' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {notification.type === 'event_application' ? (
                          <Calendar className="w-5 h-5 text-green-600" />
                        ) : (
                          <UserPlus className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <img
                          src={
                            notification.from.avatar
                              ? `${baseUrl}${notification.from.avatar}`
                              : '/default-avatar.png'
                          }
                          alt={notification.from.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-medium text-gray-900">{notification.from.name}</span>
                          <span className="text-gray-700 ml-1">{notification.message}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccept(notification.id);
                      }}
                      className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 rounded-full text-green-600 transition-colors"
                      title="Accept"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecline(notification.id);
                      }}
                      className="flex items-center justify-center w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full text-red-600 transition-colors"
                      title="Decline"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Notifications;
