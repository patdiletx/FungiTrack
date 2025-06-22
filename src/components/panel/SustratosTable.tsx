'use client';

import { LoteSustrato } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ClientFormattedDate } from "../ClientFormattedDate";
import { useRouter } from "next/navigation";

interface SustratosTableProps {
    lotesSustrato: LoteSustrato[];
}

export function SustratosTable({ lotesSustrato }: SustratosTableProps) {
    const router = useRouter();

    const handleRowClick = (id: string) => {
        router.push(`/panel/sustratos/${id}`);
    };

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Formulación</TableHead>
                        <TableHead className="hidden md:table-cell">Fecha Creación</TableHead>
                        <TableHead className="text-right">Peso Total (kg)</TableHead>
                        <TableHead>ID del Lote</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lotesSustrato.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No se encontraron lotes de sustrato. Crea uno para empezar.
                            </TableCell>
                        </TableRow>
                    )}
                    {lotesSustrato.map((lote) => (
                        <TableRow key={lote.id} onClick={() => handleRowClick(lote.id)} className="cursor-pointer">
                            <TableCell className="font-medium">
                                {lote.formulaciones?.nombre || 'N/A'}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                                <ClientFormattedDate date={lote.created_at} formatString="d 'de' MMMM, yyyy" placeholderLength={20} />
                            </TableCell>
                            <TableCell className="text-right">{lote.peso_total_kg} kg</TableCell>
                            <TableCell>
                                <div className="font-mono text-xs text-muted-foreground">{lote.id}</div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
    );
}
