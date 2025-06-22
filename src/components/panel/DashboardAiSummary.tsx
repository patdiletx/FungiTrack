'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Sparkles, Lightbulb, Bot, ArrowRight, Loader2 } from 'lucide-react';
import type { BatchSummaryOutput } from '@/ai/flows/batch-summary-flow';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { dismissLoteAlertAction } from '@/lib/actions';

interface DashboardAiSummaryProps {
  summary: BatchSummaryOutput | null;
}

export function DashboardAiSummary({ summary }: DashboardAiSummaryProps) {
  const router = useRouter();
  const [isDismissing, setIsDismissing] = useState<string | null>(null);

  if (!summary) {
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

  const navigateToLote = async (loteId: string, reason: string) => {
    const alertKey = `${loteId}-${reason}`;
    setIsDismissing(alertKey);
    try {
      await dismissLoteAlertAction(loteId, reason);
      router.push(`/panel/lote/${loteId}`);
    } catch (error) {
        console.error("Failed to dismiss alert:", error);
        setIsDismissing(null);
    }
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
        <p className="text-muted-foreground">{summary.overallSummary}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary.attentionRequired && summary.attentionRequired.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Requiere Atención
            </h3>
            <div className="space-y-2">
              {summary.attentionRequired.map((item) => (
                <Alert key={item.loteId + item.reason} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <AlertTitle>{item.productName}</AlertTitle>
                      <AlertDescription>{item.reason}</AlertDescription>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigateToLote(item.loteId, item.reason)}
                        disabled={isDismissing === `${item.loteId}-${item.reason}`}
                    >
                        {isDismissing === `${item.loteId}-${item.reason}` ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>Ver Lote <ArrowRight className="ml-2 h-4 w-4" /></>
                        )}
                    </Button>
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {summary.positiveHighlights && summary.positiveHighlights.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-lg flex items-center gap-2 text-chart-2">
                <Sparkles className="h-5 w-5" />
                Hitos Positivos
            </h3>
            <div className="space-y-2">
                {summary.positiveHighlights.map((item) => (
                    <Alert key={item.loteId + item.reason} variant="success">
                        <Sparkles className="h-4 w-4" />
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <AlertTitle>{item.productName}</AlertTitle>
                                <AlertDescription>{item.reason}</AlertDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleHighlightClick(item.loteId)}>
                                Ver Lote <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </Alert>
                ))}
            </div>
          </div>
        )}

        {summary.generalSuggestions && summary.generalSuggestions.length > 0 && (
          <div>
            <h3 className="mb-2 font-semibold text-lg flex items-center gap-2 text-primary">
                <Lightbulb className="h-5 w-5" />
                Sugerencias Generales
            </h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-2">
              {summary.generalSuggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
