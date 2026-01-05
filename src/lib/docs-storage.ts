import { NavItem } from "@/components/docs/Sidebar";

const DEFAULT_DOCS: Record<string, string> = {
  "overview": `# Visão Geral

Bem-vindo à sua documentação! Este é um espaço para organizar todos os seus documentos, códigos e guias do projeto.

> [!TIP] Clique em "Editar" para personalizar esta página com seu próprio conteúdo.

## Como usar

- **Editar páginas**: Clique no botão "Editar" para modificar qualquer página
- **Adicionar seções**: Use o botão "+" na sidebar para criar novas páginas
- **Organizar**: Arraste e reorganize suas seções conforme necessário
- **Markdown**: Use sintaxe Markdown para formatar seu conteúdo

## Sintaxe suportada

\`\`\`markdown
# Título 1
## Título 2
### Título 3

**texto em negrito**
*texto em itálico*
\`código inline\`

- Item de lista
- Outro item

> [!INFO] Alerta informativo
> [!TIP] Dica útil
> [!SUCCESS] Mensagem de sucesso
> [!WARNING] Aviso importante
\`\`\`

## Blocos de código

\`\`\`bash
# Seus comandos aqui
echo "Hello World"
\`\`\`
`,

  "tmux": `# Acessar TMUX

O TMUX é um multiplexador de terminal que permite executar várias sessões em uma única janela.

> [!TIP] O TMUX mantém suas sessões ativas mesmo após desconectar do SSH.

## Comandos Básicos

### Iniciar uma nova sessão

\`\`\`bash
# Criar nova sessão com nome
tmux new -s minha-sessao

# Criar sessão anônima
tmux new
\`\`\`

### Listar sessões ativas

\`\`\`bash
tmux ls
\`\`\`

### Anexar a uma sessão existente

\`\`\`bash
# Anexar por nome
tmux attach -t minha-sessao

# Anexar à última sessão
tmux attach
\`\`\`

## Atalhos de Teclado

Todos começam com \`Ctrl + B\`:

- \`Ctrl+B D\` - Desanexar da sessão
- \`Ctrl+B C\` - Criar nova janela
- \`Ctrl+B N\` - Próxima janela
- \`Ctrl+B P\` - Janela anterior
- \`Ctrl+B %\` - Dividir verticalmente
- \`Ctrl+B "\` - Dividir horizontalmente

## Configuração

\`\`\`bash
# ~/.tmux.conf
set -g mouse on
set -g base-index 1
set -g default-terminal "screen-256color"
\`\`\`

> [!SUCCESS] Recarregue com: \`tmux source-file ~/.tmux.conf\`
`,

  "quickstart": `# Início Rápido

Siga estes passos para configurar o ambiente rapidamente.

## 1. Clonar o Repositório

\`\`\`bash
git clone https://github.com/seu-usuario/seu-projeto.git
cd seu-projeto
\`\`\`

## 2. Instalar Dependências

\`\`\`bash
npm install
\`\`\`

## 3. Configurar Variáveis

\`\`\`bash
cp .env.example .env.local
\`\`\`

## 4. Iniciar

\`\`\`bash
npm run dev
\`\`\`

> [!SUCCESS] Servidor disponível em http://localhost:3000
`,
};

const DEFAULT_NAVIGATION: NavItem[] = [
  {
    id: "intro",
    title: "Introdução",
    icon: "file",
    children: [
      { id: "overview", title: "Visão Geral" },
      { id: "quickstart", title: "Início Rápido" },
    ],
  },
  {
    id: "terminal",
    title: "Terminal & CLI",
    icon: "terminal",
    children: [
      { id: "tmux", title: "Acessar TMUX" },
      { id: "ssh", title: "SSH & Conexões" },
    ],
  },
  {
    id: "code",
    title: "Código",
    icon: "code",
    children: [
      { id: "structure", title: "Estrutura do Projeto" },
      { id: "components", title: "Componentes" },
    ],
  },
];

const STORAGE_KEY = "docs-content";
const NAV_STORAGE_KEY = "docs-navigation";

export function loadDocsFromStorage(): Record<string, string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_DOCS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error("Error loading docs:", e);
  }
  return DEFAULT_DOCS;
}

export function saveDocsToStorage(docs: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch (e) {
    console.error("Error saving docs:", e);
  }
}

export function loadNavigationFromStorage(): NavItem[] {
  try {
    const stored = localStorage.getItem(NAV_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading navigation:", e);
  }
  return DEFAULT_NAVIGATION;
}

export function saveNavigationToStorage(navigation: NavItem[]) {
  try {
    localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify(navigation));
  } catch (e) {
    console.error("Error saving navigation:", e);
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
