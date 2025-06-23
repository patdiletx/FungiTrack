import { CartProvider } from "@/context/CartProvider";
import { StoreHeader } from "@/components/tienda/StoreHeader";
import { FungiTrackLogo } from "@/components/FungiTrackLogo";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
        <div className="min-h-screen bg-background text-foreground font-body">
            <StoreHeader />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
            <footer className="mt-16 py-8 bg-card border-t">
                <div className="container mx-auto text-center text-muted-foreground">
                    <FungiTrackLogo className="justify-center mb-4"/>
                    <p>&copy; {new Date().getFullYear()} FungiGrow. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    </CartProvider>
  );
}
