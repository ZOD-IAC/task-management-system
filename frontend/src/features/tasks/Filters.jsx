import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export default function Filters({ filters, setFilters }) {
  const clear = () =>
    setFilters({ search: '', status: '', priority: '', page: 1 });
  return (
    <div className='rounded-xl border bg-card p-4'>
      <div className='grid gap-3 md:grid-cols-[1fr_180px_180px_auto] md:items-end'>
        <div>
          <label
            htmlFor='task-search'
            className='mb-2 block text-sm font-medium'
          >
            Search
          </label>
          <Input
            id='task-search'
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder='Search by title...'
          />
        </div>
        <div>
          <label
            htmlFor='task-status'
            className='mb-2 block text-sm font-medium'
          >
            Status
          </label>
          <Select
            id='task-status'
            value={filters.status}
            onChange={(e) => setFilters({ status: e.target.value })}
          >
            <option value=''>All statuses</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </Select>
        </div>
        <div>
          <label
            htmlFor='task-priority'
            className='mb-2 block text-sm font-medium'
          >
            Priority
          </label>
          <Select
            id='task-priority'
            value={filters.priority}
            onChange={(e) => setFilters({ priority: e.target.value })}
          >
            <option value=''>All priorities</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </Select>
        </div>
        <Button variant='outline' onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}
