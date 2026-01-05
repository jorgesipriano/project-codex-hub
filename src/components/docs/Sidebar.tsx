import { useState } from "react";
import { ChevronRight, FileText, Terminal, Code, Settings, Database, Folder, Search, Plus, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  id: string;
  title: string;
  icon?: string;
  children?: { id: string; title: string }[];
}

interface SidebarProps {
  navigation: NavItem[];
  activeSection: string;
  onSectionChange: (section: string) => void;
  onAddSection: (parentId?: string) => void;
  onDeleteSection: (sectionId: string, parentId?: string) => void;
  onRenameSection: (sectionId: string, newTitle: string, parentId?: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  file: <FileText className="w-4 h-4" />,
  terminal: <Terminal className="w-4 h-4" />,
  code: <Code className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
  folder: <Folder className="w-4 h-4" />,
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

  const finishEditing = (parentId?: string) => {
    if (editingId && editValue.trim()) {
      onRenameSection(editingId, editValue.trim(), parentId);
    }
    setEditingId(null);
    setEditValue("");
  };

  const filteredNavigation = navigation.map((section) => ({
    ...section,
    children: section.children?.filter((child) =>
      child.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (section.children && section.children.length > 0)
  );

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
        {filteredNavigation.map((section) => (
          <div key={section.id} className="mb-2 group/section">
            <div className="flex items-center">
              <button
                onClick={() => toggleSection(section.id)}
                className="flex-1 flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                {iconMap[section.icon || "folder"]}
                {editingId === section.id ? (
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
                  <span className="flex-1 text-left">{section.title}</span>
                )}
                <ChevronRight
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    expandedSections.includes(section.id) && "rotate-90"
                  )}
                />
              </button>
              <div className="hidden group-hover/section:flex items-center gap-1 pr-2">
                <button
                  onClick={(e) => startEditing(section.id, section.title, e)}
                  className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                  title="Renomear"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onAddSection(section.id)}
                  className="p-1 text-muted-foreground hover:text-primary rounded transition-colors"
                  title="Adicionar página"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onDeleteSection(section.id)}
                  className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                  title="Excluir seção"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {expandedSections.includes(section.id) && section.children && (
              <div className="ml-4 mt-1 space-y-1 animate-fade-in">
                {section.children.map((child) => (
                  <div key={child.id} className="group/item flex items-center">
                    <button
                      onClick={() => onSectionChange(child.id)}
                      className={cn(
                        "flex-1 flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all",
                        activeSection === child.id
                          ? "bg-primary/10 text-primary border-l-2 border-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                      )}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                      {editingId === child.id ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => finishEditing(section.id)}
                          onKeyDown={(e) => e.key === "Enter" && finishEditing(section.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-secondary px-2 py-0.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                          autoFocus
                        />
                      ) : (
                        child.title
                      )}
                    </button>
                    <div className="hidden group-hover/item:flex items-center gap-1 pr-2">
                      <button
                        onClick={(e) => startEditing(child.id, child.title, e)}
                        className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                        title="Renomear"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteSection(child.id, section.id)}
                        className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Add new section button */}
        <button
          onClick={() => onAddSection()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors mt-4 border border-dashed border-border"
        >
          <Plus className="w-4 h-4" />
          Nova Seção
        </button>
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
