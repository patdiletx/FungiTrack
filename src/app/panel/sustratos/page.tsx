import { getLotesSustrato } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { SustratosTable } from "@/components/panel/SustratosTable";

export default async function SustratosPage() {
  const lotesSustrato = await getLotesSustrato();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-foreground">
            Lotes de Sustrato
          </h1>
          <p className="mt-1 text-muted-foreground font-body">
            Gestiona los lotes maestros de sustrato que alimentan tu producción.
          </p>
        </div>
        <Link href="/panel/sustratos/crear" passHref>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Lote de Sustrato
          </Button>
        </Link>
      </div>

      <SustratosTable lotesSustrato={lotesSustrato} />
    </div>
  );
}
