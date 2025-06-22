import { getProductos } from "@/lib/data";
import { ProductClient } from "@/components/panel/ProductClient";

export default async function ProductosPage() {
  const productos = await getProductos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-foreground">
          Gestión de Productos
        </h1>
        <p className="mt-1 text-muted-foreground font-body">
          Crea, edita y gestiona los productos que FungiTrack puede trazar.
        </p>
      </div>
      <ProductClient productos={productos} />
    </div>
  );
}
