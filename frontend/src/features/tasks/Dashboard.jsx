import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useTasks } from './useTasks';
import Filters from './Filters';
import TaskForm from './TaskForm';
import Pagination from './Pagination';
import DashboardStats from './DashboardStats';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import TaskTable from './TaskTAble';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { tasks, pagination, filters, loading, error, setFilters, refresh } =
    useTasks();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loggingOut, setLoggingOut] = useState(false);

  const openCreate = () => {
    setEditingTask(null);
    setFormOpen(true);
  };
  const openEdit = (task) => {
    setEditingTask(task);
    setFormOpen(true);
  };
  const handleSuccess = async () => {
    setFormOpen(false);
    setEditingTask(null);
    await refresh();
    setRefreshKey((key) => key + 1);
  };
  const handleRefresh = () => {
    refresh();
    setRefreshKey((key) => key + 1);
  };
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className='min-h-screen bg-background'>
      <header className='border-b bg-card'>
        <div className='container flex min-h-16 items-center justify-between gap-4'>
          <div>
            <h1 className='text-lg font-bold tracking-tight'>Task Manager</h1>
            <p className='hidden text-xs text-muted-foreground sm:block'>
              Stay on top of your work.
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <span className='hidden text-sm text-muted-foreground sm:inline'>
              Hello{' '}
              <span className={'font-mono font-extrabold'}>
                {user?.name} 👋
              </span>
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut && <Spinner />}Log out
            </Button>
          </div>
        </div>
      </header>
      <main className='container py-8'>
        <div className='mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Dashboard</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Manage and track your tasks.
            </p>
          </div>
          <Button onClick={openCreate}>+ New task</Button>
        </div>
        <DashboardStats refreshKey={refreshKey} />
        <section className='mt-8 space-y-5'>
          <Filters filters={filters} setFilters={setFilters} />
          {error && (
            <div className='rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
              {error}
            </div>
          )}
          <TaskTable
            tasks={tasks}
            loading={loading}
            onEdit={openEdit}
            onRefresh={handleRefresh}
          />
          <Pagination
            pagination={pagination}
            filters={filters}
            setFilters={setFilters}
          />
        </section>
      </main>
      <Dialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingTask ? 'Edit task' : 'Create task'}
        description={
          editingTask
            ? 'Update the task details below.'
            : 'Add a task to your list.'
        }
      >
        <TaskForm
          task={editingTask}
          onSuccess={handleSuccess}
          onCancel={() => setFormOpen(false)}
        />
      </Dialog>
    </div>
  );
}
