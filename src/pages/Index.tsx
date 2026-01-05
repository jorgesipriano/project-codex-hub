import { useState } from "react";
import { DocHeader } from "@/components/docs/DocHeader";
import { Sidebar } from "@/components/docs/Sidebar";
import { DocContent } from "@/components/docs/DocContent";

const Index = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DocHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block">
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
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
                activeSection={activeSection} 
                onSectionChange={(section) => {
                  setActiveSection(section);
                  setSidebarOpen(false);
                }} 
              />
            </div>
          </>
        )}

        {/* Main Content */}
        <DocContent activeSection={activeSection} />
      </div>
    </div>
  );
};

export default Index;
