// src/hooks/useEventApplications.ts
import { useEffect, useState } from 'react';
import { getPendingEventApplications } from '../api/eventsApi';

interface Application {
  user_id: number;
  event_id: number;
}

interface UseEventApplicationsResult {
  applications: Application[];
  loading: boolean;
  error: string | null;
}

export const useEventApplications = (token: string | null): UseEventApplicationsResult => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchApplications = async () => {
      try {
        const data = await getPendingEventApplications(token);
        setApplications(data.applications);
      } catch (err) {
        console.error('Failed to load event applications:', err);
        setError('Could not load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  return { applications, loading, error };
};
