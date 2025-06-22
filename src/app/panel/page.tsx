import { getLotes } from "@/lib/mock-db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchTable } from "@/components/panel/BatchTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { BatchStatusChart } from "@/components/panel/BatchStatusChart";

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

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline">Lotes Recientes</CardTitle>
                <CardDescription className="font-body">Haz clic en un lote para ver sus detalles.</CardDescription>
                </CardHeader>
                <CardContent>
                <BatchTable lotes={lotes} />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <BatchStatusChart lotes={lotes} />
        </div>
      </div>
    </div>
  );
}
