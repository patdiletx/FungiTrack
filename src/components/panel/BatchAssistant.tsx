'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { batchAssistant, BatchAssistantOutput } from '@/ai/flows/batch-assistant-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Bot } from 'lucide-react';
import { Lote } from '@/lib/types';

interface BatchAssistantProps {
  lote: Lote;
}

export function BatchAssistant({ lote }: BatchAssistantProps) {
  const [analysis, setAnalysis] = useState<BatchAssistantOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAnalysis() {
      setLoading(true);
      try {
        const result = await batchAssistant({
          productName: lote.productos?.nombre || 'Desconocido',
          status: lote.estado,
          substrateNotes: lote.lotes_sustrato?.notas_sustrato || undefined,
          incidents: lote.incidencias || undefined,
        });
        setAnalysis(result);
      } catch (error) {
        console.error('Error fetching batch analysis:', error);
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    }
    // Only run analysis if there's a lote
    if (lote) {
        getAnalysis();
    }
  }, [lote]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Bot /> Asistente AI</CardTitle>
          <CardDescription>Analizando datos del lote...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className='pt-4'>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-full mt-2" />
            </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null; // Don't render if there was an error or no analysis
  }

  return (
    <Card className="bg-accent/20 border-accent/30 animate-in fade-in-50">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-accent-foreground"><Bot /> Asistente AI</CardTitle>
        <CardDescription className="text-accent-foreground/80">Análisis y recomendaciones del lote.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 font-body">
        <div>
            <h4 className='font-semibold'>Resumen</h4>
            <p className="text-sm text-accent-foreground/90">{analysis.summary}</p>
        </div>

        {analysis.suggestions && analysis.suggestions.length > 0 && (
             <div>
                <h4 className='font-semibold'>Sugerencias</h4>
                <ul className="space-y-2 mt-2">
                    {analysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm">
                            <Lightbulb className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                            <span>{suggestion}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
