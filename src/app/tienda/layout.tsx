import { CartProvider } from "@/context/CartProvider";
import { StoreHeader } from "@/components/tienda/StoreHeader";
import { StoreFooter } from "@/components/tienda/StoreFooter";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
        <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
            <StoreHeader />
            <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
                {children}
            </main>
            <StoreFooter />
        </div>
    </CartProvider>
  );
}
