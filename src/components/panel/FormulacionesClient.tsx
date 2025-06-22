'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Formulacion } from "@/lib/types";
import { createFormulacion, updateFormulacion } from '@/lib/mock-db';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from '@/components/ui/form';
import { FormulacionForm, formulacionFormSchema } from "./FormulacionForm";
import { FormulacionesTable } from "./FormulacionesTable";

interface FormulacionesClientProps {
    formulaciones: Formulacion[];
}

export function FormulacionesClient({ formulaciones }: FormulacionesClientProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFormulacion, setEditingFormulacion] = useState<Formulacion | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const isUpdateMode = !!editingFormulacion;

    const form = useForm<z.infer<typeof formulacionFormSchema>>({
        resolver: zodResolver(formulacionFormSchema),
        defaultValues: {
            nombre: '',
            descripcion: '',
            puntuacion: 5,
            ingredientes: [{ nombre: 'Viruta de madera', porcentaje: 80 }, { nombre: 'Salvado de trigo', porcentaje: 20 }],
            humedad_objetivo_porcentaje: 65,
            notas: '',
        }
    });

    const { formState: { isSubmitting }, reset } = form;

    useEffect(() => {
        if (isDialogOpen) {
            if (editingFormulacion) {
                reset({
                    nombre: editingFormulacion.nombre || '',
                    descripcion: editingFormulacion.descripcion || '',
                    puntuacion: editingFormulacion.puntuacion || 5,
                    ingredientes: editingFormulacion.ingredientes || [{ nombre: 'Viruta de madera', porcentaje: 80 }, { nombre: 'Salvado de trigo', porcentaje: 20 }],
                    humedad_objetivo_porcentaje: editingFormulacion.humedad_objetivo_porcentaje ?? 65,
                    notas: editingFormulacion.notas || '',
                });
            } else {
                reset({
                    nombre: '',
                    descripcion: '',
                    puntuacion: 5,
                    ingredientes: [{ nombre: 'Viruta de madera', porcentaje: 80 }, { nombre: 'Salvado de trigo', porcentaje: 20 }],
                    humedad_objetivo_porcentaje: 65,
                    notas: '',
                });
            }
        }
    }, [isDialogOpen, editingFormulacion, reset]);

    const handleCreate = () => {
        setEditingFormulacion(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (formulacion: Formulacion) => {
        setEditingFormulacion(formulacion);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingFormulacion(null);
        }
        setIsDialogOpen(open);
    };

    async function onSubmit(values: z.infer<typeof formulacionFormSchema>) {
        try {
          if (isUpdateMode && editingFormulacion) {
            await updateFormulacion(editingFormulacion.id, values);
            toast({
              title: 'Formulación Actualizada',
              description: `La formulación "${values.nombre}" ha sido actualizada.`,
            });
          } else {
            await createFormulacion(values);
            toast({
              title: 'Formulación Creada',
              description: `La formulación "${values.nombre}" ha sido creada exitosamente.`,
            });
          }
          router.refresh();
          handleDialogClose(false);
        } catch (error) {
          toast({
            title: 'Error al guardar la formulación',
            description: 'Hubo un problema al guardar los datos. Inténtalo de nuevo.',
            variant: 'destructive',
          });
        }
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
                <DialogContent className="sm:max-w-[625px] flex flex-col max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{editingFormulacion ? "Editar Formulación" : "Crear Nueva Formulación"}</DialogTitle>
                        <DialogDescription>
                            {editingFormulacion ? "Actualiza los detalles de esta receta." : "Añade una nueva receta de sustrato a tu catálogo."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-grow overflow-y-auto -mx-6 px-6">
                        <Form {...form}>
                            <form id="formulacion-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormulacionForm form={form} />
                            </form>
                        </Form>
                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <Button type="submit" form="formulacion-form" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isUpdateMode ? "Guardar Cambios" : "Crear Formulación"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}