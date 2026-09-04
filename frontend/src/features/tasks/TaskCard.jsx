import { useState } from 'react';
import { deleteTask } from './tasksApi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

const statusClass = { Pending: 'bg-amber-50 text-amber-700 border-amber-200', 'In Progress': 'bg-blue-50 text-blue-700 border-blue-200', Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
const priorityClass = { Low: 'text-slate-600', Medium: 'text-orange-600', High: 'text-red-600' };

function formatDate(value) { if (!value) return null; const date = new Date(value); return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function TaskCard({ task, onEdit, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const dueDate = formatDate(task.dueDate);

  const handleDelete = async () => {
    if (!window.confirm(`Delete “${task.title}”?`)) return;
    setDeleting(true); setError('');
    try { await deleteTask(task.id); onDeleted(); }
    catch (err) { setError(err.response?.data?.message || 'Unable to delete task.'); }
    finally { setDeleting(false); }
  };

  return <Card className="h-full">
    <CardHeader className="pb-3"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold leading-6 break-words">{task.title}</h3><Badge className={statusClass[task.status] || ''}>{task.status || 'Pending'}</Badge></div></CardHeader>
    <CardContent><p className="min-h-12 whitespace-pre-wrap break-words text-sm text-muted-foreground">{task.description || 'No description.'}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs"><Badge variant="outline" className={priorityClass[task.priority]}>{task.priority || 'Medium'} priority</Badge>{dueDate && <span className="text-muted-foreground">Due {dueDate}</span>}</div>
      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      <div className="mt-5 flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => onEdit(task)}>Edit</Button><Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting && <Spinner />}Delete</Button></div>
    </CardContent>
  </Card>;
}
