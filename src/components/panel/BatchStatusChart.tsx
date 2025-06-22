'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Lote } from '@/lib/types';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useMemo } from 'react';

interface BatchStatusChartProps {
  lotes: Lote[];
}

const COLORS: { [key: string]: string } = {
  'En Incubación': 'hsl(var(--chart-2))',
  'En Fructificación': 'hsl(var(--chart-3))',
  'Listo para Venta': 'hsl(var(--chart-1))',
  'Vendido': 'hsl(var(--chart-5))',
  'Contaminado': 'hsl(var(--destructive))',
};
const FALLBACK_COLOR = 'hsl(var(--muted))';

export function BatchStatusChart({ lotes }: BatchStatusChartProps) {
  const chartData = useMemo(() => {
    const statusCounts = lotes.reduce((acc, lote) => {
      acc[lote.estado] = (acc[lote.estado] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      fill: COLORS[name] || FALLBACK_COLOR,
    }));
  }, [lotes]);
  
  if (chartData.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen de Estados</CardTitle>
                <CardDescription>Estado de los lotes de producción.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">No hay datos para mostrar.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Estados</CardTitle>
        <CardDescription>Distribución de lotes por estado actual.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-64">
          <ChartContainer config={{}} className="min-h-[200px] w-full">
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  if (percent < 0.05) return null; // Don't render label for small slices
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  return (
                    <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.fill} stroke={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
              <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
