import { getPosts } from "@/lib/blog-data";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogIndexPage() {
  const posts = getPosts();

  return (
    <div className="space-y-12">
      <header className="text-center">
        <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tight">
          El Blog de FungiGrow
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Consejos de cultivo, recetas y el fascinante mundo de la micología.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Card key={post.slug} className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group">
            <CardHeader className="p-0 border-b">
              <Link href={`/tienda/blog/${post.slug}`} className="block">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col">
              <Link href={`/tienda/blog/${post.slug}`} className="block">
                <CardTitle className="font-headline text-xl leading-tight hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
                 <CardDescription className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {post.excerpt}
                </CardDescription>
              </Link>
              <div className="flex-grow"/>
              <div className="mt-4">
                 <Button asChild variant="link" className="p-0 h-auto">
                    <Link href={`/tienda/blog/${post.slug}`}>
                        Leer más <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                 </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
