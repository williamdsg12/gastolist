import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MonthFilter } from '@/components/MonthFilter';
import { Plus, Trash2, Receipt, Check, AlertCircle } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function Contas() {
  const { getContasFiltradas, addConta, deleteConta, toggleContaPaga } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    conta: '',
    valor: '',
    vencimento: new Date().toISOString().split('T')[0],
    responsavel: 'William' as 'William' | 'Andressa',
  });

  const contasFiltradas = getContasFiltradas();
  const total = contasFiltradas.reduce((sum, c) => sum + c.valor, 0);
  const totalPago = contasFiltradas.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0);
  const totalPendente = contasFiltradas.filter(c => !c.pago).reduce((sum, c) => sum + c.valor, 0);
  const contasPagas = contasFiltradas.filter(c => c.pago).length;
  const contasPendentes = contasFiltradas.filter(c => !c.pago).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.conta || !form.valor) return;

    addConta({
      conta: form.conta,
      valor: parseFloat(form.valor),
      vencimento: form.vencimento,
      pago: false,
      responsavel: form.responsavel,
    });

    setForm({
      conta: '',
      valor: '',
      vencimento: new Date().toISOString().split('T')[0],
      responsavel: 'William',
    });
    setOpen(false);
  };

  const isOverdue = (vencimento: string, pago: boolean) => {
    if (pago) return false;
    return new Date(vencimento) < new Date();
  };

  return (
    <div className="space-y-4 pb-4">
      <MonthFilter />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bills-gradient text-bills-foreground shadow-card animate-fade-in">
          <CardContent className="p-4">
            <p className="text-xs opacity-90">Total</p>
            <p className="text-xl font-bold">{formatCurrency(total)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pagas</p>
                <p className="text-lg font-bold text-income">{contasPagas}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Pendentes</p>
                <p className="text-lg font-bold text-expense">{contasPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Amount Alert */}
      {totalPendente > 0 && (
        <Card className="border-warning/50 bg-warning/5 shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm font-medium">Valor pendente</p>
              <p className="text-lg font-bold text-warning">{formatCurrency(totalPendente)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-12 text-base font-semibold bills-gradient hover:opacity-90 text-bills-foreground shadow-card">
            <Plus className="w-5 h-5 mr-2" />
            Nova Conta
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-bills" />
              Adicionar Conta
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conta">Nome da Conta</Label>
              <Input
                id="conta"
                placeholder="Ex: Energia, Internet, Aluguel"
                value={form.conta}
                onChange={(e) => setForm({ ...form, conta: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vencimento">Vencimento</Label>
              <Input
                id="vencimento"
                type="date"
                value={form.vencimento}
                onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select value={form.responsavel} onValueChange={(v) => setForm({ ...form, responsavel: v as 'William' | 'Andressa' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="William">William</SelectItem>
                  <SelectItem value="Andressa">Andressa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bills-gradient text-bills-foreground">
              Adicionar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* List */}
      <div className="space-y-2">
        {contasFiltradas.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma conta registrada</p>
            </CardContent>
          </Card>
        ) : (
          contasFiltradas.map((conta, index) => (
            <Card 
              key={conta.id} 
              className={`shadow-card animate-fade-in hover:shadow-card-hover transition-shadow ${
                isOverdue(conta.vencimento, conta.pago) ? 'border-expense/50' : ''
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleContaPaga(conta.id)}
                      className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                        conta.pago 
                          ? 'bg-income border-income text-income-foreground' 
                          : isOverdue(conta.vencimento, conta.pago)
                            ? 'border-expense'
                            : 'border-muted-foreground'
                      }`}
                    >
                      {conta.pago && <Check className="w-4 h-4" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${conta.pago ? 'line-through opacity-60' : ''}`}>
                          {conta.conta}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-bills-muted text-bills rounded-full">
                          {conta.responsavel}
                        </span>
                        {isOverdue(conta.vencimento, conta.pago) && (
                          <span className="text-xs px-2 py-0.5 bg-expense-muted text-expense rounded-full">
                            Vencida
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Vence: {new Date(conta.vencimento).toLocaleDateString('pt-BR')}</span>
                        {conta.pago && conta.dataPagamento && (
                          <>
                            <span>•</span>
                            <span className="text-income">Pago em {new Date(conta.dataPagamento).toLocaleDateString('pt-BR')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-bills ${conta.pago ? 'opacity-60' : ''}`}>
                      {formatCurrency(conta.valor)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteConta(conta.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
