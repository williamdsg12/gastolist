import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { useConfeitariaData } from '@/hooks/useConfeitariaData';
import { ConfeitariaDashboard } from './ConfeitariaDashboard';
import { EstoqueModule } from './EstoqueModule';
import { FinanceiroModule } from './FinanceiroModule';
import { NotaFiscalModule } from './NotaFiscalModule';
import { PrecificacaoModule } from './PrecificacaoModule';
import { ProdutosModule } from './ProdutosModule';
import { FornecedoresModule } from './FornecedoresModule';
import { RelatoriosModule } from './RelatoriosModule';
import {
  LayoutDashboard, Package, DollarSign, FileText, Calculator,
  ShoppingBag, Truck, BarChart3, Menu, X, ArrowLeft, LogOut, ChefHat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Page = 'dashboard' | 'estoque' | 'financeiro' | 'notas' | 'precificacao' | 'produtos' | 'fornecedores' | 'relatorios';

const menuItems: { id: Page; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'estoque', label: 'Estoque', icon: Package },
  { id: 'notas', label: 'Nota Fiscal (IA)', icon: FileText },
  { id: 'precificacao', label: 'Precificação', icon: Calculator },
  { id: 'produtos', label: 'Produtos', icon: ShoppingBag },
  { id: 'fornecedores', label: 'Fornecedores', icon: Truck },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
];

interface Props {
  onBack: () => void;
}

export function ConfeitariaLayout({ onBack }: Props) {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useFinance();
  const data = useConfeitariaData();

  const currentPageLabel = menuItems.find(m => m.id === activePage)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar fixed h-full z-30">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sidebar-primary">
              <ChefHat className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-base">Confeitaria</h1>
              <p className="text-xs text-muted-foreground">Gestão Inteligente</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                activePage === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <button onClick={onBack} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50">
            <ArrowLeft className="w-4 h-4" />
            Finanças Pessoais
          </button>
          <button onClick={signOut} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/20" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
            <div className="p-5 border-b border-sidebar-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sidebar-primary">
                  <ChefHat className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <h1 className="font-bold text-sidebar-foreground">Confeitaria</h1>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activePage === item.id
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="p-3 border-t border-sidebar-border space-y-1">
              <button onClick={onBack} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50">
                <ArrowLeft className="w-4 h-4" />
                Finanças Pessoais
              </button>
              <button onClick={signOut} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10">
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-card border-b border-border h-14 flex items-center px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold text-foreground">{currentPageLabel}</h2>
        </header>

        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          {activePage === 'dashboard' && <ConfeitariaDashboard data={data} />}
          {activePage === 'estoque' && <EstoqueModule data={data} />}
          {activePage === 'financeiro' && <FinanceiroModule data={data} />}
          {activePage === 'notas' && <NotaFiscalModule data={data} />}
          {activePage === 'precificacao' && <PrecificacaoModule data={data} />}
          {activePage === 'produtos' && <ProdutosModule data={data} />}
          {activePage === 'fornecedores' && <FornecedoresModule data={data} />}
          {activePage === 'relatorios' && <RelatoriosModule data={data} />}
        </main>
      </div>
    </div>
  );
}
