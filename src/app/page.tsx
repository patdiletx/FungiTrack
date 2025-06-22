'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FungiTrackLogo } from "@/components/FungiTrackLogo";
import { LogIn, KeyRound, AtSign, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un email válido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const { formState: { isSubmitting } } = form;

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      toast({
        title: "Error de autenticación",
        description: "Email o contraseña incorrectos. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      router.push('/panel');
      router.refresh(); // Ensure layout re-evaluates auth state
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Inicio de Sesión</CardTitle>
              <CardDescription className="font-body">Acceso para operadores.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="operador@fungigrow.cl" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                Ingresar como Operador
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}
