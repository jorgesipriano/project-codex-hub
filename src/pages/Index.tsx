import { useState, useEffect } from "react";
import { DocHeader } from "@/components/docs/DocHeader";
import { Sidebar, NavItem } from "@/components/docs/Sidebar";
import { DocContent } from "@/components/docs/DocContent";
import { 
  loadDocsFromStorage, 
  saveDocsToStorage, 
  loadNavigationFromStorage, 
  saveNavigationToStorage,
  generateId 
} from "@/lib/docs-storage";
import { toast } from "sonner";

const Index = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [navigation, setNavigation] = useState<NavItem[]>([]);

  useEffect(() => {
    setDocs(loadDocsFromStorage());
    setNavigation(loadNavigationFromStorage());
  }, []);

  const handleSaveContent = (content: string) => {
    const newDocs = { ...docs, [activeSection]: content };
    setDocs(newDocs);
    saveDocsToStorage(newDocs);
    setIsEditing(false);
    toast.success("Documento salvo com sucesso!");
  };

  const handleAddSection = (parentId?: string) => {
    const newId = generateId();
    const newTitle = "Nova Página";

    if (parentId) {
      // Add child to existing section
      const newNav = navigation.map(section => {
        if (section.id === parentId) {
          return {
            ...section,
            children: [...(section.children || []), { id: newId, title: newTitle }]
          };
        }
        return section;
      });
      setNavigation(newNav);
      saveNavigationToStorage(newNav);
    } else {
      // Add new top-level section
      const newSection: NavItem = {
        id: newId,
        title: "Nova Seção",
        icon: "folder",
        children: []
      };
      const newNav = [...navigation, newSection];
      setNavigation(newNav);
      saveNavigationToStorage(newNav);
    }

    // Create empty doc
    const newDocs = { ...docs, [newId]: "" };
    setDocs(newDocs);
    saveDocsToStorage(newDocs);

    setActiveSection(newId);
    setIsEditing(true);
    toast.success("Nova página criada!");
  };

  const handleDeleteSection = (sectionId: string, parentId?: string) => {
    if (parentId) {
      // Delete child
      const newNav = navigation.map(section => {
        if (section.id === parentId) {
          return {
            ...section,
            children: section.children?.filter(child => child.id !== sectionId)
          };
        }
        return section;
      });
      setNavigation(newNav);
      saveNavigationToStorage(newNav);
    } else {
      // Delete top-level section and all its children
      const section = navigation.find(s => s.id === sectionId);
      const idsToDelete = [sectionId, ...(section?.children?.map(c => c.id) || [])];
      
      const newNav = navigation.filter(s => s.id !== sectionId);
      setNavigation(newNav);
      saveNavigationToStorage(newNav);

      // Remove associated docs
      const newDocs = { ...docs };
      idsToDelete.forEach(id => delete newDocs[id]);
      setDocs(newDocs);
      saveDocsToStorage(newDocs);
    }

    // If deleted current section, switch to first available
    if (activeSection === sectionId) {
      const firstSection = navigation[0]?.children?.[0]?.id || navigation[0]?.id || "overview";
      setActiveSection(firstSection);
    }

    toast.success("Página excluída!");
  };

  const handleRenameSection = (sectionId: string, newTitle: string, parentId?: string) => {
    if (parentId) {
      const newNav = navigation.map(section => {
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
      setNavigation(newNav);
      saveNavigationToStorage(newNav);
    } else {
      const newNav = navigation.map(section => 
        section.id === sectionId ? { ...section, title: newTitle } : section
      );
      setNavigation(newNav);
      saveNavigationToStorage(newNav);
    }
    toast.success("Renomeado com sucesso!");
  };

  const getCurrentTitle = () => {
    for (const section of navigation) {
      if (section.id === activeSection) return section.title;
      const child = section.children?.find(c => c.id === activeSection);
      if (child) return child.title;
    }
    return "Documento";
  };

  return (
    <div className="min-h-screen bg-background">
      <DocHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
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
