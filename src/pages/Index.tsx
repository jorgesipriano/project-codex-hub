import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DocHeader } from "@/components/docs/DocHeader";
import { Sidebar, NavItem, ItemType } from "@/components/docs/Sidebar";
import { DocContent } from "@/components/docs/DocContent";
import { 
  loadDocsFromDatabase, 
  saveDocToDatabase,
  deleteDocFromDatabase,
  loadNavigationFromDatabase, 
  saveNavigationToDatabase,
  generateId 
} from "@/lib/docs-database";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsData, navData] = await Promise.all([
        loadDocsFromDatabase(),
        loadNavigationFromDatabase()
      ]);
      setDocs(docsData);
      setNavigation(navData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async (content: string) => {
    try {
      await saveDocToDatabase(activeSection, content);
      setDocs(prev => ({ ...prev, [activeSection]: content }));
      setIsEditing(false);
      toast.success("Documento salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar documento");
    }
  };

  const getDefaultContent = (type: ItemType, title: string) => {
    switch (type) {
      case "task":
        return `# ${title}\n\n- [ ] Tarefa 1\n- [ ] Tarefa 2\n- [ ] Tarefa 3\n`;
      case "note":
        return `# ${title}\n\nEscreva suas anotações aqui...\n`;
      default:
        return "";
    }
  };

  const getDefaultTitle = (type: ItemType) => {
    switch (type) {
      case "section":
        return "Nova Seção";
      case "folder":
        return "Nova Pasta";
      case "note":
        return "Nova Nota";
      case "task":
        return "Nova Tarefa";
      default:
        return "Novo Item";
    }
  };

  // Função recursiva para adicionar item em qualquer nível
  const addItemToNavigation = (
    items: NavItem[], 
    parentId: string | undefined, 
    newItem: NavItem
  ): NavItem[] => {
    if (!parentId) {
      return [...items, newItem];
    }

    return items.map(item => {
      if (item.id === parentId) {
        return {
          ...item,
          children: [...(item.children || []), newItem]
        };
      }
      if (item.children) {
        return {
          ...item,
          children: addItemToNavigation(item.children, parentId, newItem)
        };
      }
      return item;
    });
  };

  const handleAddSection = async (type: ItemType, parentId?: string) => {
    const newId = generateId();
    const newTitle = getDefaultTitle(type);

    const newItem: NavItem = {
      id: newId,
      title: newTitle,
      type,
      icon: type === "section" || type === "folder" ? "folder" : type,
      children: type === "section" || type === "folder" ? [] : undefined
    };

    const newNav = addItemToNavigation(navigation, parentId, newItem);

    try {
      await saveNavigationToDatabase(newNav);
      await saveDocToDatabase(newId, getDefaultContent(type, newTitle));
      setNavigation(newNav);
      setDocs(prev => ({ ...prev, [newId]: getDefaultContent(type, newTitle) }));
      setActiveSection(newId);
      setIsEditing(true);
      toast.success(`${getDefaultTitle(type)} criada!`);
    } catch (error) {
      toast.error("Erro ao criar item");
    }
  };

  // Função recursiva para coletar todos os IDs de um item e seus filhos
  const collectAllIds = (item: NavItem): string[] => {
    const ids = [item.id];
    if (item.children) {
      item.children.forEach(child => {
        ids.push(...collectAllIds(child));
      });
    }
    return ids;
  };

  // Função recursiva para deletar item em qualquer nível
  const removeItemFromNavigation = (
    items: NavItem[], 
    itemId: string
  ): { newItems: NavItem[]; deletedIds: string[] } => {
    let deletedIds: string[] = [];
    
    // Verifica se o item está neste nível
    const itemToDelete = items.find(i => i.id === itemId);
    if (itemToDelete) {
      deletedIds = collectAllIds(itemToDelete);
      return {
        newItems: items.filter(i => i.id !== itemId),
        deletedIds
      };
    }

    // Se não encontrou, procura recursivamente nos filhos
    const newItems = items.map(item => {
      if (item.children && item.children.length > 0) {
        const result = removeItemFromNavigation(item.children, itemId);
        if (result.deletedIds.length > 0) {
          deletedIds = result.deletedIds;
          return { ...item, children: result.newItems };
        }
      }
      return item;
    });

    return { newItems, deletedIds };
  };

  const handleDeleteSection = async (sectionId: string) => {
    const { newItems: newNav, deletedIds } = removeItemFromNavigation(navigation, sectionId);

    if (deletedIds.length === 0) {
      toast.error("Item não encontrado");
      return;
    }

    try {
      await saveNavigationToDatabase(newNav);
      for (const id of deletedIds) {
        await deleteDocFromDatabase(id);
      }
      setNavigation(newNav);
      const newDocs = { ...docs };
      deletedIds.forEach(id => delete newDocs[id]);
      setDocs(newDocs);

      if (deletedIds.includes(activeSection)) {
        const firstId = findFirstLeafId(newNav);
        setActiveSection(firstId || "overview");
      }
      toast.success("Item excluído!");
    } catch (error) {
      toast.error("Erro ao excluir item");
    }
  };

  // Encontra o primeiro ID "folha" na navegação
  const findFirstLeafId = (items: NavItem[]): string | null => {
    for (const item of items) {
      if (!item.children || item.children.length === 0) {
        return item.id;
      }
      const childId = findFirstLeafId(item.children);
      if (childId) return childId;
    }
    return items[0]?.id || null;
  };

  // Função recursiva para renomear item em qualquer nível
  const renameItemInNavigation = (
    items: NavItem[], 
    itemId: string, 
    newTitle: string,
    parentId?: string
  ): NavItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, title: newTitle };
      }
      if (item.children) {
        return {
          ...item,
          children: renameItemInNavigation(item.children, itemId, newTitle, parentId)
        };
      }
      return item;
    });
  };

  const handleRenameSection = async (sectionId: string, newTitle: string, parentId?: string) => {
    const newNav = renameItemInNavigation(navigation, sectionId, newTitle, parentId);

    try {
      await saveNavigationToDatabase(newNav);
      setNavigation(newNav);
      toast.success("Renomeado com sucesso!");
    } catch (error) {
      toast.error("Erro ao renomear");
    }
  };

  // Função recursiva para encontrar título
  const findTitle = (items: NavItem[], targetId: string): string | null => {
    for (const item of items) {
      if (item.id === targetId) return item.title;
      if (item.children) {
        const found = findTitle(item.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const getCurrentTitle = () => {
    return findTitle(navigation, activeSection) || "Documento";
  };

  const handleToggleTask = async (lineIndex: number) => {
    const content = docs[activeSection] || "";
    const lines = content.split("\n");
    const line = lines[lineIndex];
    
    if (line) {
      // Toggle between [ ] and [x]
      if (line.includes("- [ ]")) {
        lines[lineIndex] = line.replace("- [ ]", "- [x]");
      } else if (line.includes("- [x]") || line.includes("- [X]")) {
        lines[lineIndex] = line.replace(/- \[[xX]\]/, "- [ ]");
      }
      
      const newContent = lines.join("\n");
      try {
        await saveDocToDatabase(activeSection, newContent);
        setDocs(prev => ({ ...prev, [activeSection]: newContent }));
      } catch (error) {
        toast.error("Erro ao atualizar tarefa");
      }
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <DocHeader 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
        rightContent={
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        }
      />
      
      <div className="flex">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block">
          <Sidebar 
            navigation={navigation}
            activeSection={activeSection} 
            onSectionChange={(section) => {
              setActiveSection(section);
              setIsEditing(false);
            }}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onRenameSection={handleRenameSection}
          />
        </div>

        {/* Sidebar - Mobile Overlay */}
        {sidebarOpen && (
          <>
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed left-0 top-16 z-50 lg:hidden animate-slide-in">
              <Sidebar 
                navigation={navigation}
                activeSection={activeSection} 
                onSectionChange={(section) => {
                  setActiveSection(section);
                  setSidebarOpen(false);
                  setIsEditing(false);
                }}
                onAddSection={handleAddSection}
                onDeleteSection={handleDeleteSection}
                onRenameSection={handleRenameSection}
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <DocContent 
          activeSection={activeSection}
          content={docs[activeSection] || ""}
          title={getCurrentTitle()}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSaveContent}
          onCancelEdit={() => setIsEditing(false)}
          onToggleTask={handleToggleTask}
        />
      </div>
    </div>
  );
};

export default Index;
