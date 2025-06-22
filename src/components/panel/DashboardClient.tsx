'use client';

import { Lote } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchTable } from "@/components/panel/BatchTable";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import type { BatchSummaryOutput } from "@/ai/flows/batch-summary-flow";
import { DashboardAiSummary } from "./DashboardAiSummary";


const ChartSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
             <Skeleton className="h-40 w-40 rounded-full" />
        </CardContent>
    </Card>
);

const BatchStatusChart = dynamic(() => 
    import('@/components/panel/BatchStatusChart').then(mod => mod.BatchStatusChart), 
    { 
        ssr: false,
        loading: () => <ChartSkeleton />
    }
);

interface DashboardClientProps {
    lotes: Lote[];
    summary: BatchSummaryOutput | null;
}

export function DashboardClient({ lotes, summary }: DashboardClientProps) {
    return (
        <div className="space-y-6">
            <DashboardAiSummary summary={summary} />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                        <CardTitle className="font-headline">Lotes Recientes</CardTitle>
                        <CardDescription className="font-body">Haz clic en un lote para ver sus detalles.</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <BatchTable lotes={lotes} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <BatchStatusChart lotes={lotes} />
                </div>
            </div>
        </div>
    )
}
