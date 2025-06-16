import { useQuery } from '@tanstack/react-query';
import { getChats, getMessages } from '../api/chatsApi';
import { useToken } from './useUser';

// Custom hook to fetch chats with no caching
export const useChats = () => {
  const token = useToken();
  return useQuery({
    queryKey: ['chats'],
    queryFn: () => getChats(token),
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });
};

// Custom hook to fetch messages for a specific chat with no caching
export const useMessages = (chatId: number) => {
  const token = useToken();
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => getMessages(token, chatId),
    enabled: !!token && !!chatId,
    refetchOnWindowFocus: false,
    staleTime: 0, 
  });
};
