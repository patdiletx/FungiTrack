import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "¿Qué incluye exactamente el kit de cultivo FungiGrow?",
    answer: "Cada kit viene con un bloque de sustrato especializado y completamente colonizado con el micelio del hongo que elegiste, listo para fructificar. También incluye un manual de instrucciones detallado y, lo más importante, acceso al asistente de IA Myco-Mind a través del código QR único del kit."
  },
  {
    question: "¿Necesito tener experiencia previa en cultivo de hongos?",
    answer: "¡Para nada! Nuestros kits están diseñados para ser increíblemente fáciles de usar, incluso para principiantes absolutos. El asistente Myco-Mind te guiará paso a paso, diciéndote exactamente cuándo regar, ventilar y cosechar, eliminando todas las conjeturas del proceso."
  },
  {
    question: "¿Cómo funciona la inteligencia artificial de Myco-Mind?",
    answer: "Myco-Mind es una IA conversacional. Al escanear el QR de tu kit, accedes a una interfaz web donde puedes 'hablar' con tu cultivo. Puedes hacerle preguntas, y la IA te dará consejos basados en la edad de tu kit, su fase de desarrollo e incluso el clima de tu localidad (si compartes tu ubicación) para optimizar el crecimiento."
  },
  {
    question: "¿Cuánto tiempo tardan los hongos en crecer?",
    answer: "Generalmente, verás los primeros primordios (pequeños hongos) aparecer entre 7 y 14 días después de activar el kit. Desde ahí, crecen muy rápido y suelen estar listos para la cosecha en unos 5-7 días más. ¡Todo el proceso es una increíble lección de biología acelerada!"
  },
  {
    question: "¿Qué pasa si mi cultivo se ve raro o creo que tiene contaminación?",
    answer: "¡No te preocupes! Una de las funciones más potentes de Myco-Mind es el diagnóstico por imagen. Simplemente sube una foto de tu cultivo a la interfaz y la IA la analizará en busca de signos de contaminantes comunes, dándote un diagnóstico y los pasos a seguir."
  },
  {
    question: "¿Realizan envíos a todo Chile?",
    answer: "Sí, realizamos envíos a todo el territorio nacional. Los costos y tiempos de envío varían según tu ubicación y se calculan en la pantalla de pago. Todos los kits se empaquetan cuidadosamente para asegurar que lleguen en perfectas condiciones."
  },
]


export default function FaqPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tight">
          Preguntas Frecuentes
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          ¿Tienes dudas? Aquí resolvemos las consultas más comunes sobre nuestros kits y la experiencia FungiGrow.
        </p>
      </header>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-left font-bold text-lg">{faq.question}</AccordionTrigger>
            <AccordionContent className="text-base text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
