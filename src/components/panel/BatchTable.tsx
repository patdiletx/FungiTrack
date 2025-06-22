'use client';

import { Lote } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface BatchTableProps {
    lotes: Lote[];
}

export function BatchTable({ lotes }: BatchTableProps) {
    const router = useRouter();

    const handleRowClick = (id: string) => {
        router.push(`/panel/lote/${id}`);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'En Incubación':
                return 'secondary';
            case 'Listo para Venta':
                return 'default';
            default:
                return 'outline';
        }
    };
    
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha Creación</TableHead>
                    <TableHead className="text-right">Unidades</TableHead>
                    <TableHead>Estado</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {lotes.map((lote) => (
                    <TableRow key={lote.id} onClick={() => handleRowClick(lote.id)} className="cursor-pointer">
                        <TableCell>
                            <div className="font-medium">{lote.productos?.nombre || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground truncate">{lote.id}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            {format(new Date(lote.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                        </TableCell>
                        <TableCell className="text-right">{lote.unidades_producidas}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(lote.estado)}>{lote.estado}</Badge>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
