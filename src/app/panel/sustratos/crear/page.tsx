import { getFormulaciones } from "@/lib/data";
import { SustratoForm } from "@/components/panel/SustratoForm";

export default async function CreateSustratoPage() {
  const formulaciones = await getFormulaciones();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-foreground">
          Crear Nuevo Lote de Sustrato
        </h1>
        <p className="mt-1 text-muted-foreground font-body">
          Define la receta y el peso total para un nuevo lote maestro de sustrato.
        </p>
      </div>
      <div className="max-w-2xl">
        <SustratoForm formulaciones={formulaciones} />
      </div>
    </div>
  );
}
