'use client';

import { KitSettings, PhotoEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, Bell, Camera, MessageSquare, Bot } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UserActivityCardProps {
  settings?: KitSettings | null;
}

export function UserActivityCard({ settings }: UserActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bot /> Actividad del Usuario del Kit
        </CardTitle>
        <CardDescription>
          Datos de interacción recopilados desde la página pública del kit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 font-body">
        {!settings ? (
          <div className="text-center text-muted-foreground italic py-8">
            <p>Aún no hay actividad registrada por el usuario para este kit.</p>
          </div>
        ) : (
          <>
            {/* Location */}
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" /> Ubicación Registrada
              </h4>
              {settings.coordinates ? (
                <p className="text-sm">
                  Latitud: {settings.coordinates.latitude.toFixed(4)}, Longitud: {settings.coordinates.longitude.toFixed(4)}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">El usuario no ha registrado una ubicación.</p>
              )}
            </div>

            {/* Notifications */}
            <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <Bell className="h-4 w-4" /> Alertas de Cuidado
                </h4>
                {settings.notification_settings?.enabled ? (
                    <ul className="list-disc list-inside text-sm space-y-1">
                        {settings.notification_settings.watering.enabled && (
                            <li>Riego activado para las {settings.notification_settings.watering.time}.</li>
                        )}
                        {settings.notification_settings.aeration.enabled && (
                            <li>Ventilación activada {settings.notification_settings.aeration.times.length} veces al día.</li>
                        )}
                         {!settings.notification_settings.watering.enabled && !settings.notification_settings.aeration.enabled && (
                            <li>Alertas activadas, pero sin recordatorios configurados.</li>
                        )}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground italic">El usuario no ha activado las alertas.</p>
                )}
            </div>

            {/* AI Interaction */}
            <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <MessageSquare className="h-4 w-4" /> Última Interacción IA
                </h4>
                {settings.last_ai_response ? (
                    <blockquote className="border-l-2 pl-4 italic text-sm">
                        <p>"{settings.last_ai_response.response}"</p>
                        <footer className="text-xs text-muted-foreground mt-1">Humor: {settings.last_ai_response.mood}</footer>
                    </blockquote>
                ) : (
                    <p className="text-sm text-muted-foreground italic">Aún no hay interacciones con la IA.</p>
                )}
            </div>

            {/* Photo History */}
            <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground">
                    <Camera className="h-4 w-4" /> Registro Fotográfico
                </h4>
                {settings.photo_history && settings.photo_history.length > 0 ? (
                    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                        <div className="flex w-max space-x-4 p-4">
                        {settings.photo_history.map((photo: PhotoEntry) => (
                            <figure key={photo.date} className="shrink-0">
                                <div className="overflow-hidden rounded-md w-40 h-40 relative">
                                    <Image
                                        src={photo.url}
                                        alt={`Foto de progreso del ${format(new Date(photo.date), 'P', { locale: es })}`}
                                        className="object-cover"
                                        fill
                                    />
                                </div>
                                <figcaption className="pt-2 text-xs text-muted-foreground text-center">
                                    {format(new Date(photo.date), "d MMM yyyy, HH:mm", { locale: es })}
                                </figcaption>
                            </figure>
                        ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                ) : (
                    <p className="text-sm text-muted-foreground italic">El usuario no ha subido fotos.</p>
                )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
