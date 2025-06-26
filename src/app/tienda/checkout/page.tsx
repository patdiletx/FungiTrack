'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// This page is deprecated in favor of the integrated cart/checkout page.
// It now just redirects to the cart.
export default function DeprecatedCheckoutPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/tienda/carrito');
    }, [router]);

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Redirigiendo al carrito...</p>
            </div>
        </div>
    );
}
