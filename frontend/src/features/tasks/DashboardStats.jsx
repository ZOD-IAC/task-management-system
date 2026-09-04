import { useCallback, useEffect, useState } from 'react';
import { fetchDashboardStats } from './tasksApi';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const stats = [
  ['Total', 'total'],
  ['Pending', 'Pending'],
  ['In Progress', 'In Progress'],
  ['Completed', 'Completed'],
];
export default function DashboardStats({ refreshKey = 0 }) {
  const [data, setData] = useState({
    total: 0,
    Pending: 0,
    'In Progress': 0,
    Completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchDashboardStats();
      setData(res.data || {});
    } catch (err) {
      setError(
        err.response?.data?.message || 'Unable to load dashboard stats.',
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load, refreshKey]);
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {stats.map(([label, key]) => (
        <Card key={key}>
          <CardContent className='p-5'>
            <p className='text-sm font-medium text-muted-foreground'>{label}</p>
            {loading ? (
              <Spinner className='mt-3' />
            ) : (
              <p className='mt-2 text-3xl font-bold tracking-tight'>
                {data[key] ?? 0}
              </p>
            )}
            {error && <p className='mt-2 text-xs text-red-600'>{error}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
