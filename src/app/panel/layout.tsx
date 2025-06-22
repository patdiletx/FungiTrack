'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { PanelSidebar } from '@/components/panel/PanelSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabaseClient';

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const checkSession = async () => {
      if (!supabase) {
        console.error("Supabase client not initialized. Redirecting to login.");
        router.replace('/');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
      } else {
        setIsAuth(true);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuth(false);
        router.replace('/');
      } else {
        setIsAuth(true)
      }
    }) ?? { data: { subscription: null } };

    return () => {
      subscription?.unsubscribe();
    };

  }, [router]);


  if (isAuth === undefined) {
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

  if (!isAuth) {
    return null;
  }

  return (
    <SidebarProvider>
      <PanelSidebar />
      <SidebarInset>
        <div className="p-4 sm:p-6 lg:p-8">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
