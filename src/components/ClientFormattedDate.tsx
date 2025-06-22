'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface ClientFormattedDateProps {
  date: string | Date;
  formatString: string;
  className?: string;
  placeholderLength?: number;
}

export function ClientFormattedDate({
  date,
  formatString,
  className,
  placeholderLength = 20,
}: ClientFormattedDateProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render a skeleton on the server and during initial client render to avoid hydration mismatch.
    // The placeholder length can be adjusted to approximate the final date string length.
    return (
      <Skeleton
        className={cn('h-5', className)}
        style={{ width: `${placeholderLength}ch`, display: 'inline-block' }}
      />
    );
  }

  return (
    <span className={className}>
      {format(new Date(date), formatString, { locale: es })}
    </span>
  );
}
