import { cn } from '@/lib/utils';
export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring',
        className,
      )}
      {...props}
    />
  );
}
