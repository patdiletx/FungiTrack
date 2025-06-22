'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Producto } from '@/lib/types';
import { createProducto, updateProducto } from '@/lib/mock-db';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';

const formSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  peso_gr: z.coerce.number().int().positive('El peso debe ser un número positivo.'),
  precio_clp: z.coerce.number().int().positive('El precio debe ser un número positivo.'),
  costo_variable_clp: z.coerce.number().int().positive('El costo debe ser un número positivo.'),
});

interface ProductFormProps {
  producto?: Producto | null;
  onFinished: () => void;
}

export function ProductForm({ producto, onFinished }: ProductFormProps) {
  const { toast } = useToast();
  const isUpdateMode = !!producto;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: producto?.nombre || '',
      peso_gr: producto?.peso_gr || 0,
      precio_clp: producto?.precio_clp || 0,
      costo_variable_clp: producto?.costo_variable_clp || 0,
    },
  });

  const { formState: { isSubmitting } } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isUpdateMode && producto) {
        await updateProducto(producto.id, values);
        toast({
          title: "Producto Actualizado",
          description: `El producto "${values.nombre}" ha sido actualizado.`,
        });
      } else {
        await createProducto(values);
        toast({
          title: "Producto Creado",
          description: `El producto "${values.nombre}" ha sido creado exitosamente.`,
        });
      }
      onFinished();
    } catch (error) {
      toast({
        title: "Error al guardar el producto",
        description: "Hubo un problema al guardar los datos. Inténtalo de nuevo.",
        variant: 'destructive',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Producto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Kit de Inicio - Ostra Rosada" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
            control={form.control}
            name="peso_gr"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Peso (gr)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="1500" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="precio_clp"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Precio Venta (CLP)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="10000" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="costo_variable_clp"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Costo Variable (CLP)</FormLabel>
                <FormControl>
                    <Input type="number" placeholder="3000" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
       
        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isUpdateMode ? "Guardar Cambios" : "Crear Producto"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
