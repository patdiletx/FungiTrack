'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Producto } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { ProductTable } from "./ProductTable";

interface ProductClientProps {
    productos: Producto[];
}

export function ProductClient({ productos }: ProductClientProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

    const handleCreate = () => {
        setEditingProduct(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (producto: Producto) => {
        setEditingProduct(producto);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingProduct(null);
    };

    const onFormSubmit = () => {
        handleDialogClose();
        router.refresh();
    }

    return (
        <div className="space-y-4">
            <div className="text-right">
                <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Producto
                </Button>
            </div>
            
            <ProductTable productos={productos} onEdit={handleEdit} />

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? "Editar Producto" : "Crear Nuevo Producto"}</DialogTitle>
                        <DialogDescription>
                            {editingProduct ? "Actualiza los detalles de este producto." : "Añade un nuevo producto a tu catálogo."}
                        </DialogDescription>
                    </DialogHeader>
                    <ProductForm 
                        producto={editingProduct}
                        onFinished={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
