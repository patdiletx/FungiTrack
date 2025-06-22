'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Sparkles, Lightbulb, Bot, ArrowRight } from 'lucide-react';
import type { BatchSummaryOutput } from '@/ai/flows/batch-summary-flow';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

interface DashboardAiSummaryProps {
  summary: BatchSummaryOutput | null;
}

export function DashboardAiSummary({ summary }: DashboardAiSummaryProps) {
  const router = useRouter();

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

  const navigateToLote = (loteId: string) => {
    router.push(`/panel/lote/${loteId}`);
  };

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
                <Alert key={item.loteId} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <AlertTitle>{item.productName}</AlertTitle>
                      <AlertDescription>{item.reason}</AlertDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigateToLote(item.loteId)}>
                        Ver Lote <ArrowRight className="ml-2 h-4 w-4" />
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
                    <Alert key={item.loteId} variant="success">
                        <Sparkles className="h-4 w-4" />
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <AlertTitle>{item.productName}</AlertTitle>
                                <AlertDescription>{item.reason}</AlertDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigateToLote(item.loteId)}>
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
