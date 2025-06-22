'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup
} from '@/components/ui/sidebar';
import { FungiTrackLogo } from '@/components/FungiTrackLogo';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, PlusCircle, Box } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function PanelSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <FungiTrackLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/panel'}>
                <Link href="/panel">
                    <LayoutDashboard />
                    <span>Panel de Lotes</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/panel/lotes/crear'}>
                <Link href="/panel/lotes/crear">
                    <PlusCircle />
                    <span>Crear Lote</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/panel/productos')}>
              <Link href="/panel/productos">
                <Box />
                <span>Productos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
          <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span>Cerrar Sesión</span>
          </Button>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
