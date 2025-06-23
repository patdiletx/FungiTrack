'use client';

import Link from "next/link";
import { FungiTrackLogo } from "@/components/FungiTrackLogo";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { CartSheet } from "./CartSheet";
import { useState } from "react";

export function StoreHeader() {
    const { state } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/tienda">
                    <FungiTrackLogo />
                </Link>
                <nav>
                    <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(true)}>
                        <ShoppingCart className="h-6 w-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                {itemCount}
                            </span>
                        )}
                        <span className="sr-only">Ver carrito</span>
                    </Button>
                </nav>
            </div>
            <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
        </header>
    );
}
