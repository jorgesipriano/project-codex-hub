import { useState } from "react";
import { ChevronRight, FileText, Terminal, Code, Settings, Database, Folder, Search, Plus, Trash2, Edit2, CheckSquare, StickyNote, FolderPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type ItemType = "section" | "note" | "task" | "folder";

export interface NavItem {
  id: string;
  title: string;
  icon?: string;
  type?: ItemType;
  children?: NavItem[];
}

interface SidebarProps {
  navigation: NavItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  onAddSection: (type: ItemType, parentId?: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onRenameSection: (sectionId: string, newTitle: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  file: <FileText className="w-4 h-4" />,
  terminal: <Terminal className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  folder: <Folder className="w-4 h-4" />,
  note: <StickyNote className="w-4 h-4" />,
  task: <CheckSquare className="w-4 h-4" />,
};

const getItemIcon = (item: NavItem) => {
  if (item.type === "note") return iconMap.note;
  if (item.type === "task") return iconMap.task;
  if (item.icon) return iconMap[item.icon];
  if (item.children && item.children.length >= 0) return iconMap.folder;
  return iconMap.file;
};

export function Sidebar({ 
  navigation, 
  activeSection, 
  onSectionChange, 
  onAddSection,
  onDeleteSection,
  onRenameSection
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    navigation.slice(0, 2).map(n => n.id)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const startEditing = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(title);
  };

  const finishEditing = () => {
    if (editingId && editValue.trim()) {
      onRenameSection(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue("");
  };

  const filterNavItems = (items: NavItem[], query: string): NavItem[] => {
    const result: NavItem[] = [];
    for (const item of items) {
      const matchesQuery = item.title.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = item.children ? filterNavItems(item.children, query) : undefined;
      
      if (matchesQuery || (filteredChildren && filteredChildren.length > 0)) {
        result.push({ ...item, children: filteredChildren });
      }
    }
    return result;
  };

  const filteredNavigation: NavItem[] = searchQuery 
    ? filterNavItems(navigation, searchQuery)
    : navigation;

  const isExpandable = (item: NavItem) => {
    return item.children && item.children.length > 0;
  };

  const hasChildren = (item: NavItem) => {
    return item.type === "section" || item.type === "folder" || (item.children !== undefined);
  };

  const renderNavItem = (item: NavItem, depth: number = 0) => {
    const isFolder = hasChildren(item);
    const canExpand = isExpandable(item);
    const isExpanded = expandedSections.includes(item.id);

    if (isFolder) {
      return (
        <div key={item.id} className="mb-1 group/section">
          <div className="flex items-center">
            <button
              onClick={() => {
                if (canExpand) {
                  toggleSection(item.id);
                }
                // Para pastas, também permite selecionar para ver conteúdo
                if (!item.children || item.children.length === 0) {
                  onSectionChange(item.id);
                }
              }}
              className={cn(
                "flex-1 flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                depth === 0 
                  ? "text-foreground hover:bg-secondary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                activeSection === item.id && "bg-primary/10 text-primary"
              )}
              style={{ paddingLeft: `${12 + depth * 12}px` }}
            >
              {getItemIcon(item)}
              {editingId === item.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => finishEditing()}
                  onKeyDown={(e) => e.key === "Enter" && finishEditing()}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-secondary px-2 py-0.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-left truncate">{item.title}</span>
              )}
              {canExpand && (
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )}
                />
              )}
            </button>
            <div className="hidden group-hover/section:flex items-center gap-1 pr-2">
              <button
                onClick={(e) => startEditing(item.id, item.title, e)}
                className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                title="Renomear"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 text-muted-foreground hover:text-primary rounded transition-colors"
                    title="Adicionar"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => onAddSection("folder", item.id)}>
                    <Folder className="w-4 h-4 mr-2" />
                    Subpasta
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddSection("note", item.id)}>
                    <StickyNote className="w-4 h-4 mr-2" />
                    Nota
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddSection("task", item.id)}>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Tarefa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button
                onClick={() => onDeleteSection(item.id)}
                className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {isExpanded && item.children && (
            <div className="mt-1 space-y-1 animate-fade-in">
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Item simples (nota ou tarefa no nível raiz ou sem filhos)
    return (
      <div key={item.id} className="group/item flex items-center mb-1">
        <button
          onClick={() => onSectionChange(item.id)}
          className={cn(
            "flex-1 flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all",
            activeSection === item.id
              ? "bg-primary/10 text-primary border-l-2 border-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
          style={{ paddingLeft: `${12 + depth * 12}px` }}
        >
          {getItemIcon(item)}
          {editingId === item.id ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => finishEditing()}
              onKeyDown={(e) => e.key === "Enter" && finishEditing()}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-secondary px-2 py-0.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          ) : (
            <span className="truncate">{item.title}</span>
          )}
        </button>
        <div className="hidden group-hover/item:flex items-center gap-1 pr-2">
          <button
            onClick={(e) => startEditing(item.id, item.title, e)}
            className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            title="Renomear"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDeleteSection(item.id)}
            className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <aside className="w-[280px] h-[calc(100vh-64px)] border-r border-border bg-card/50 flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar documentação..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
        {filteredNavigation.map((item) => renderNavItem(item))}

        {/* Add new items buttons */}
        <div className="pt-4 space-y-2 border-t border-border mt-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors border border-dashed border-border">
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => onAddSection("section")}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Nova Seção
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddSection("note")}>
                <StickyNote className="w-4 h-4 mr-2" />
                Nova Nota
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddSection("task")}>
                <CheckSquare className="w-4 h-4 mr-2" />
                Nova Tarefa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Folder className="w-4 h-4" />
          <span>Documentação Editável</span>
        </div>
      </div>
    </aside>
  );
}
