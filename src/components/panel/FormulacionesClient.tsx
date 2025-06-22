'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Formulacion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormulacionForm } from "./FormulacionForm";
import { FormulacionesTable } from "./FormulacionesTable";

interface FormulacionesClientProps {
    formulaciones: Formulacion[];
}

export function FormulacionesClient({ formulaciones }: FormulacionesClientProps) {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFormulacion, setEditingFormulacion] = useState<Formulacion | null>(null);

    const handleCreate = () => {
        setEditingFormulacion(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (formulacion: Formulacion) => {
        setEditingFormulacion(formulacion);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setEditingFormulacion(null);
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
                    Crear Formulación
                </Button>
            </div>
            
            <FormulacionesTable formulaciones={formulaciones} onEdit={handleEdit} />

            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>{editingFormulacion ? "Editar Formulación" : "Crear Nueva Formulación"}</DialogTitle>
                        <DialogDescription>
                            {editingFormulacion ? "Actualiza los detalles de esta receta." : "Añade una nueva receta de sustrato a tu catálogo."}
                        </DialogDescription>
                    </DialogHeader>
                    <FormulacionForm 
                        formulacion={editingFormulacion}
                        onFinished={onFormSubmit}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
