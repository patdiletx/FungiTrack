import { Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

type FungiTrackLogoProps = {
  className?: string;
};

export function FungiTrackLogo({ className }: FungiTrackLogoProps) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
      <Sprout className="h-7 w-7" />
      <span className="font-headline text-2xl font-bold tracking-wide">
        FungiTrack
      </span>
    </div>
  );
}
