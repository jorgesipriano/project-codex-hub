import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language = "bash", filename, showLineNumbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split("\n");

  return (
    <div className="code-block my-4 animate-fade-in">
      {/* Header */}
      <div className="code-header">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          {filename ? (
            <span className="text-sm text-muted-foreground font-mono">{filename}</span>
          ) : (
            <span className="text-sm text-muted-foreground">{language}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 text-xs rounded transition-all",
            copied
              ? "bg-green-500/20 text-green-400"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copiar
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto scrollbar-thin">
        <pre className="p-4 text-sm leading-relaxed">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && (
                  <span className="select-none w-8 text-right pr-4 text-muted-foreground/50">
                    {index + 1}
                  </span>
                )}
                <span className="text-foreground">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
