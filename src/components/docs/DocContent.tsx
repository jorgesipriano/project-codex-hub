import { CodeBlock } from "./CodeBlock";
import { Breadcrumb } from "./Breadcrumb";
import { DocEditor } from "./DocEditor";
import { TaskView, parseTasksFromMarkdown, tasksToMarkdown, TaskItem } from "./TaskView";
import { AlertCircle, CheckCircle2, Edit2, Info, Lightbulb, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocContentProps {
  activeSection: string;
  content: string;
  title: string;
  isEditing: boolean;
  isTaskPage?: boolean;
  onEdit: () => void;
  onSave: (content: string) => void;
  onCancelEdit: () => void;
  onToggleTask?: (lineIndex: number) => void;
}

interface AlertProps {
  type: "info" | "success" | "warning" | "tip";
  children: React.ReactNode;
}

function Alert({ type, children }: AlertProps) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    success: "bg-green-500/10 border-green-500/30 text-green-400",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    tip: "bg-primary/10 border-primary/30 text-primary",
  };

  const icons = {
    info: <Info className="w-5 h-5" />,
    success: <CheckCircle2 className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    tip: <Lightbulb className="w-5 h-5" />,
  };

  return (
    <div className={cn("flex gap-3 p-4 rounded-lg border my-4", styles[type])}>
      {icons[type]}
      <div className="text-sm">{children}</div>
    </div>
  );
}

function parseMarkdown(content: string, onToggleTask?: (lineIndex: number) => void) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = "";
  let listItems: { text: string; lineIndex: number }[] = [];
  let taskItems: { text: string; checked: boolean; lineIndex: number }[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside mb-4 text-muted-foreground space-y-1">
          {listItems.map((item, i) => (
            <li key={i}>{parseInlineMarkdown(item.text)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const flushTasks = () => {
    if (taskItems.length > 0) {
      elements.push(
        <ul key={`tasks-${elements.length}`} className="mb-4 space-y-2">
          {taskItems.map((task, i) => (
            <li key={i} className="flex items-center gap-3 group">
              <button
                onClick={() => onToggleTask?.(task.lineIndex)}
                className={cn(
                  "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                  task.checked 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "border-muted-foreground/50 hover:border-primary"
                )}
              >
                {task.checked && (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className={cn(
                "text-muted-foreground transition-all",
                task.checked && "line-through opacity-60"
              )}>
                {parseInlineMarkdown(task.text)}
              </span>
            </li>
          ))}
        </ul>
      );
      taskItems = [];
    }
  };

  const parseInlineMarkdown = (text: string): React.ReactNode => {
    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-secondary rounded text-primary text-sm">$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  lines.forEach((line, index) => {
    // Code block
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <CodeBlock 
            key={`code-${elements.length}`} 
            code={codeContent.join("\n")} 
            language={codeLanguage || "bash"}
          />
        );
        codeContent = [];
        codeLanguage = "";
        inCodeBlock = false;
      } else {
        flushList();
        flushTasks();
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      return;
    }

    // Task items - [ ] or - [x]
    const taskMatch = line.match(/^- \[([ xX])\] (.*)$/);
    if (taskMatch) {
      flushList(); // Flush regular list before tasks
      const isChecked = taskMatch[1].toLowerCase() === 'x';
      taskItems.push({ text: taskMatch[2], checked: isChecked, lineIndex: index });
      return;
    } else {
      flushTasks();
    }

    // List items
    if (line.startsWith("- ") || line.startsWith("* ")) {
      listItems.push({ text: line.slice(2), lineIndex: index });
      return;
    } else {
      flushList();
    }

    // Headers
    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={`h1-${index}`} className="text-3xl font-bold text-foreground mb-4 mt-8 first:mt-0">
          {line.slice(2)}
        </h1>
      );
      return;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={`h2-${index}`} className="text-2xl font-semibold text-foreground mb-3 mt-6 pb-2 border-b border-border">
          {line.slice(3)}
        </h2>
      );
      return;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-xl font-semibold text-foreground mb-2 mt-4">
          {line.slice(4)}
        </h3>
      );
      return;
    }

    // Alert blocks
    if (line.startsWith("> [!INFO]")) {
      const alertContent = line.slice(10).trim();
      elements.push(<Alert key={`alert-${index}`} type="info">{alertContent}</Alert>);
      return;
    }
    if (line.startsWith("> [!TIP]")) {
      const alertContent = line.slice(9).trim();
      elements.push(<Alert key={`alert-${index}`} type="tip">{alertContent}</Alert>);
      return;
    }
    if (line.startsWith("> [!SUCCESS]")) {
      const alertContent = line.slice(13).trim();
      elements.push(<Alert key={`alert-${index}`} type="success">{alertContent}</Alert>);
      return;
    }
    if (line.startsWith("> [!WARNING]")) {
      const alertContent = line.slice(13).trim();
      elements.push(<Alert key={`alert-${index}`} type="warning">{alertContent}</Alert>);
      return;
    }

    // Empty line
    if (line.trim() === "") {
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${index}`} className="text-muted-foreground leading-relaxed mb-4">
        {parseInlineMarkdown(line)}
      </p>
    );
  });

  flushList();
  flushTasks();

  return elements;
}

export function DocContent({ 
  activeSection, 
  content, 
  title,
  isEditing, 
  isTaskPage,
  onEdit, 
  onSave,
  onCancelEdit,
  onToggleTask
}: DocContentProps) {
  if (isEditing) {
    return (
      <main className="flex-1 h-[calc(100vh-64px)] overflow-hidden">
        <DocEditor 
          initialContent={content}
          onSave={onSave}
          onCancel={onCancelEdit}
        />
      </main>
    );
  }

  const hasContent = content && content.trim().length > 0;

  // Handle task page with TaskView component
  const handleTaskUpdate = (tasks: TaskItem[]) => {
    const newContent = tasksToMarkdown(title, tasks);
    onSave(newContent);
  };

  // Check if content has tasks (for auto-detection)
  const hasTaskItems = content.includes("- [ ]") || content.includes("- [x]") || content.includes("- [X]");
  const shouldShowTaskView = isTaskPage || hasTaskItems;

  return (
    <main className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Breadcrumb items={[{ label: "Docs" }, { label: title }]} />
        </div>

        {hasContent ? (
          <div className="animate-fade-in">
            {shouldShowTaskView ? (
              <>
                <h1 className="text-3xl font-bold text-foreground mb-6">{title}</h1>
                <TaskView 
                  tasks={parseTasksFromMarkdown(content)} 
                  onUpdate={handleTaskUpdate}
                />
              </>
            ) : (
              <div className="doc-prose">
                {parseMarkdown(content, onToggleTask)}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Página vazia</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Esta página ainda não tem conteúdo. Clique em "Editar" para adicionar sua documentação.
            </p>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Edit2 className="w-4 h-4" />
              Começar a escrever
            </button>
          </div>
        )}
        
        {hasContent && !shouldShowTaskView && (
          <div className="mt-12 pt-6 border-t border-border text-sm">
            <div className="text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}
      </div>

      {/* Floating edit button */}
      <button
        onClick={onEdit}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:opacity-90 transition-all hover:scale-105 z-50"
      >
        <Edit2 className="w-4 h-4" />
        <span className="hidden sm:inline">Editar</span>
      </button>
    </main>
  );
}
