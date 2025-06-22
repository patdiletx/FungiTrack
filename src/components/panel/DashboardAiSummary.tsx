'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Sparkles, Lightbulb, Bot, ArrowRight, Loader2, Check } from 'lucide-react';
import type { BatchSummaryOutput } from '@/ai/flows/batch-summary-flow';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { dismissLoteAlertAction } from '@/lib/actions';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface DashboardAiSummaryProps {
  summary: BatchSummaryOutput | null;
}

export function DashboardAiSummary({ summary }: DashboardAiSummaryProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDismissing, setIsDismissing] = useState<string | null>(null);

  // Use state to manage the summary for optimistic updates
  const [currentSummary, setCurrentSummary] = useState(summary);

  // Keep state in sync with server-provided props
  useEffect(() => {
    setCurrentSummary(summary);
  }, [summary]);

  if (!currentSummary) {
    return (
       <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Bot /> Resumen del Asistente AI
                </CardTitle>
                 <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );
  }

  const handleDismiss = async (loteId: string, reason: string) => {
    const alertKey = `${loteId}-${reason}`;
    setIsDismissing(alertKey);
    try {
        await dismissLoteAlertAction(loteId, reason);
        toast({ title: "Alerta Descartada", description: "La alerta ha sido marcada como revisada."});
        router.refresh(); // This will refetch server data and update the component
    } catch (error) {
        console.error("Failed to dismiss alert:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo descartar la alerta.'});
        setIsDismissing(null);
    }
    // No need to set isDismissing to null in finally, as the component will re-render
  };
  
  const handleHighlightClick = (loteId: string) => {
    router.push(`/panel/lote/${loteId}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Bot /> Resumen del Asistente AI
        </CardTitle>
        <p className="text-muted-foreground">{currentSummary.overallSummary}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentSummary.attentionRequired && currentSummary.attentionRequired.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Requiere Atención
            </h3>
            <div className="space-y-2">
              {currentSummary.attentionRequired.map((item) => (
                <Alert key={item.loteId + item.reason} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <AlertTitle>
                        <Link href={`/panel/lote/${item.loteId}`} className="hover:underline">
                          {item.productName}
                        </Link>
                      </AlertTitle>
                      <AlertDescription>{item.reason}</AlertDescription>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDismiss(item.loteId, item.reason)}
                        disabled={isDismissing === `${item.loteId}-${item.reason}`}
                    >
                        {isDismissing === `${item.loteId}-${item.reason}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <><Check className="mr-2 h-4 w-4" />Descartar</>
                        )}
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {currentSummary.positiveHighlights && currentSummary.positiveHighlights.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-lg flex items-center gap-2 text-chart-2">
                <Sparkles className="h-5 w-5" />
                Hitos Positivos
            </h3>
            <div className="space-y-2">
                {currentSummary.positiveHighlights.map((item) => (
                    <Alert key={item.loteId + item.reason} variant="success">
                        <Sparkles className="h-4 w-4" />
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <AlertTitle>
                                  <Link href={`/panel/lote/${item.loteId}`} className="hover:underline">
                                    {item.productName}
                                  </Link>
                                </AlertTitle>
                                <AlertDescription>{item.reason}</AlertDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleHighlightClick(item.loteId)}>
                                <ArrowRight className="h-4 w-4" />
                                <span className="sr-only">Ver Lote</span>
                            </Button>
                        </div>
                    </Alert>
                ))}
            </div>
          </div>
        )}

        {currentSummary.generalSuggestions && currentSummary.generalSuggestions.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-lg flex items-center gap-2 text-primary">
                <Lightbulb className="h-5 w-5" />
                Sugerencias Generales
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
              {currentSummary.generalSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
