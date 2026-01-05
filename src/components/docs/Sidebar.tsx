import { useState } from "react";
import { ChevronRight, FileText, Terminal, Code, Settings, Database, Folder, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  icon?: React.ReactNode;
  href?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "Introdução",
    icon: <FileText className="w-4 h-4" />,
    children: [
      { title: "Visão Geral", href: "overview" },
      { title: "Início Rápido", href: "quickstart" },
      { title: "Instalação", href: "installation" },
    ],
  },
  {
    title: "Terminal & CLI",
    icon: <Terminal className="w-4 h-4" />,
    children: [
      { title: "Comandos Básicos", href: "basic-commands" },
      { title: "Acessar TMUX", href: "tmux" },
      { title: "SSH & Conexões", href: "ssh" },
      { title: "Scripts Shell", href: "shell-scripts" },
    ],
  },
  {
    title: "Código",
    icon: <Code className="w-4 h-4" />,
    children: [
      { title: "Estrutura do Projeto", href: "project-structure" },
      { title: "Componentes", href: "components" },
      { title: "APIs", href: "apis" },
      { title: "Testes", href: "testing" },
    ],
  },
  {
    title: "Banco de Dados",
    icon: <Database className="w-4 h-4" />,
    children: [
      { title: "Configuração", href: "db-setup" },
      { title: "Migrações", href: "migrations" },
      { title: "Queries", href: "queries" },
    ],
  },
  {
    title: "Configuração",
    icon: <Settings className="w-4 h-4" />,
    children: [
      { title: "Variáveis de Ambiente", href: "env-vars" },
      { title: "Deploy", href: "deploy" },
      { title: "CI/CD", href: "ci-cd" },
    ],
  },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Introdução", "Terminal & CLI"]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    );
  };

  const filteredNavigation = navigation.map((section) => ({
    ...section,
    children: section.children?.filter((child) =>
      child.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((section) => 
    section.children && section.children.length > 0
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
          <div key={section.title} className="mb-2">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              {section.icon}
              <span className="flex-1 text-left">{section.title}</span>
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  expandedSections.includes(section.title) && "rotate-90"
                )}
              />
            </button>
            
            {expandedSections.includes(section.title) && section.children && (
              <div className="ml-4 mt-1 space-y-1 animate-fade-in">
                {section.children.map((child) => (
                  <button
                    key={child.href}
                    onClick={() => onSectionChange(child.href || "")}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all",
                      activeSection === child.href
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                    {child.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Folder className="w-4 h-4" />
          <span>Versão 1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
