import { getFormulaciones } from "@/lib/mock-db";
import { FormulacionesClient } from "@/components/panel/FormulacionesClient";

export default async function FormulacionesPage() {
  const formulaciones = await getFormulaciones();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-foreground">
          Gestión de Formulaciones
        </h1>
        <p className="mt-1 text-muted-foreground font-body">
          Crea, edita y gestiona tus recetas de sustrato base.
        </p>
      </div>
      <FormulacionesClient formulaciones={formulaciones} />
    </div>
  );
}
