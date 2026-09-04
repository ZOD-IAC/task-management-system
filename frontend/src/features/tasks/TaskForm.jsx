import { useEffect, useState } from 'react';
import { createTask, updateTask } from './tasksApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';

const emptyForm = { title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '' };

function normalizeDate(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

export default function TaskForm({ task, onSuccess, onCancel }) {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (task) setForm({ title: task.title || '', description: task.description || '', status: task.status || 'Pending', priority: task.priority || 'Medium', dueDate: normalizeDate(task.dueDate) });
    else setForm(emptyForm);
    setError('');
  }, [task]);

  const handleChange = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Title is required.'); return; }
    setSubmitting(true); setError('');
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      ...(form.dueDate ? { dueDate: form.dueDate } : {}),
    };
    try {
      if (task) await updateTask(task.id, payload);
      else await createTask(payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || (task ? 'Unable to update task.' : 'Unable to create task.'));
    } finally { setSubmitting(false); }
  };

  return <form onSubmit={handleSubmit} className="space-y-4">
    {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
    <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Finish dashboard API integration" required autoFocus /></div>
    <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={form.description} onChange={handleChange} placeholder="Add a short description..." /></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2"><Label htmlFor="status">Status</Label><Select id="status" name="status" value={form.status} onChange={handleChange}><option>Pending</option><option>In Progress</option><option>Completed</option></Select></div>
      <div className="space-y-2"><Label htmlFor="priority">Priority</Label><Select id="priority" name="priority" value={form.priority} onChange={handleChange}><option>Low</option><option>Medium</option><option>High</option></Select></div>
    </div>
    <div className="space-y-2"><Label htmlFor="dueDate">Due date</Label><Input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} /></div>
    <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting && <Spinner />}{task ? 'Save changes' : 'Create task'}</Button></div>
  </form>;
}
