import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchTasks } from './tasksApi';

const DEFAULT_LIMIT = 10;

export function useTasks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: DEFAULT_LIMIT,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      status: searchParams.get('status') || '',
      priority: searchParams.get('priority') || '',
      page: Math.max(1, Number(searchParams.get('page')) || 1),
      limit: Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT),
    }),
    [searchParams],
  );

  const setFilters = useCallback(
    (next) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          const values =
            typeof next === 'function' ? next({ ...filters }) : next;
          const resetPage = Object.keys(values).some((key) =>
            ['search', 'status', 'priority'].includes(key),
          );

          ['search', 'status', 'priority'].forEach((key) => {
            if (values[key] !== undefined) {
              if (values[key]) params.set(key, values[key]);
              else params.delete(key);
            }
          });
          if (values.limit !== undefined)
            params.set('limit', String(values.limit));
          if (values.page !== undefined)
            params.set('page', String(values.page));
          else if (resetPage) params.set('page', '1');
          return params;
        },
        { replace: true },
      );
    },
    [filters, setSearchParams],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetchTasks(filters);
      setTasks(response.data?.tasks || []);
      setPagination(
        response.data?.pagination || {
          total: 0,
          page: filters.page,
          limit: filters.limit,
          totalPages: 0,
        },
      );
    } catch (err) {
      setTasks([]);
      setError(err.response?.data?.message || 'Unable to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(refresh, filters.search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [refresh, filters.search]);

  return { tasks, pagination, filters, loading, error, setFilters, refresh };
}
