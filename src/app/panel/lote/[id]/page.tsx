import { getLoteById, getProductos } from "@/lib/mock-db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, Calendar, Hash, Package, FlaskConical, AlertTriangle, User, StickyNote } from "lucide-react";
import { BatchForm } from "@/components/panel/BatchForm";
import Link from 'next/link';
import { BatchAssistant } from "@/components/panel/BatchAssistant";
import { ContaminationChecker } from "@/components/panel/ContaminationChecker";
import { DeleteBatchButton } from "@/components/panel/DeleteBatchButton";
import { ClientFormattedDate } from "@/components/ClientFormattedDate";

type Props = {
  params: { id: string };
};

export default async function LoteDetailPage({ params }: Props) {
  const lote = await getLoteById(params.id);
  const productos = await getProductos();

  if (!lote) {
    notFound();
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
        case 'En Incubación':
            return 'secondary';
        case 'Listo para Venta':
            return 'default';
        case 'Contaminado':
            return 'destructive';
        default:
            return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-foreground">
            Detalle del Lote
          </h1>
          <p className="mt-1 text-muted-foreground font-body truncate">
            ID: {lote.id}
          </p>
        </div>
        <Link href={`/print-preview/${lote.id}`} target="_blank" passHref>
          <Button>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Etiquetas
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Package/>Información Principal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 font-body">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Producto</span>
                <span className="font-semibold text-right">{lote.productos?.nombre}</span>
              </div>
              <Separator/>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Unidades Producidas</span>
                <span className="font-semibold text-right">{lote.unidades_producidas}</span>
              </div>
              <Separator/>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fecha Elaboración</span>
                <span className="font-semibold text-right flex items-center gap-2">
                  <Calendar className="h-4 w-4"/>
                  <ClientFormattedDate date={lote.created_at} formatString="d 'de' MMMM, yyyy 'a las' HH:mm" placeholderLength={32}/>
                </span>
              </div>
              <Separator/>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Estado Actual</span>
                <Badge variant={getStatusVariant(lote.estado)}>{lote.estado}</Badge>
              </div>
               <Separator/>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Operador</span>
                <span className="font-semibold text-right flex items-center gap-2">
                    <User className="h-4 w-4"/>
                    {lote.id_operador}
                </span>
              </div>
            </CardContent>
          </Card>

          {lote.notas_sustrato && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><FlaskConical />Notas de Sustrato</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-sm whitespace-pre-wrap">{lote.notas_sustrato}</p>
              </CardContent>
            </Card>
          )}

          {lote.incidencias && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-destructive"><AlertTriangle/>Incidencias Registradas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-body text-sm whitespace-pre-wrap">{lote.incidencias}</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-1 space-y-6">
          <BatchForm productos={productos} lote={lote} />
          <BatchAssistant lote={lote} />
          <ContaminationChecker />
          <DeleteBatchButton loteId={lote.id} />
        </div>
      </div>
    </div>
  );
}
