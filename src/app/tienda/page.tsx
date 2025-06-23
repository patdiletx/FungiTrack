import { getAvailableProductsForStore } from "@/lib/data";
import { ProductCard } from "@/components/tienda/ProductCard";
import { HowItWorks } from "@/components/tienda/HowItWorks";
import { MycoMindCta } from "@/components/tienda/MycoMindCta";
import { Testimonials } from "@/components/tienda/Testimonials";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function TiendaPage() {
    const products = await getAvailableProductsForStore();
    
    return (
        <div className="space-y-16">
            <section className="text-center py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <h1 className="font-headline text-4xl md:text-6xl font-black tracking-tight">
                        Cultiva tus Propios Hongos. <br />
                        <span className="text-primary">Con un Asistente de IA.</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Bienvenido a FungiGrow, donde unimos la naturaleza con la tecnología. Nuestros kits de cultivo inteligentes hacen que cualquiera pueda convertirse en un experto micólogo.
                    </p>
                    <div className="mt-8 flex gap-4 justify-center">
                         <Button asChild size="lg">
                            <Link href="#productos">
                                Explorar Kits
                                <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                         <Button asChild size="lg" variant="outline">
                            <Link href="#myco-mind">Descubre Myco-Mind</Link>
                        </Button>
                    </div>
                </div>
            </section>
            
            <section id="productos" className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="font-headline text-3xl md:text-4xl font-bold">Nuestros Kits de Cultivo</h2>
                    <p className="text-muted-foreground mt-2">Elige tu variedad y empieza tu aventura micológica.</p>
                </div>
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No hay productos disponibles en este momento. ¡Vuelve pronto!</p>
                    </div>
                )}
            </section>

            <HowItWorks />
            <MycoMindCta />
            <Testimonials />
        </div>
    );
}
