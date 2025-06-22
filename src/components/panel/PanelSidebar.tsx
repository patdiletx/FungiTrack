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
import { LogOut, LayoutDashboard, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function PanelSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    try {
      localStorage.removeItem('fungi-track-auth');
    } catch (error) {
        console.error("Could not access localStorage.");
    }
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
            <Link href="/panel" passHref>
              <SidebarMenuButton asChild isActive={pathname === '/panel'}>
                <LayoutDashboard />
                <span>Panel de Lotes</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/panel/lotes/crear" passHref>
              <SidebarMenuButton asChild isActive={pathname === '/panel/lotes/crear'}>
                <PlusCircle />
                <span>Crear Lote</span>
              </SidebarMenuButton>
            </Link>
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
