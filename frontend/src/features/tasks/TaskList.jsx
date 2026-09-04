import TaskCard from './TaskCard';
import { Spinner } from '@/components/ui/Spinner';

export default function TaskList({ tasks, loading, onEdit, onRefresh }) {
  if (loading) return <div className="flex min-h-48 items-center justify-center text-muted-foreground"><Spinner className="mr-2" />Loading tasks...</div>;
  if (!tasks.length) return <div className="rounded-xl border border-dashed bg-card py-16 text-center"><h3 className="font-semibold">No tasks found</h3><p className="mt-1 text-sm text-muted-foreground">Try changing your filters or create a new task.</p></div>;
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{tasks.map((task) => <TaskCard key={task.id || task._id} task={task} onEdit={onEdit} onDeleted={onRefresh} />)}</div>;
}
