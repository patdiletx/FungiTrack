'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sprout, QrCode, Network, Bot } from 'lucide-react';
import type { Kit } from '@/lib/types';

export default function MisCultivosPage() {
    const [myKits, setMyKits] = useState<Kit[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedKitsRaw = localStorage.getItem('fungi-my-kits');
            if (storedKitsRaw) {
                setMyKits(JSON.parse(storedKitsRaw));
            }
        } catch (error) {
            console.error("Failed to load kits from localStorage", error);
        } finally {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="text-center py-16">
                <Network className="mx-auto h-16 w-16 animate-pulse text-muted-foreground mb-4" />
                <h1 className="text-3xl font-bold">Cargando tu red de cultivos...</h1>
            </div>
        )
    }

    if (myKits.length === 0) {
        return (
             <div className="text-center py-16">
                <Network className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h1 className="text-3xl font-bold">Aún no tienes cultivos conectados</h1>
                <p className="text-muted-foreground mt-2 mb-6">Escanea tu kit para monitorearlo o prueba nuestra demo interactiva de Myco-Mind.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg">
                        <Link href="/scan">
                            <QrCode className="mr-2 h-5 w-5" />
                            Escanear mi Kit
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="secondary">
                        <Link href="/kit/demo-lote/1">
                            <Bot className="mr-2 h-5 w-5" />
                            Probar la Demo
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row items-center justify-between gap-4">
                 <div>
                    <h1 className="font-headline text-4xl font-bold">Tu Red de Cultivos</h1>
                    <p className="text-muted-foreground mt-1">Selecciona un cultivo para ver su estado y comunicarte con su Myco-Mind.</p>
                </div>
                 <Button onClick={() => router.push('/scan')}>
                    <QrCode className="mr-2 h-4 w-4" />
                    Añadir Nuevo Kit
                </Button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myKits.map((kit) => (
                    <Link key={`${kit.id}-${kit.unit}`} href={`/kit/${kit.id}/${kit.unit}`} passHref>
                        <Card className="h-full flex flex-col hover:border-primary hover:shadow-lg transition-all cursor-pointer">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sprout className="text-primary"/>
                                    {kit.name}
                                </CardTitle>
                                <CardDescription>
                                    Unidad #{kit.unit}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground">ID del Lote: {kit.id.substring(0, 8)}...</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </section>
        </div>
    );
}
