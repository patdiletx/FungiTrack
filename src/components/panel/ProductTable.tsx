'use client';

import { Producto } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";

interface ProductTableProps {
    productos: Producto[];
    onEdit: (producto: Producto) => void;
}

export function ProductTable({ productos, onEdit }: ProductTableProps) {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="text-right">Peso (gr)</TableHead>
                        <TableHead className="text-right">Precio (CLP)</TableHead>
                        <TableHead className="text-right">Costo (CLP)</TableHead>
                        <TableHead className="text-right">Tasa Inóculo</TableHead>
                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {productos.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No se encontraron productos. Crea uno para empezar.
                            </TableCell>
                        </TableRow>
                    )}
                    {productos.map((producto) => (
                        <TableRow key={producto.id}>
                            <TableCell className="font-medium">{producto.nombre}</TableCell>
                            <TableCell className="text-right">{producto.peso_gr}</TableCell>
                            <TableCell className="text-right">${producto.precio_clp.toLocaleString('es-CL')}</TableCell>
                            <TableCell className="text-right">${producto.costo_variable_clp.toLocaleString('es-CL')}</TableCell>
                            <TableCell className="text-right">{producto.spawn_rate_porcentaje ?? 0}%</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onEdit(producto)}>
                                            Editar
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
