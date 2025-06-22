import { getLotesSustrato, getProductos } from "@/lib/data";
import { BatchForm } from "@/components/panel/BatchForm";

export default async function CreateBatchPage() {
  const [productos, lotesSustrato] = await Promise.all([
    getProductos(),
    getLotesSustrato(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-foreground">
          Crear Nuevo Lote de Producción
        </h1>
        <p className="mt-1 text-muted-foreground font-body">
          Registra un nuevo batch de productos para iniciar su trazabilidad, asociándolo a un lote de sustrato.
        </p>
      </div>
      <div className="max-w-2xl">
        <BatchForm productos={productos} lotesSustrato={lotesSustrato} />
      </div>
    </div>
  );
}
