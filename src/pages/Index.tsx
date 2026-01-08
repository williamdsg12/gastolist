import { useState, useEffect } from 'react';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/components/Dashboard';
import { Entradas } from '@/components/Entradas';
import { Gastos } from '@/components/Gastos';
import { Contas } from '@/components/Contas';
import { Configuracoes } from '@/components/Configuracoes';
import { PinLockScreen } from '@/components/PinLockScreen';
import { Wallet } from 'lucide-react';

type Tab = 'dashboard' | 'entradas' | 'gastos' | 'contas' | 'config';

const tabTitles: Record<Tab, string> = {
  dashboard: 'Resumo Mensal',
  entradas: 'Entradas',
  gastos: 'Gastos',
  contas: 'Contas a Pagar',
  config: 'Configurações',
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if PIN is set - if not, we'll show the setup screen
    // Check session storage for current session unlock status
    const sessionUnlocked = sessionStorage.getItem('finance-unlocked');
    const hasPin = localStorage.getItem('finance-pin');
    
    if (sessionUnlocked === 'true') {
      setIsUnlocked(true);
    } else if (!hasPin) {
      // No PIN set, will show setup screen via PinLockScreen
      setIsUnlocked(false);
    }
    
    setIsLoading(false);
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem('finance-unlocked', 'true');
    setIsUnlocked(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Wallet className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return <PinLockScreen onUnlock={handleUnlock} />;
  }

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
          <div className="container max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Finanças</h1>
                <p className="text-xs text-muted-foreground">{tabTitles[activeTab]}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container max-w-lg mx-auto px-4 py-4 safe-bottom">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'entradas' && <Entradas />}
          {activeTab === 'gastos' && <Gastos />}
          {activeTab === 'contas' && <Contas />}
          {activeTab === 'config' && <Configuracoes />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </FinanceProvider>
  );
};

export default Index;
