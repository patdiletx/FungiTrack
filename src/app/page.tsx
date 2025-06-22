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
import { LogIn, KeyRound, AtSign, Loader2, UserPlus, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthError } from '@supabase/supabase-js';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un email válido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});

const registerSchema = z.object({
    email: z.string().email({ message: "Por favor, ingresa un email válido." }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const { formState: { isSubmitting: isLoggingIn } } = loginForm;
  const { formState: { isSubmitting: isRegistering } } = registerForm;

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      if (error instanceof AuthError && error.message.includes('Email not confirmed')) {
         toast({
          title: "Confirma tu email",
          description: "Revisa tu bandeja de entrada para encontrar el enlace de confirmación.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error de autenticación",
          description: error.message, // Show the real Supabase error
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      router.refresh();
    }
  };

  const handleRegister = async (values: z.infer<typeof registerSchema>) => {
    const { data, error } = await supabase.auth.signUp(values);

    if (error) {
        toast({
            title: "Error en el registro",
            description: error.message,
            variant: "destructive",
        });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast({
            title: "Usuario ya existe",
            description: "Este email ya está registrado. Revisa tu bandeja de entrada por un email de confirmación.",
            variant: "destructive",
        });
    } else {
        toast({
            title: "¡Registro exitoso!",
            description: "Hemos enviado un enlace de confirmación a tu email. Por favor, revísalo para activar tu cuenta.",
        });
        registerForm.reset();
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
          Panel de control para FungiGrow.
        </p>
      </div>

      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Ingresar (Operador)</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
            <Card className="shadow-lg">
                <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                    <CardHeader>
                    <CardTitle className="font-headline text-2xl">Inicio de Sesión</CardTitle>
                    <CardDescription className="font-body">Acceso para operadores.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <FormField
                        control={loginForm.control}
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
                        control={loginForm.control}
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
                    <Button type="submit" className="w-full" size="lg" disabled={isLoggingIn}>
                        {isLoggingIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                        Ingresar
                    </Button>
                    </CardFooter>
                </form>
                </Form>
            </Card>
        </TabsContent>

        <TabsContent value="register">
            <Card className="shadow-lg">
                <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                    <CardHeader>
                    <CardTitle className="font-headline text-2xl">Crear Cuenta</CardTitle>
                    <CardDescription className="font-body">Regístrate para obtener acceso.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="email" placeholder="tu.email@ejemplo.com" {...field} className="pl-10" />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input type="password" placeholder="Mínimo 6 caracteres" {...field} className="pl-10" />
                            </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    </CardContent>
                    <CardFooter>
                    <Button type="submit" className="w-full" size="lg" disabled={isRegistering}>
                        {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        Crear Cuenta
                    </Button>
                    </CardFooter>
                </form>
                </Form>
            </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-6 max-w-sm w-full" />
      
      <div className="text-center">
         <p className="text-sm text-muted-foreground mb-2">¿Tienes un kit de cultivo?</p>
         <Button variant="outline" onClick={() => router.push('/scan')}>
            <QrCode className="mr-2 h-4 w-4" />
            Escanear mi Kit
         </Button>
      </div>

    </main>
  );
}
