import { FungiTrackLogo } from "../FungiTrackLogo";
import Link from "next/link";

export function StoreFooter() {
    const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
            <title>Facebook</title>
            <path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29h-3.128V11.45H9.7v-2.327c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.504 0-1.795.715-1.795 1.763v2.09h3.587l-.467 3.26h-3.12V24h5.713c.735 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z"/>
        </svg>
    );

    const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
            <title>TikTok</title>
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91.02.08 0 .15.04.2.1.07.05.1.12.1.21v7.35c-.01.04-.02.08-.04.11-.02.03-.05.06-.09.07-.07.02-.15.01-.22-.02-1.02-.33-2.05-.62-3.08-.94-.02-.01-.04-.01-.06 0-.08.03-.16.04-.24.05-.78.13-1.56.25-2.34.38-.08.01-.16.02-.24.03-.04 0-.09 0-.13-.01-.01 0-.02-.01-.03-.01-.1-.02-.19-.05-.28-.09-.3-.13-.59-.28-.88-.44-.11-.06-.2-.14-.29-.23-.02-.02-.03-.04-.04-.06-.01-.02-.01-.04-.02-.06-.01-.04-.01-.07-.01-.11v-2.3c0-.1.08-.18.18-.18.23.01.46.02.69.02.02 0 .04 0 .06.01.2.02.4.04.59.07.21.03.42.06.63.09.24.04.48.08.72.12.13.02.26.05.39.07.07.01.14.02.21.03.09.01.18.02.27.03.11.01.22.02.33.03.02 0 .04.01.06.01.13.01.26.01.39.01.13 0 .26-.01.39-.02.02 0 .04 0 .06-.01.11-.02.22-.04.33-.06.13-.03.26-.06.39-.09.29-.07.57-.14.86-.21.09-.02.18-.04.27-.07.03-.01.07-.02.1-.03.08-.03.17-.05.25-.08.07-.03.15-.05.22-.08.01-.01.02-.01.03-.02.01-.01.02-.01.02-.02.1-.05.2-.1.29-.16.02-.01.03-.03.04-.04.02-.02.03-.04.04-.06.01-.02.02-.04.02-.06.01-.04.01-.08.01-.12V.23c0-.11-.08-.19-.19-.2-.02 0-.03-.01-.05-.01z"/>
        </svg>
    );

    return (
        <footer className="bg-muted border-t mt-16">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        <FungiTrackLogo />
                        <p className="text-sm text-muted-foreground pr-4">
                            Cultivo inteligente para todos. Uniendo naturaleza y tecnología para cosechas perfectas.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
                        <div>
                            <h4 className="font-bold font-headline mb-2">Comprar</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/tienda" className="text-muted-foreground hover:text-primary">Kits de Cultivo</Link></li>
                                <li><Link href="/tienda/mis-cultivos" className="text-muted-foreground hover:text-primary">Mis Cultivos</Link></li>
                                <li><Link href="#" className="text-muted-foreground hover:text-primary opacity-50 cursor-not-allowed">Accesorios</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold font-headline mb-2">FungiGrow</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/tienda/myco-mind" className="text-muted-foreground hover:text-primary">Sobre Myco-Mind</Link></li>
                                <li><Link href="/tienda/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold font-headline mb-2">Soporte</h4>
                            <ul className="space-y-2 text-sm">
                                <li><Link href="/tienda/faq" className="text-muted-foreground hover:text-primary">Preguntas Frecuentes</Link></li>
                                <li><Link href="/tienda/shipping" className="text-muted-foreground hover:text-primary">Envíos y Devoluciones</Link></li>
                                <li><Link href="/tienda/privacy" className="text-muted-foreground hover:text-primary">Política de Privacidad</Link></li>
                                <li><Link href="/tienda/terms" className="text-muted-foreground hover:text-primary">Términos y Condiciones</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold font-headline mb-2">Contacto</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="mailto:hola@fungigrow.cl" className="text-muted-foreground hover:text-primary break-all">hola@fungigrow.cl</a></li>
                                <li><a href="tel:+56928207086" className="text-muted-foreground hover:text-primary">+56 9 2820 7086</a></li>
                                <li className="text-muted-foreground">Villarrica, Región de la Araucanía, Chile</li>
                            </ul>
                        </div>
                    </div>
                </div>
                 <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} FungiGrow. Todos los derechos reservados.</p>
                    <div className="flex items-center gap-4">
                        <a href="https://facebook.com/fungigrow" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <FacebookIcon className="h-5 w-5" />
                            <span className="sr-only">Facebook</span>
                        </a>
                        <a href="https://tiktok.com/@fungigrow" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                            <TikTokIcon className="h-5 w-5" />
                            <span className="sr-only">TikTok</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
