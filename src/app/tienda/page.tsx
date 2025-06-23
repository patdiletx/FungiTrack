import { getAvailableProductsForStore } from "@/lib/data";
import { ProductCard } from "@/components/tienda/ProductCard";

export default async function TiendaPage() {
    const products = await getAvailableProductsForStore();

    return (
        <div className="space-y-8">
            <header className="text-center space-y-2">
                <h1 className="font-headline text-5xl md:text-7xl text-primary">Tienda FungiGrow</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Bienvenido a la tienda oficial de FungiGrow. Aquí encontrarás nuestros kits de cultivo inteligentes, cada uno con acceso a Myco-Mind, tu asistente de IA personal para una cosecha exitosa.
                </p>
            </header>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <h2 className="text-2xl font-bold">¡Vaya! Parece que estamos agotados.</h2>
                    <p className="text-muted-foreground mt-2">Nuestros micelios están trabajando duro. Vuelve pronto para ver nuevos kits.</p>
                </div>
            )}
        </div>
    );
}
