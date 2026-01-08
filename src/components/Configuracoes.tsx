import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Settings, Download, Upload, Trash2, FileDown, Shield } from 'lucide-react';
import { toast } from 'sonner';

export function Configuracoes() {
  const { entradas, gastos, contas } = useFinance();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const exportData = () => {
    const data = {
      entradas,
      gastos,
      contas,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso!');
  };

  const exportCSV = () => {
    // Export gastos as CSV
    const headers = ['Data', 'Descrição', 'Valor', 'Categoria', 'Responsável', 'Pago', 'Mês'];
    const rows = gastos.map(g => [
      g.data,
      g.descricao,
      g.valor.toString(),
      g.categoria,
      g.responsavel,
      g.pago ? 'Sim' : 'Não',
      g.mes
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gastos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exportado com sucesso!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.entradas) localStorage.setItem('entradas', JSON.stringify(data.entradas));
        if (data.gastos) localStorage.setItem('gastos', JSON.stringify(data.gastos));
        if (data.contas) localStorage.setItem('contas', JSON.stringify(data.contas));
        toast.success('Dados importados! Recarregue a página.');
        window.location.reload();
      } catch {
        toast.error('Erro ao importar arquivo');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    localStorage.removeItem('entradas');
    localStorage.removeItem('gastos');
    localStorage.removeItem('contas');
    toast.success('Todos os dados foram apagados');
    window.location.reload();
  };

  const handleSetPin = () => {
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      toast.error('O PIN deve ter 4 dígitos');
      return;
    }
    if (pin !== confirmPin) {
      toast.error('Os PINs não coincidem');
      return;
    }
    localStorage.setItem('finance-pin', pin);
    toast.success('PIN configurado com sucesso!');
    setPinDialogOpen(false);
    setPin('');
    setConfirmPin('');
  };

  const removePin = () => {
    localStorage.removeItem('finance-pin');
    toast.success('PIN removido');
  };

  const hasPin = !!localStorage.getItem('finance-pin');

  return (
    <div className="space-y-4 pb-4">
      <Card className="shadow-card animate-fade-in">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-secondary rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-income">{entradas.length}</p>
              <p className="text-xs text-muted-foreground">Entradas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-expense">{gastos.length}</p>
              <p className="text-xs text-muted-foreground">Gastos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-bills">{contas.length}</p>
              <p className="text-xs text-muted-foreground">Contas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                {hasPin ? 'Alterar PIN' : 'Configurar PIN'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurar PIN de acesso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN (4 dígitos)</Label>
                  <Input
                    id="pin"
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPin">Confirmar PIN</Label>
                  <Input
                    id="confirmPin"
                    type="password"
                    maxLength={4}
                    placeholder="••••"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSetPin} className="w-full">Salvar PIN</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {hasPin && (
            <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={removePin}>
              Remover PIN
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Export/Import */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="w-4 h-4" />
            Backup e Exportação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Backup (JSON)
          </Button>
          
          <Button variant="outline" className="w-full justify-start" onClick={exportCSV}>
            <FileDown className="w-4 h-4 mr-2" />
            Exportar Gastos (CSV)
          </Button>

          <div className="relative">
            <Button variant="outline" className="w-full justify-start">
              <Upload className="w-4 h-4 mr-2" />
              Importar Backup
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-card border-destructive/30 animate-fade-in" style={{ animationDelay: '0.15s' }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 className="w-4 h-4" />
            Zona de Perigo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Apagar Todos os Dados
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tem certeza?</DialogTitle>
              </DialogHeader>
              <p className="text-muted-foreground">
                Esta ação não pode ser desfeita. Todos os dados de entradas, gastos e contas serão permanentemente deletados.
              </p>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="destructive" onClick={clearAllData}>
                  Apagar Tudo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground pt-4">
        Gestão Financeira v1.0 • William & Andressa
      </p>
    </div>
  );
}
