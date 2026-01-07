import { useState } from "react";
import { Check, ChevronDown, ChevronRight, Clock, Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  children?: TaskItem[];
  isGroup?: boolean;
}

interface TaskViewProps {
  tasks: TaskItem[];
  onUpdate: (tasks: TaskItem[]) => void;
}

function generateTaskId() {
  return Math.random().toString(36).substring(2, 9);
}

function parseTaskText(text: string): React.ReactNode {
  // Highlight inline code references like `file.md` or `portal`
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Bold text with **
    if (part.includes("**")) {
      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, j) => {
        if (bp.startsWith("**") && bp.endsWith("**")) {
          return <strong key={`${i}-${j}`} className="font-semibold text-foreground">{bp.slice(2, -2)}</strong>;
        }
        return bp;
      });
    }
    return part;
  });
}

function TaskItemComponent({ 
  task, 
  depth = 0,
  onToggle,
  onDelete,
  onAddChild,
  onUpdateText,
  onAddSibling
}: { 
  task: TaskItem; 
  depth?: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onUpdateText: (id: string, text: string) => void;
  onAddSibling: (afterId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const hasChildren = task.children && task.children.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (editText.trim()) {
        onUpdateText(task.id, editText.trim());
      }
      setIsEditing(false);
      // Add new sibling task
      onAddSibling(task.id);
    } else if (e.key === "Escape") {
      setEditText(task.text);
      setIsEditing(false);
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      // Add as child instead
      if (editText.trim()) {
        onUpdateText(task.id, editText.trim());
      }
      setIsEditing(false);
      onAddChild(task.id);
    }
  };

  const completedChildren = task.children?.filter(c => c.completed).length || 0;
  const totalChildren = task.children?.length || 0;

  return (
    <div className="group/task">
      <div 
        className={cn(
          "flex items-start gap-2 py-1.5 px-2 rounded-lg transition-colors hover:bg-secondary/50",
          depth > 0 && "ml-6"
        )}
      >
        {/* Expand/Collapse for groups */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-0.5 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={cn(
            "mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
            task.completed
              ? "bg-primary border-primary text-primary-foreground"
              : "border-muted-foreground/40 hover:border-primary"
          )}
        >
          {task.completed && <Check className="w-3 h-3" />}
        </button>

        {/* Task text */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={() => {
                if (editText.trim()) {
                  onUpdateText(task.id, editText.trim());
                }
                setIsEditing(false);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-secondary px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              placeholder="Descreva a tarefa..."
            />
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className={cn(
                "text-sm cursor-text py-0.5",
                task.completed 
                  ? "line-through text-muted-foreground/60" 
                  : "text-muted-foreground"
              )}
            >
              {task.isGroup && (
                <span className="text-primary font-medium mr-1">
                  {task.text.split(":")[0]}:
                </span>
              )}
              <span>{task.isGroup ? task.text.split(":").slice(1).join(":") : parseTaskText(task.text)}</span>
              {hasChildren && (
                <span className="ml-2 text-xs text-muted-foreground/60">
                  ({completedChildren}/{totalChildren})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="hidden group-hover/task:flex items-center gap-1">
          <button
            onClick={() => onAddChild(task.id)}
            className="p-1 text-muted-foreground hover:text-primary transition-colors"
            title="Adicionar subtarefa"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="animate-fade-in">
          {task.children!.map((child) => (
            <TaskItemComponent
              key={child.id}
              task={child}
              depth={depth + 1}
              onToggle={onToggle}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onUpdateText={onUpdateText}
              onAddSibling={onAddSibling}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TaskView({ tasks, onUpdate }: TaskViewProps) {
  const toggleTask = (id: string) => {
    const toggle = (items: TaskItem[]): TaskItem[] => {
      return items.map(item => {
        if (item.id === id) {
          const newCompleted = !item.completed;
          // If completing a parent, complete all children
          const updatedChildren = item.children?.map(c => ({ ...c, completed: newCompleted }));
          return { ...item, completed: newCompleted, children: updatedChildren };
        }
        if (item.children) {
          return { ...item, children: toggle(item.children) };
        }
        return item;
      });
    };
    onUpdate(toggle(tasks));
  };

  const deleteTask = (id: string) => {
    const remove = (items: TaskItem[]): TaskItem[] => {
      return items.filter(item => item.id !== id).map(item => {
        if (item.children) {
          return { ...item, children: remove(item.children) };
        }
        return item;
      });
    };
    onUpdate(remove(tasks));
  };

  const addChildTask = (parentId: string) => {
    const newTask: TaskItem = {
      id: generateTaskId(),
      text: "Nova subtarefa",
      completed: false
    };

    const addChild = (items: TaskItem[]): TaskItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          return { ...item, children: [...(item.children || []), newTask] };
        }
        if (item.children) {
          return { ...item, children: addChild(item.children) };
        }
        return item;
      });
    };
    onUpdate(addChild(tasks));
  };

  const addSiblingTask = (afterId: string) => {
    const newTask: TaskItem = {
      id: generateTaskId(),
      text: "",
      completed: false
    };

    const addAfter = (items: TaskItem[]): TaskItem[] => {
      const result: TaskItem[] = [];
      for (const item of items) {
        result.push(item);
        if (item.id === afterId) {
          result.push(newTask);
        }
        if (item.children) {
          const updatedChildren = addAfter(item.children);
          if (updatedChildren !== item.children) {
            result[result.length - 1] = { ...item, children: updatedChildren };
          }
        }
      }
      return result;
    };

    // Check if task is at root level
    const rootIndex = tasks.findIndex(t => t.id === afterId);
    if (rootIndex !== -1) {
      const newTasks = [...tasks];
      newTasks.splice(rootIndex + 1, 0, newTask);
      onUpdate(newTasks);
    } else {
      onUpdate(addAfter(tasks));
    }
  };

  const updateTaskText = (id: string, text: string) => {
    const update = (items: TaskItem[]): TaskItem[] => {
      return items.map(item => {
        if (item.id === id) {
          // Check if it's a group (text contains ":")
          const isGroup = text.includes(":") && !text.startsWith("`");
          return { ...item, text, isGroup };
        }
        if (item.children) {
          return { ...item, children: update(item.children) };
        }
        return item;
      });
    };
    onUpdate(update(tasks));
  };

  const addNewTask = () => {
    const newTask: TaskItem = {
      id: generateTaskId(),
      text: "Nova tarefa",
      completed: false
    };
    onUpdate([...tasks, newTask]);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Última atualização: hoje</span>
          </div>
          {totalCount > 0 && (
            <div className="text-sm text-muted-foreground">
              <span className="text-primary font-medium">{completedCount}</span>
              <span>/{totalCount} concluídas</span>
            </div>
          )}
        </div>
        <button
          onClick={addNewTask}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </button>
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {/* Task list */}
      <div className="space-y-1">
        {tasks.map((task) => (
          <TaskItemComponent
            key={task.id}
            task={task}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAddChild={addChildTask}
            onUpdateText={updateTaskText}
            onAddSibling={addSiblingTask}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-4">Nenhuma tarefa ainda</p>
            <button
              onClick={addNewTask}
              className="text-primary hover:underline"
            >
              Criar primeira tarefa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Parse markdown task content to TaskItem array
export function parseTasksFromMarkdown(content: string): TaskItem[] {
  const lines = content.split("\n");
  const tasks: TaskItem[] = [];
  const stack: { task: TaskItem; indent: number }[] = [];

  for (const line of lines) {
    const taskMatch = line.match(/^(\s*)- \[([ xX])\] (.*)$/);
    if (taskMatch) {
      const indent = taskMatch[1].length;
      const completed = taskMatch[2].toLowerCase() === "x";
      const text = taskMatch[3];
      const isGroup = text.includes(":") && !text.startsWith("`");

      const newTask: TaskItem = {
        id: generateTaskId(),
        text,
        completed,
        isGroup,
        children: []
      };

      // Find parent based on indent
      while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      if (stack.length === 0) {
        tasks.push(newTask);
      } else {
        const parent = stack[stack.length - 1].task;
        if (!parent.children) parent.children = [];
        parent.children.push(newTask);
      }

      stack.push({ task: newTask, indent });
    }
  }

  // Clean up empty children arrays
  const cleanTasks = (items: TaskItem[]): TaskItem[] => {
    return items.map(item => ({
      ...item,
      children: item.children && item.children.length > 0 ? cleanTasks(item.children) : undefined
    }));
  };

  return cleanTasks(tasks);
}

// Convert TaskItem array back to markdown
export function tasksToMarkdown(title: string, tasks: TaskItem[], indent: number = 0): string {
  let md = indent === 0 ? `# ${title}\n\n` : "";
  const spaces = "  ".repeat(indent);

  for (const task of tasks) {
    const checkbox = task.completed ? "[x]" : "[ ]";
    md += `${spaces}- ${checkbox} ${task.text}\n`;
    if (task.children && task.children.length > 0) {
      md += tasksToMarkdown("", task.children, indent + 1);
    }
  }

  return md;
}
