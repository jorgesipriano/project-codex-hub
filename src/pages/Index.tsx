import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DocHeader } from "@/components/docs/DocHeader";
import { Sidebar, NavItem } from "@/components/docs/Sidebar";
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

  const handleAddSection = async (parentId?: string) => {
    const newId = generateId();
    const newTitle = "Nova Página";

    let newNav: NavItem[];
    if (parentId) {
      newNav = navigation.map(section => {
        if (section.id === parentId) {
          return {
            ...section,
            children: [...(section.children || []), { id: newId, title: newTitle }]
          };
        }
        return section;
      });
    } else {
      const newSection: NavItem = {
        id: newId,
        title: "Nova Seção",
        icon: "folder",
        children: []
      };
      newNav = [...navigation, newSection];
    }

    try {
      await saveNavigationToDatabase(newNav);
      await saveDocToDatabase(newId, "");
      setNavigation(newNav);
      setDocs(prev => ({ ...prev, [newId]: "" }));
      setActiveSection(newId);
      setIsEditing(true);
      toast.success("Nova página criada!");
    } catch (error) {
      toast.error("Erro ao criar página");
    }
  };

  const handleDeleteSection = async (sectionId: string, parentId?: string) => {
    let newNav: NavItem[];
    const idsToDelete: string[] = [sectionId];

    if (parentId) {
      newNav = navigation.map(section => {
        if (section.id === parentId) {
          return {
            ...section,
            children: section.children?.filter(child => child.id !== sectionId)
          };
        }
        return section;
      });
    } else {
      const section = navigation.find(s => s.id === sectionId);
      idsToDelete.push(...(section?.children?.map(c => c.id) || []));
      newNav = navigation.filter(s => s.id !== sectionId);
    }

    try {
      await saveNavigationToDatabase(newNav);
      for (const id of idsToDelete) {
        await deleteDocFromDatabase(id);
      }
      setNavigation(newNav);
      const newDocs = { ...docs };
      idsToDelete.forEach(id => delete newDocs[id]);
      setDocs(newDocs);

      if (activeSection === sectionId) {
        const firstSection = newNav[0]?.children?.[0]?.id || newNav[0]?.id || "overview";
        setActiveSection(firstSection);
      }
      toast.success("Página excluída!");
    } catch (error) {
      toast.error("Erro ao excluir página");
    }
  };

  const handleRenameSection = async (sectionId: string, newTitle: string, parentId?: string) => {
    let newNav: NavItem[];
    if (parentId) {
      newNav = navigation.map(section => {
        if (section.id === parentId) {
          return {
            ...section,
            children: section.children?.map(child => 
              child.id === sectionId ? { ...child, title: newTitle } : child
            )
          };
        }
        return section;
      });
    } else {
      newNav = navigation.map(section => 
        section.id === sectionId ? { ...section, title: newTitle } : section
      );
    }

    try {
      await saveNavigationToDatabase(newNav);
      setNavigation(newNav);
      toast.success("Renomeado com sucesso!");
    } catch (error) {
      toast.error("Erro ao renomear");
    }
  };

  const getCurrentTitle = () => {
    for (const section of navigation) {
      if (section.id === activeSection) return section.title;
      const child = section.children?.find(c => c.id === activeSection);
      if (child) return child.title;
    }
    return "Documento";
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
        />
      </div>
    </div>
  );
};

export default Index;
