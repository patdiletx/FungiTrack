'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { PanelSidebar } from '@/components/panel/PanelSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { FungiTrackLogo } from '@/components/FungiTrackLogo';
import { createClient } from '@/lib/supabase/client';

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Apply dark theme for the panel section
    document.documentElement.classList.add('dark');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // The middleware handles unauthenticated users, so we primarily listen for SIGNED_OUT here
      // to handle client-side logout properly.
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    // Since the middleware has already validated the user, we can stop the loading state.
    setIsLoading(false);

    // Cleanup function to remove the class when the component unmounts or path changes
    return () => {
      subscription?.unsubscribe();
      document.documentElement.classList.remove('dark');
    };
  }, [router, supabase.auth]);


  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="w-full max-w-md p-4 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <PanelSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          <SidebarTrigger />
          <FungiTrackLogo />
          <div className="w-7" />
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
