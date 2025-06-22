import { getLoteSustratoById, getLotesBySustratoId } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, FlaskConical, User, Beaker, PlusCircle, Package } from "lucide-react";
import Link from 'next/link';
import { ClientFormattedDate } from "@/components/ClientFormattedDate";
import { BatchTable } from "@/components/panel/BatchTable";


type Props = {
  params: { id: string };
};

export default async function LoteSustratoDetailPage({ params }: Props) {
  const [loteSustrato, lotesDeProduccion] = await Promise.all([
    getLoteSustratoById(params.id),
    getLotesBySustratoId(params.id),
  ]);

  if (!loteSustrato) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-foreground">
            Detalle del Lote de Sustrato
          </h1>
          <p className="mt-1 text-muted-foreground font-body truncate">
            ID: {loteSustrato.id}
          </p>
        </div>
        <Link href={`/panel/lotes/crear?sustratoId=${loteSustrato.id}`} passHref>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crear Lote de Producción
            </Button>
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Beaker/>Información del Sustrato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 font-body">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Formulación Usada</span>
                    <span className="font-semibold text-right">{loteSustrato.formulaciones?.nombre}</span>
                </div>
                <Separator/>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Peso Total</span>
                    <span className="font-semibold text-right">{loteSustrato.peso_total_kg} kg</span>
                </div>
                <Separator/>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fecha Elaboración</span>
                    <span className="font-semibold text-right flex items-center gap-2">
                    <Calendar className="h-4 w-4"/>
                    <ClientFormattedDate date={loteSustrato.created_at} formatString="d 'de' MMMM, yyyy 'a las' HH:mm" placeholderLength={32}/>
                    </span>
                </div>
                <Separator/>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Operador</span>
                    <span className="font-semibold text-right flex items-center gap-2">
                        <User className="h-4 w-4"/>
                        {loteSustrato.id_operador}
                    </span>
                </div>
                </CardContent>
            </Card>

            {loteSustrato.notas_sustrato && (
                <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><FlaskConical />Notas de la Formulación</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-body text-sm whitespace-pre-wrap">{loteSustrato.notas_sustrato}</p>
                </CardContent>
                </Card>
            )}

             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Package/>Lotes de Producción</CardTitle>
                    <CardDescription>Lotes de productos finales generados a partir de este sustrato.</CardDescription>
                </CardHeader>
                <CardContent>
                    <BatchTable lotes={lotesDeProduccion} />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
