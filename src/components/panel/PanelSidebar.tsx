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
import { LogOut, LayoutDashboard, PlusCircle, Box, QrCode, FlaskConical, Beaker } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function PanelSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
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
            <SidebarMenuButton asChild isActive={pathname === '/panel'}>
                <Link href="/panel">
                    <LayoutDashboard />
                    <span>Panel de Producción</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/panel/sustratos')}>
                <Link href="/panel/sustratos">
                    <Beaker />
                    <span>Lotes de Sustrato</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/panel/lotes/crear')}>
                <Link href="/panel/lotes/crear">
                    <PlusCircle />
                    <span>Crear Lote Producción</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith('/panel/scan')}>
              <Link href="/panel/scan">
                <QrCode />
                <span>Escanear QR</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarGroup>
            <SidebarGroupLabel>Configuración</SidebarGroupLabel>
            <SidebarGroupContent>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/panel/productos')}>
                      <Link href="/panel/productos">
                        <Box />
                        <span>Productos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/panel/formulaciones')}>
                      <Link href="/panel/formulaciones">
                        <FlaskConical />
                        <span>Formulaciones</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
            </SidebarGroupContent>
          </SidebarGroup>
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
