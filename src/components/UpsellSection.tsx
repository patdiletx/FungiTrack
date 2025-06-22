'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { upsellStrategy, UpsellStrategyOutput } from '@/ai/flows/upsell-strategy';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface UpsellSectionProps {
  productId: string;
}

export function UpsellSection({ productId }: UpsellSectionProps) {
  const [suggestion, setSuggestion] = useState<UpsellStrategyOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSuggestion() {
      try {
        const result = await upsellStrategy({
          productId: productId,
          // In a real app, you would fetch and pass actual customer history
          customerHistory: 'Cliente ha comprado un Kit de Inicio por primera vez.',
        });
        setSuggestion(result);
      } catch (error) {
        console.error('Error fetching upsell strategy:', error);
        setSuggestion({ shouldUpsell: false }); // Fallback to no upsell on error
      } finally {
        setLoading(false);
      }
    }
    getSuggestion();
  }, [productId]);

  if (loading) {
    return (
        <Card className="bg-primary/10 border-primary/20 shadow-lg">
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className='flex flex-col md:flex-row items-center gap-4'>
                <Skeleton className="h-32 w-32 rounded-lg" />
                <div className='flex-1 space-y-2'>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-10 w-1/2 mt-2" />
                </div>
            </CardContent>
        </Card>
    );
  }

  if (!suggestion?.shouldUpsell) {
    return null; // Don't render anything if the AI decides not to upsell
  }

  return (
    <Card className="bg-primary/10 border-primary/20 shadow-lg animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary-foreground">¡Una Oferta Especial para Ti!</CardTitle>
        <CardDescription className="font-body text-primary-foreground/80">
          ¿Disfrutaste tu Kit de Inicio? ¡Lleva tu cultivo al siguiente nivel!
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center gap-6">
        <Image 
            src="https://placehold.co/400x400.png"
            data-ai-hint="mushrooms substrate"
            alt="Bloque Productor XL" 
            width={150} 
            height={150} 
            className="rounded-lg shadow-md object-cover"
        />
        <div className="flex-1">
          <h3 className="font-headline text-xl font-bold">Bloque Productor XL</h3>
          <p className="mt-2 text-primary-foreground/90 font-body">
            {suggestion.upsellMessage || 'Consigue cosechas más grandes y frecuentes con nuestro bloque de 3kg. ¡Más hongos, más diversión!'}
          </p>
          <Button className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            Comprar Ahora <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
