'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { diagnoseContamination, DiagnoseContaminationOutput } from '@/ai/flows/diagnose-contamination-flow';
import { Loader2, Microscope, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

export function ContaminationChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnoseContaminationOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
        toast({
          title: "Archivo demasiado grande",
          description: "Por favor, selecciona una imagen de menos de 4MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file || !previewUrl) {
      toast({
        title: "No se ha seleccionado archivo",
        description: "Por favor, elige una imagen para analizar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const diagnosisResult = await diagnoseContamination({ photoDataUri: previewUrl });
      setResult(diagnosisResult);
    } catch (error) {
      console.error("Error analyzing contamination:", error);
      toast({
        title: "Error en el análisis",
        description: "No se pudo completar el análisis. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-chart-2';
    if (confidence > 0.5) return 'text-chart-4';
    return 'text-destructive';
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Microscope />
          Verificador de Contaminación
        </CardTitle>
        <CardDescription>
          Sube una foto de tu lote para que la IA la analice en busca de problemas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
            <Upload className="mr-2" />
            {file ? `Cambiar: ${file.name}` : 'Seleccionar Imagen'}
          </Button>
          {previewUrl && (
            <div className="mt-4 p-2 border rounded-md flex justify-center">
              <Image src={previewUrl} alt="Vista previa" width={200} height={200} className="rounded-md object-contain" />
            </div>
          )}
        </div>

        <Button onClick={handleAnalyzeClick} disabled={loading || !file} className="w-full">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Microscope className="mr-2" />}
          Analizar Imagen
        </Button>
        
        {result && (
            <Alert variant={result.isContaminated ? "destructive" : "success"} className="animate-in fade-in-50">
              {result.isContaminated ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <AlertTitle>{result.isContaminated ? 'Contaminación Detectada' : 'Análisis Completado: Lote Sano'}</AlertTitle>
              <AlertDescription>
                <p>{result.diagnosis}</p>
                <p className="mt-2 text-xs">
                  Confianza del diagnóstico: 
                  <span className={`font-bold ${getConfidenceColor(result.confidence)}`}>
                    {' '}{(result.confidence * 100).toFixed(0)}%
                  </span>
                </p>
              </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
