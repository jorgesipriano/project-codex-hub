import { Book, Github, Menu, Moon, Sun } from "lucide-react";
import { useState } from "react";

interface DocHeaderProps {
  onMenuToggle?: () => void;
}

export function DocHeader({ onMenuToggle }: DocHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Book className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Documentação</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Meu Projeto</p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
