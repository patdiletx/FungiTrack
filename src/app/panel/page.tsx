import { getLotes } from "@/lib/mock-db";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { DashboardClient } from "@/components/panel/DashboardClient";

export default async function PanelDashboard() {
  const lotes = await getLotes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-foreground">
            Panel de Lotes
          </h1>
          <p className="mt-1 text-muted-foreground font-body">
            Gestiona y monitorea todos los lotes de producción.
          </p>
        </div>
        <Link href="/panel/lotes/crear" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Nuevo Lote
          </Button>
        </Link>
      </div>

      <DashboardClient lotes={lotes} />
    </div>
  );
}
