import { getPostBySlug, getPosts } from "@/lib/blog-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const renderContent = (content: string) => {
    const elements: JSX.Element[] = [];
    let listItems: JSX.Element[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 my-4">{listItems}</ul>);
            listItems = [];
        }
    };

    content.trim().split('\n').forEach((line, index) => {
      line = line.trim();
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
      
      if (line.startsWith('### ')) {
        flushList();
        elements.push(<h3 key={index} className="text-2xl font-bold font-headline mt-8 mb-4">{line.substring(4)}</h3>);
      } else if (line.startsWith('*   ')) {
        listItems.push(<li key={index} dangerouslySetInnerHTML={{ __html: line.substring(4) }} />);
      } else if (line === '') {
        flushList();
        elements.push(<div key={index} className="h-4" />); // Represents a paragraph break
      } else {
        flushList();
        elements.push(<p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />);
      }
    });

    flushList(); // Add any remaining list items
    return elements;
  };

  return (
    <article className="max-w-4xl mx-auto">
      <header className="mb-8">
        <Button asChild variant="ghost" className="mb-4 pl-0">
          <Link href="/tienda/blog">
            <ArrowLeft className="mr-2" />
            Volver al Blog
          </Link>
        </Button>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight">
          {post.title}
        </h1>
      </header>

      <div className="relative aspect-video w-full rounded-lg overflow-hidden mb-8 shadow-lg">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
        {renderContent(post.content)}
      </div>
    </article>
  );
}
