'use client';

import Link from "next/link";
import { FungiTrackLogo } from "@/components/FungiTrackLogo";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu } from "lucide-react";
import { useCart } from "@/context/CartProvider";
import { CartSheet } from "./CartSheet";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";

const navLinks = [
    { href: "/tienda", label: "Tienda" },
    { href: "/tienda/mis-cultivos", label: "Mis Cultivos" },
    { href: "/tienda/myco-mind", label: "Myco-Mind" },
    { href: "/tienda/blog", label: "Blog" },
    { href: "/tienda/faq", label: "Preguntas Frecuentes" },
];

export function StoreHeader() {
    const { state } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
                <Link href="/tienda" className="flex-shrink-0">
                    <FungiTrackLogo />
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map(link => (
                        <Link key={link.label} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <div className="flex-1 flex justify-end items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(true)} className="relative">
                        <ShoppingCart className="h-6 w-6" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                {itemCount}
                            </span>
                        )}
                        <span className="sr-only">Ver carrito</span>
                    </Button>
                     <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-6 w-6"/>
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Menú de navegación</SheetTitle>
                                <SheetDescription>
                                    Enlaces principales para navegar por la tienda FungiGrow.
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-8">
                                 {navLinks.map(link => (
                                    <Link key={link.label} href={link.href} onClick={() => setIsMenuOpen(false)} className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
            <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen} />
        </header>
    );
}
