import { getAvailableProductsForStore } from "@/lib/data";
import { ProductCard } from "@/components/tienda/ProductCard";
import { HowItWorks } from "@/components/tienda/HowItWorks";
import { MycoMindCta } from "@/components/tienda/MycoMindCta";
import { Testimonials } from "@/components/tienda/Testimonials";
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default async function TiendaPage() {
    const products = await getAvailableProductsForStore();

    return (
        <div className="space-y-16 md:space-y-24">
            <section className="text-center pt-8 md:pt-16">
                <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight text-foreground">
                    Cultiva tus Propios Hongos<br/> con un Asistente <span className="text-primary">Inteligente</span>.
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                    Nuestros kits de cultivo vienen con Myco-Mind, una IA que te guía en cada paso para asegurar una cosecha abundante y exitosa.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button asChild size="lg">
                        <Link href="#productos">Explorar Kits</Link>
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="#myco-mind">Descubre Myco-Mind</Link>
                    </Button>
                </div>
            </section>
            
            <section id="productos">
                 <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Nuestros Kits de Cultivo</h2>
                    <p className="text-muted-foreground mt-2">Elige tu variedad y empieza tu aventura micológica hoy.</p>
                </div>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <h2 className="text-2xl font-bold">¡Vaya! Parece que estamos agotados.</h2>
                        <p className="text-muted-foreground mt-2">Nuestros micelios están trabajando duro. Vuelve pronto para ver nuevos kits.</p>
                    </div>
                )}
            </section>
            
            <MycoMindCta />

            <HowItWorks />
            
            <Testimonials />

        </div>
    );
}
