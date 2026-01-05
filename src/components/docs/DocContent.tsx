import { CodeBlock } from "./CodeBlock";
import { Breadcrumb } from "./Breadcrumb";
import { AlertCircle, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocContentProps {
  activeSection: string;
}

interface AlertProps {
  type: "info" | "success" | "warning" | "tip";
  children: React.ReactNode;
}

function Alert({ type, children }: AlertProps) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    success: "bg-green-500/10 border-green-500/30 text-green-400",
    warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
    tip: "bg-primary/10 border-primary/30 text-primary",
  };

  const icons = {
    info: <Info className="w-5 h-5" />,
    success: <CheckCircle2 className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    tip: <Lightbulb className="w-5 h-5" />,
  };

  return (
    <div className={cn("flex gap-3 p-4 rounded-lg border my-4", styles[type])}>
      {icons[type]}
      <div className="text-sm">{children}</div>
    </div>
  );
}

const contentSections: Record<string, React.ReactNode> = {
  overview: (
    <div className="doc-prose animate-fade-in">
      <h1>Visão Geral</h1>
      <p>
        Bem-vindo à documentação do projeto! Este guia completo irá ajudá-lo a entender
        a estrutura, configuração e uso de todas as funcionalidades disponíveis.
      </p>
      
      <Alert type="info">
        Esta documentação é atualizada regularmente. Verifique a versão para garantir
        que está usando as informações mais recentes.
      </Alert>

      <h2>Recursos Principais</h2>
      <ul>
        <li>Gerenciamento completo de sessões TMUX</li>
        <li>Scripts de automação para deploy</li>
        <li>Configuração de ambiente de desenvolvimento</li>
        <li>Integração com banco de dados</li>
        <li>APIs RESTful documentadas</li>
      </ul>

      <h2>Requisitos do Sistema</h2>
      <p>Antes de começar, certifique-se de ter instalado:</p>
      
      <CodeBlock
        language="bash"
        code={`# Verificar versões instaladas
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
git --version     # >= 2.30.0`}
      />
    </div>
  ),

  tmux: (
    <div className="doc-prose animate-fade-in">
      <h1>Acessar TMUX</h1>
      <p>
        O TMUX é um multiplexador de terminal que permite executar várias sessões
        em uma única janela. Ideal para gerenciar processos em servidores remotos.
      </p>

      <Alert type="tip">
        O TMUX mantém suas sessões ativas mesmo após desconectar do SSH, 
        permitindo retomar o trabalho exatamente de onde parou.
      </Alert>

      <h2>Comandos Básicos</h2>
      
      <h3>Iniciar uma nova sessão</h3>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`# Criar nova sessão com nome
tmux new -s minha-sessao

# Criar sessão anônima
tmux new`}
      />

      <h3>Listar sessões ativas</h3>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`# Listar todas as sessões
tmux ls

# Exemplo de saída:
# dev: 3 windows (created Mon Jan 5 10:00:00 2026)
# server: 1 windows (created Mon Jan 5 09:30:00 2026)`}
      />

      <h3>Anexar a uma sessão existente</h3>
      <CodeBlock
        language="bash"
        filename="terminal"
        code={`# Anexar por nome
tmux attach -t minha-sessao

# Anexar à última sessão
tmux attach

# Forçar desanexar outros clientes
tmux attach -dt minha-sessao`}
      />

      <h2>Atalhos de Teclado</h2>
      <p>
        Todos os atalhos começam com o prefixo <code className="px-1.5 py-0.5 bg-secondary rounded text-primary">Ctrl + B</code>
      </p>

      <div className="overflow-x-auto my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-foreground">Atalho</th>
              <th className="text-left py-2 text-foreground">Ação</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2"><code className="text-primary">Ctrl+B D</code></td>
              <td className="py-2">Desanexar da sessão</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2"><code className="text-primary">Ctrl+B C</code></td>
              <td className="py-2">Criar nova janela</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2"><code className="text-primary">Ctrl+B N</code></td>
              <td className="py-2">Próxima janela</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2"><code className="text-primary">Ctrl+B P</code></td>
              <td className="py-2">Janela anterior</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2"><code className="text-primary">Ctrl+B %</code></td>
              <td className="py-2">Dividir painel verticalmente</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2"><code className="text-primary">Ctrl+B "</code></td>
              <td className="py-2">Dividir painel horizontalmente</td>
            </tr>
            <tr>
              <td className="py-2"><code className="text-primary">Ctrl+B X</code></td>
              <td className="py-2">Fechar painel atual</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Configuração Personalizada</h2>
      <p>Crie ou edite o arquivo <code>~/.tmux.conf</code> para personalizar:</p>
      
      <CodeBlock
        language="bash"
        filename="~/.tmux.conf"
        code={`# Alterar prefixo para Ctrl+A
unbind C-b
set -g prefix C-a
bind C-a send-prefix

# Habilitar mouse
set -g mouse on

# Iniciar janelas e painéis em 1
set -g base-index 1
setw -g pane-base-index 1

# Melhorar cores
set -g default-terminal "screen-256color"

# Status bar personalizada
set -g status-bg '#1a1b26'
set -g status-fg '#a9b1d6'`}
      />

      <Alert type="success">
        Após editar o arquivo de configuração, recarregue com:
        <code className="ml-2 px-2 py-0.5 bg-secondary rounded">tmux source-file ~/.tmux.conf</code>
      </Alert>
    </div>
  ),

  quickstart: (
    <div className="doc-prose animate-fade-in">
      <h1>Início Rápido</h1>
      <p>
        Siga estes passos para configurar o ambiente de desenvolvimento rapidamente.
      </p>

      <h2>1. Clonar o Repositório</h2>
      <CodeBlock
        language="bash"
        code={`git clone https://github.com/seu-usuario/seu-projeto.git
cd seu-projeto`}
      />

      <h2>2. Instalar Dependências</h2>
      <CodeBlock
        language="bash"
        code={`npm install
# ou
yarn install`}
      />

      <h2>3. Configurar Variáveis de Ambiente</h2>
      <CodeBlock
        language="bash"
        filename=".env.local"
        code={`DATABASE_URL="postgresql://user:pass@localhost:5432/db"
API_KEY="sua-chave-api"
NODE_ENV="development"`}
      />

      <h2>4. Iniciar o Servidor</h2>
      <CodeBlock
        language="bash"
        code={`npm run dev`}
      />

      <Alert type="success">
        O servidor estará disponível em <code>http://localhost:3000</code>
      </Alert>
    </div>
  ),

  "basic-commands": (
    <div className="doc-prose animate-fade-in">
      <h1>Comandos Básicos do Terminal</h1>
      <p>
        Referência rápida dos comandos mais utilizados no dia a dia.
      </p>

      <h2>Navegação de Arquivos</h2>
      <CodeBlock
        language="bash"
        code={`# Listar arquivos
ls -la

# Mudar diretório
cd /caminho/para/pasta

# Voltar um diretório
cd ..

# Ir para home
cd ~

# Ver diretório atual
pwd`}
      />

      <h2>Manipulação de Arquivos</h2>
      <CodeBlock
        language="bash"
        code={`# Criar arquivo
touch arquivo.txt

# Criar diretório
mkdir nova-pasta

# Copiar arquivo
cp origem.txt destino.txt

# Mover/Renomear
mv arquivo.txt novo-nome.txt

# Remover arquivo
rm arquivo.txt

# Remover diretório
rm -rf pasta/`}
      />

      <h2>Visualização de Conteúdo</h2>
      <CodeBlock
        language="bash"
        code={`# Ver conteúdo completo
cat arquivo.txt

# Paginar conteúdo
less arquivo.txt

# Primeiras linhas
head -n 20 arquivo.txt

# Últimas linhas
tail -n 20 arquivo.txt

# Monitorar em tempo real
tail -f logs/app.log`}
      />

      <Alert type="tip">
        Use <code>Tab</code> para autocompletar nomes de arquivos e diretórios!
      </Alert>
    </div>
  ),

  "project-structure": (
    <div className="doc-prose animate-fade-in">
      <h1>Estrutura do Projeto</h1>
      <p>
        Visão geral da organização de diretórios e arquivos do projeto.
      </p>

      <CodeBlock
        language="text"
        filename="Estrutura"
        showLineNumbers={false}
        code={`📦 meu-projeto/
├── 📂 src/
│   ├── 📂 components/     # Componentes reutilizáveis
│   │   ├── 📂 ui/         # Componentes base (botões, inputs)
│   │   └── 📂 features/   # Componentes específicos
│   ├── 📂 pages/          # Páginas da aplicação
│   ├── 📂 hooks/          # Custom hooks
│   ├── 📂 lib/            # Utilitários e helpers
│   ├── 📂 services/       # Chamadas de API
│   ├── 📂 types/          # Definições TypeScript
│   └── 📄 main.tsx        # Ponto de entrada
├── 📂 public/             # Assets estáticos
├── 📂 tests/              # Testes
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 README.md`}
      />

      <h2>Convenções de Nomenclatura</h2>
      <ul>
        <li><strong>Componentes:</strong> PascalCase (ex: UserProfile.tsx)</li>
        <li><strong>Hooks:</strong> camelCase com prefixo use (ex: useAuth.ts)</li>
        <li><strong>Utilitários:</strong> camelCase (ex: formatDate.ts)</li>
        <li><strong>Tipos:</strong> PascalCase (ex: User.ts)</li>
      </ul>
    </div>
  ),
};

export function DocContent({ activeSection }: DocContentProps) {
  const content = contentSections[activeSection] || contentSections.overview;
  
  const getBreadcrumbItems = () => {
    const titles: Record<string, string> = {
      overview: "Visão Geral",
      quickstart: "Início Rápido",
      tmux: "Acessar TMUX",
      "basic-commands": "Comandos Básicos",
      "project-structure": "Estrutura do Projeto",
    };
    
    return [
      { label: "Docs" },
      { label: titles[activeSection] || "Documentação" },
    ];
  };

  return (
    <main className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Breadcrumb items={getBreadcrumbItems()} />
        {content}
        
        {/* Footer navigation */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Última atualização: 5 de Janeiro, 2026
          </div>
          <a 
            href="#" 
            className="text-primary hover:underline flex items-center gap-1"
          >
            Editar esta página →
          </a>
        </div>
      </div>
    </main>
  );
}
