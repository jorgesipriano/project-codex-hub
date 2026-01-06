import { supabase } from "@/integrations/supabase/client";
import { NavItem } from "@/components/docs/Sidebar";

const DEFAULT_DOCS: Record<string, string> = {
  "overview": `# Visão Geral

Bem-vindo à documentação **doc two-jhey**! Este é o seu espaço para organizar todos os seus documentos, códigos e guias.

> [!TIP] Clique em "Editar" para personalizar esta página com seu próprio conteúdo.

## Como usar

- **Editar páginas**: Clique no botão "Editar" para modificar qualquer página
- **Adicionar seções**: Use o botão "+" na sidebar para criar novas páginas
- **Markdown**: Use sintaxe Markdown para formatar seu conteúdo

## Blocos de código

\`\`\`bash
# Seus comandos aqui
echo "Hello World"
\`\`\`
`,
};

const DEFAULT_NAVIGATION: NavItem[] = [
  {
    id: "intro",
    title: "Introdução",
    icon: "file",
    children: [
      { id: "overview", title: "Visão Geral" },
    ],
  },
];

export async function loadDocsFromDatabase(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from("documents")
    .select("id, content");

  if (error) {
    console.error("Error loading docs:", error);
    return DEFAULT_DOCS;
  }

  if (!data || data.length === 0) {
    // Initialize with defaults
    await initializeDefaultDocs();
    return DEFAULT_DOCS;
  }

  const docs: Record<string, string> = {};
  data.forEach((doc) => {
    docs[doc.id] = doc.content;
  });
  return docs;
}

async function initializeDefaultDocs() {
  const entries = Object.entries(DEFAULT_DOCS);
  for (const [id, content] of entries) {
    await supabase.from("documents").upsert({ id, content });
  }
}

export async function saveDocToDatabase(id: string, content: string) {
  const { error } = await supabase
    .from("documents")
    .upsert({ id, content });

  if (error) {
    console.error("Error saving doc:", error);
    throw error;
  }
}

export async function deleteDocFromDatabase(id: string) {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting doc:", error);
    throw error;
  }
}

export async function loadNavigationFromDatabase(): Promise<NavItem[]> {
  const { data, error } = await supabase
    .from("navigation")
    .select("structure")
    .limit(1)
    .single();

  if (error || !data) {
    // Initialize with defaults
    await saveNavigationToDatabase(DEFAULT_NAVIGATION);
    return DEFAULT_NAVIGATION;
  }

  return data.structure as unknown as NavItem[];
}

export async function saveNavigationToDatabase(navigation: NavItem[]) {
  // First check if there's existing navigation
  const { data: existing } = await supabase
    .from("navigation")
    .select("id")
    .limit(1)
    .single();

  const jsonNavigation = JSON.parse(JSON.stringify(navigation));

  if (existing) {
    const { error } = await supabase
      .from("navigation")
      .update({ structure: jsonNavigation })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating navigation:", error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from("navigation")
      .insert({ structure: jsonNavigation });

    if (error) {
      console.error("Error inserting navigation:", error);
      throw error;
    }
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
