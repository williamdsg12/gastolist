import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FinanceProvider, useFinance } from '@/contexts/FinanceContext';
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
import { SplashScreen } from '@/components/SplashScreen';
import { AuthScreen } from '@/components/AuthScreen';
import { WidgetResumo } from '@/components/WidgetResumo';
import { ListaCompras } from '@/components/ListaCompras';
import { Wallet, Settings, Receipt, User, Calendar, LogOut } from 'lucide-react';
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
  compras: 'Lista de Compras',
};

function AppContent() {
  const { user, isLoading, signOut } = useFinance();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('finance-splash-seen');
    if (hasSeenSplash === 'true') {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('finance-splash-seen', 'true');
    setShowSplash(false);
  };

  const handleAuth = () => {
    // Auth is handled by the context
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Wallet className="w-12 h-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  return (
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
                <h1 className="text-lg font-bold text-foreground">Finanças & Compras</h1>
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
                    <Button 
                      variant="outline" 
                      className="w-full text-expense border-expense/30"
                      onClick={signOut}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair da Conta
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-lg mx-auto px-4 py-4 safe-bottom">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <WidgetResumo />
            <Dashboard />
          </div>
        )}
        {activeTab === 'entradas' && <Entradas />}
        {activeTab === 'gastos' && <Gastos />}
        {activeTab === 'contas' && <Contas />}
        {activeTab === 'metas' && <Metas />}
        {activeTab === 'perfil' && <Perfil />}
        {activeTab === 'historico' && <Historico />}
        {activeTab === 'config' && <Configuracoes />}
        {activeTab === 'compras' && <ListaCompras />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

const Index = () => {
  return (
    <ThemeProvider>
      <FinanceProvider>
        <AppContent />
      </FinanceProvider>
    </ThemeProvider>
  );
};

export default Index;
