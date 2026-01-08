import { useState, useEffect } from 'react';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { BottomNav } from '@/components/BottomNav';
import { Dashboard } from '@/components/Dashboard';
import { Entradas } from '@/components/Entradas';
import { Gastos } from '@/components/Gastos';
import { Contas } from '@/components/Contas';
import { Configuracoes } from '@/components/Configuracoes';
import { Metas } from '@/components/Metas';
import { Perfil } from '@/components/Perfil';
import { Historico } from '@/components/Historico';
import { ResumoSemanal } from '@/components/ResumoSemanal';
import { Notificacoes } from '@/components/Notificacoes';
import { GerenciarCategorias } from '@/components/GerenciarCategorias';
import { PinLockScreen } from '@/components/PinLockScreen';
import { Wallet, Settings, Receipt, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { Tab } from '@/components/BottomNav';

const tabTitles: Record<Tab, string> = {
  dashboard: 'Resumo Mensal',
  entradas: 'Entradas',
  gastos: 'Gastos',
  contas: 'Contas a Pagar',
  metas: 'Metas Financeiras',
  perfil: 'Perfil Individual',
  historico: 'Histórico Anual',
  config: 'Configurações',
};

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionUnlocked = sessionStorage.getItem('finance-unlocked');
    const hasPin = localStorage.getItem('finance-pin');
    
    if (sessionUnlocked === 'true') {
      setIsUnlocked(true);
    } else if (!hasPin) {
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Finanças</h1>
                  <p className="text-xs text-muted-foreground">{tabTitles[activeTab]}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Notificacoes />
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle>Resumo Semanal</SheetTitle>
                    </SheetHeader>
                    <div className="pt-4">
                      <ResumoSemanal />
                    </div>
                  </SheetContent>
                </Sheet>
                <Button
                  variant="ghost"
                  size="icon"
                  className={activeTab === 'contas' ? 'text-bills' : 'text-muted-foreground'}
                  onClick={() => setActiveTab('contas')}
                >
                  <Receipt className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={activeTab === 'perfil' ? 'text-bills' : 'text-muted-foreground'}
                  onClick={() => setActiveTab('perfil')}
                >
                  <User className="w-5 h-5" />
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground">
                      <Settings className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                    <div className="pt-6 space-y-6">
                      <GerenciarCategorias />
                      <Configuracoes />
                    </div>
                  </SheetContent>
                </Sheet>
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
          {activeTab === 'metas' && <Metas />}
          {activeTab === 'perfil' && <Perfil />}
          {activeTab === 'historico' && <Historico />}
          {activeTab === 'config' && <Configuracoes />}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </FinanceProvider>
  );
};

export default Index;