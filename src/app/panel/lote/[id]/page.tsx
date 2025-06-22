import { getLoteById, getProductos } from "@/lib/data";
import { notFound } from "next/navigation";
import { LoteDetailClient } from "@/components/panel/LoteDetailClient";

type Props = {
  params: { id: string };
};

export default async function LoteDetailPage({ params }: Props) {
  const [lote, productos] = await Promise.all([
    getLoteById(params.id),
    getProductos(),
  ]);

  if (!lote) {
    notFound();
  }

  return <LoteDetailClient lote={lote} productos={productos} />;
}
