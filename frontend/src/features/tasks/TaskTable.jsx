import { useState } from 'react';

import { deleteTask, updateTask } from './tasksApi';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Dialog } from '@/components/ui/Dialog';
import TaskView from './TaskView';
import { statusClass, priorityClass } from '../../lib/constants';
import { formatDate } from '../../lib/utils';

export default function TaskTable({ tasks, loading, onEdit, onRefresh }) {
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [error, setError] = useState('');
  const [viewingTask, setViewingTask] = useState(null);

  const handleStatusChange = async (task, status) => {
    if (status === task?.status) return;
    const taskId = task?.id || task?._id;

    setUpdatingStatus(taskId);
    setError('');

    try {
      await updateTask(taskId, { status });
      await onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update task status.');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (task) => {
    const confirmed = window.confirm(`Delete “${task.title}”?`);
    const taskId = task?.id || task?._id;

    if (!confirmed) return;

    setDeletingTask(taskId);
    setError('');

    try {
      await deleteTask(taskId);
      await onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete task.');
    } finally {
      setDeletingTask(null);
    }
  };

  if (loading) {
    return (
      <div className='rounded-xl border bg-card px-6 py-14'>
        <div className='flex items-center justify-center gap-2 text-sm text-muted-foreground'>
          <Spinner />
          Loading tasks...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
        {error}
      </div>
    );
  }

  if (!tasks?.length) {
    return (
      <div className='rounded-xl border bg-card px-6 py-14 text-center'>
        <p className='font-medium'>No tasks found</p>

        <p className='mt-1 text-sm text-muted-foreground'>
          Create a task or change your filters to see results.
        </p>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-xl border bg-card'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[900px]'>
          <thead className='border-b bg-muted/40'>
            <tr>
              <th className='px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Task
              </th>

              <th className='px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Status
              </th>

              <th className='px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Priority
              </th>

              <th className='px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Due Date
              </th>

              <th className='px-5 py-3 text-right text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Actions
              </th>
            </tr>
          </thead>

          <tbody className='divide-y'>
            {tasks.map((task) => {
              const taskId = task?.id || task?._id;
              const dueDate = formatDate(task.dueDate);
              const isUpdating = updatingStatus === taskId;
              const isDeleting = deletingTask === taskId;

              return (
                <tr
                  key={taskId}
                  className='transition-colors hover:bg-muted/30'
                >
                  {/* Task */}
                  {/* <td className='max-w-[400px] px-5 py-4'>
                    <div>
                      <p className='truncate font-semibold text-foreground'>
                        {task.title}
                      </p>

                      <p className='mt-1 truncate text-sm text-muted-foreground'>
                        {task.description || 'No description.'}
                      </p>
                    </div>
                  </td> */}
                  <td className='max-w-[400px] px-5 py-4'>
                    <button
                      type='button'
                      onClick={() => setViewingTask(task)}
                      className='text-left'
                    >
                      <p className='font-semibold text-foreground hover:underline'>
                        {task.title}
                      </p>

                      <p className='mt-1 max-w-[400px] truncate text-sm text-muted-foreground'>
                        {task.description || 'No description.'}
                      </p>
                    </button>
                  </td>

                  {/* Status */}
                  <td className='px-5 py-4'>
                    <div className='relative inline-flex'>
                      <select
                        value={task.status || 'Pending'}
                        disabled={isUpdating}
                        onChange={(event) =>
                          handleStatusChange(task, event.target.value)
                        }
                        className={`
                          cursor-pointer appearance-none rounded-full
                          border py-1.5 pl-3 pr-8 text-xs font-medium
                          outline-none transition
                          focus:ring-2 focus:ring-ring
                          disabled:cursor-not-allowed disabled:opacity-60
                          ${statusClass[task.status] || statusClass.Pending}
                        `}
                      >
                        <option value='Pending'>Pending</option>

                        <option value='In Progress'>In Progress</option>

                        <option value='Completed'>Completed</option>
                      </select>

                      <span className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px]'>
                        ▼
                      </span>

                      {isUpdating && (
                        <span className='ml-2 flex items-center'>
                          <Spinner />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className='px-5 py-4'>
                    <Badge
                      variant='outline'
                      className={priorityClass[task.priority] || ''}
                    >
                      {task.priority || 'Medium'}
                    </Badge>
                  </td>

                  {/* Due date */}
                  <td className='whitespace-nowrap px-5 py-4 text-sm text-muted-foreground'>
                    {dueDate || '—'}
                  </td>

                  {/* Actions */}
                  <td className='px-5 py-4'>
                    <div className='flex justify-end gap-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => onEdit(task)}
                        disabled={isDeleting}
                      >
                        Edit
                      </Button>

                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => handleDelete(task)}
                        disabled={isDeleting}
                      >
                        {isDeleting && <Spinner />}
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TaskView setViewingTask={setViewingTask} viewingTask={viewingTask} />
    </div>
  );
}
