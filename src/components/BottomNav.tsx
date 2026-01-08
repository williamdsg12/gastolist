import { LayoutDashboard, TrendingUp, TrendingDown, Target, History, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'dashboard' | 'entradas' | 'gastos' | 'contas' | 'metas' | 'perfil' | 'historico' | 'config' | 'compras';

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems = [
  { id: 'dashboard' as Tab, label: 'Resumo', icon: LayoutDashboard },
  { id: 'entradas' as Tab, label: 'Entradas', icon: TrendingUp },
  { id: 'gastos' as Tab, label: 'Gastos', icon: TrendingDown },
  { id: 'compras' as Tab, label: 'Compras', icon: ShoppingCart },
  { id: 'metas' as Tab, label: 'Metas', icon: Target },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-nav z-50">
      <div className="flex items-center justify-around py-1.5 px-1 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-1.5 rounded-lg transition-all duration-200",
                "min-w-[48px]",
                isActive && item.id === 'entradas' && "text-income",
                isActive && item.id === 'gastos' && "text-expense",
                isActive && item.id === 'metas' && "text-primary",
                isActive && item.id === 'compras' && "text-income",
                isActive && item.id === 'historico' && "text-primary",
                isActive && item.id === 'dashboard' && "text-primary",
                !isActive && "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 mb-0.5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[9px] font-medium leading-tight",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
