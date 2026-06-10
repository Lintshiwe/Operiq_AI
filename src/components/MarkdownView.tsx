import ReactMarkdown from "react-markdown";

export function MarkdownView({ children }: { children: string }) {
  return (
    <div className="prose-flow text-[15px] text-foreground">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
