import { FungiTrackLogo } from "../FungiTrackLogo";
import Link from "next/link";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function StoreFooter() {
    return (
        <footer className="bg-muted border-t mt-16">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 space-y-4">
                        <FungiTrackLogo />
                        <p className="text-sm text-muted-foreground">
                            Cultivo inteligente para todos. Uniendo naturaleza y tecnología para cosechas perfectas.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
                        <div>
                            <h4 className="font-bold font-headline mb-2">Comprar</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/tienda" className="text-muted-foreground hover:text-primary">Kits de Cultivo</Link></li>
                                <li><Link href="/tienda/mis-cultivos" className="text-muted-foreground hover:text-primary">Mis Cultivos</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary">Accesorios</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold font-headline mb-2">FungiGrow</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/tienda/myco-mind" className="text-muted-foreground hover:text-primary">Sobre Myco-Mind</Link></li>
                                <li><Link href="/tienda/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contacto</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold font-headline mb-2">Soporte</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/tienda/faq" className="text-muted-foreground hover:text-primary">Preguntas Frecuentes</Link></li>
                                <li><Link href="/tienda/shipping" className="text-muted-foreground hover:text-primary">Envíos y Devoluciones</Link></li>
                                <li><Link href="/tienda/privacy" className="text-muted-foreground hover:text-primary">Política de Privacidad</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FungiGrow. Todos los derechos reservados.</p>
                    {/* Social Media Icons would go here */}
                </div>
            </div>
        </footer>
    );
}
