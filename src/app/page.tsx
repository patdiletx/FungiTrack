'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FungiTrackLogo } from "@/components/FungiTrackLogo";
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, this would involve a call to an auth provider.
    // For this mock, we'll just simulate a successful login.
    try {
        localStorage.setItem('fungi-track-auth', 'true');
        router.push('/panel');
    } catch (error) {
        console.error("Could not access localStorage. Login will not persist across reloads.");
        router.push('/panel');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center text-center mb-8">
        <FungiTrackLogo className="mb-4" />
        <h1 className="font-headline text-4xl md:text-5xl text-foreground">
          Sistema de Trazabilidad por Lote
        </h1>
        <p className="mt-2 text-lg text-muted-foreground font-body">
          Bienvenido al panel de control de FungiGrow Advisor.
        </p>
      </div>

      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Inicio de Sesión</CardTitle>
          <CardDescription className="font-body">Acceso para operadores.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* In a real app, you'd have input fields for email/password */}
            <p className="text-sm text-muted-foreground font-body">
              Presiona el botón para ingresar al panel de gestión.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full" size="lg">
            <LogIn className="mr-2 h-4 w-4" />
            Ingresar como Operador
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
