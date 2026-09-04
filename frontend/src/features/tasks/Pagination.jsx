import { Button } from '@/components/ui/Button';

export default function Pagination({ pagination, filters, setFilters }) {
  const { page, totalPages, total, limit } = pagination;
  if (!totalPages || totalPages <= 1)
    return (
      <div className='text-sm text-muted-foreground'>
        {total} task{total === 1 ? '' : 's'}
      </div>
    );
  return (
    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
      <p className='text-sm text-muted-foreground'>
        Page {page} of {totalPages} · {total} tasks
      </p>
      <div className='flex items-center gap-2'>
        <Button
          size='sm'
          variant='outline'
          disabled={page <= 1}
          onClick={() => setFilters({ page: page - 1 })}
        >
          Previous
        </Button>
        <span className='min-w-16 text-center text-sm'>
          {page} / {totalPages}
        </span>
        <Button
          size='sm'
          variant='outline'
          disabled={page >= totalPages}
          onClick={() => setFilters({ page: page + 1 })}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
