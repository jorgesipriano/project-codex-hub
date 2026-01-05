import { useState } from "react";
import { Bold, Italic, Code, List, Heading1, Heading2, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocEditorProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export function DocEditor({ initialContent, onSave, onCancel }: DocEditorProps) {
  const [content, setContent] = useState(initialContent);

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.getElementById("doc-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = 
      content.substring(0, start) + 
      before + selectedText + after + 
      content.substring(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: <Heading1 className="w-4 h-4" />, action: () => insertMarkdown("# "), label: "Título 1" },
    { icon: <Heading2 className="w-4 h-4" />, action: () => insertMarkdown("## "), label: "Título 2" },
    { icon: <Bold className="w-4 h-4" />, action: () => insertMarkdown("**", "**"), label: "Negrito" },
    { icon: <Italic className="w-4 h-4" />, action: () => insertMarkdown("*", "*"), label: "Itálico" },
    { icon: <Code className="w-4 h-4" />, action: () => insertMarkdown("```\n", "\n```"), label: "Código" },
    { icon: <List className="w-4 h-4" />, action: () => insertMarkdown("- "), label: "Lista" },
  ];

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-card/50">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              title={btn.label}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {btn.icon}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            onClick={() => onSave(content)}
            className="flex items-center gap-2 px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        id="doc-editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="# Título da página

Escreva sua documentação aqui usando Markdown...

## Seção

Texto com **negrito** e *itálico*.

```bash
# Bloco de código
echo 'Hello World'
```

- Item da lista
- Outro item"
        className="flex-1 w-full p-6 bg-background text-foreground font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-muted-foreground/50 scrollbar-thin"
        spellCheck={false}
      />
    </div>
  );
}
