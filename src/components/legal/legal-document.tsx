import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => (
    <h1 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-foreground mt-8 text-xl font-semibold tracking-tight">{children}</h2>
  ),
  p: ({ children }) => (
    <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="text-muted-foreground mt-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
      {children}
    </ul>
  ),
  li: ({ children }) => <li>{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2 hover:no-underline"
      target={href?.startsWith("http") ? "_blank" : undefined}
      rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
};

export function LegalDocument({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
}
