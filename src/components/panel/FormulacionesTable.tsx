'use client';

import { Formulacion } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Badge } from "../ui/badge";

interface FormulacionesTableProps {
    formulaciones: Formulacion[];
    onEdit: (formulacion: Formulacion) => void;
}

export function FormulacionesTable({ formulaciones, onEdit }: FormulacionesTableProps) {
    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Ingredientes</TableHead>
                        <TableHead className="text-right">Puntuación</TableHead>
                        <TableHead><span className="sr-only">Acciones</span></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {formulaciones.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No se encontraron formulaciones. Crea una para empezar.
                            </TableCell>
                        </TableRow>
                    )}
                    {formulaciones.map((formulacion) => (
                        <TableRow key={formulacion.id}>
                            <TableCell className="font-medium">
                                <div>{formulacion.nombre}</div>
                                <div className="text-xs text-muted-foreground">{formulacion.descripcion}</div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                {formulacion.ingredientes.map(ing => (
                                    <Badge key={ing.nombre} variant="secondary">{ing.nombre} ({ing.porcentaje}%)</Badge>
                                ))}
                                </div>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1 font-semibold">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    {formulacion.puntuacion}/10
                                </div>
                            </TableCell>
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
                                        <DropdownMenuItem onClick={() => onEdit(formulacion)}>
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
