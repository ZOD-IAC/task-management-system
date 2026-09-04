import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { statusClass, priorityClass } from '../../lib/constants';
import { formatDate } from '../../lib/utils';

function TaskView({ setViewingTask, viewingTask }) {
  return (
    <Dialog
      open={!!viewingTask}
      onOpenChange={(open) => {
        if (!open) setViewingTask(null);
      }}
      title={viewingTask?.title}
      description='Task details'
    >
      {viewingTask && (
        <div className='space-y-5'>
          <div className='flex flex-wrap gap-3'>
            <Badge
              className={statusClass[viewingTask.status] || statusClass.Pending}
            >
              {viewingTask.status || 'Pending'}
            </Badge>

            <Badge
              variant='outline'
              className={priorityClass[viewingTask.priority] || ''}
            >
              {viewingTask.priority || 'Medium'} priority
            </Badge>

            {viewingTask.dueDate && (
              <span className='text-sm text-muted-foreground'>
                Due {formatDate(viewingTask.dueDate)}
              </span>
            )}
          </div>

          <div>
            <h4 className='mb-2 text-sm font-semibold'>Description</h4>

            <div className='max-h-[400px] overflow-y-auto rounded-lg border bg-muted/30 p-4'>
              <p className='whitespace-pre-wrap break-words text-sm leading-6'>
                {viewingTask.description || 'No description.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export default TaskView;
