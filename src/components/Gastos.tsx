import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { MonthFilter } from '@/components/MonthFilter';
import { CATEGORIAS_GASTO } from '@/types/finance';
import { Plus, Trash2, TrendingDown, Check } from 'lucide-react';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function Gastos() {
  const { getGastosFiltrados, addGasto, deleteGasto, updateGasto } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    valor: '',
    categoria: 'Alimentação',
    responsavel: 'William' as 'William' | 'Andressa',
    pago: true,
  });

  const gastosFiltrados = getGastosFiltrados();
  const total = gastosFiltrados.reduce((sum, g) => sum + g.valor, 0);
  const totalPago = gastosFiltrados.filter(g => g.pago).reduce((sum, g) => sum + g.valor, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor) return;

    addGasto({
      data: form.data,
      descricao: form.descricao,
      valor: parseFloat(form.valor),
      categoria: form.categoria,
      responsavel: form.responsavel,
      pago: form.pago,
    });

    setForm({
      data: new Date().toISOString().split('T')[0],
      descricao: '',
      valor: '',
      categoria: 'Alimentação',
      responsavel: 'William',
      pago: true,
    });
    setOpen(false);
  };

  return (
    <div className="space-y-4 pb-4">
      <MonthFilter />

      {/* Total Card */}
      <Card className="expense-gradient text-expense-foreground shadow-card animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total de Gastos</p>
              <p className="text-2xl font-bold">{formatCurrency(total)}</p>
              <p className="text-sm opacity-80">Pago: {formatCurrency(totalPago)}</p>
            </div>
            <TrendingDown className="w-10 h-10 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Add Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-12 text-base font-semibold expense-gradient hover:opacity-90 text-expense-foreground shadow-card">
            <Plus className="w-5 h-5 mr-2" />
            Novo Gasto
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-expense" />
              Adicionar Gasto
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                placeholder="Ex: Supermercado"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
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
              <Label>Categoria</Label>
              <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_GASTO.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            <div className="flex items-center gap-2">
              <Checkbox 
                id="pago" 
                checked={form.pago}
                onCheckedChange={(checked) => setForm({ ...form, pago: !!checked })}
              />
              <Label htmlFor="pago" className="text-sm">Já foi pago</Label>
            </div>
            <Button type="submit" className="w-full expense-gradient text-expense-foreground">
              Adicionar
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* List */}
      <div className="space-y-2">
        {gastosFiltrados.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center text-muted-foreground">
              <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhum gasto registrado</p>
            </CardContent>
          </Card>
        ) : (
          gastosFiltrados.map((gasto, index) => (
            <Card 
              key={gasto.id} 
              className="shadow-card animate-fade-in hover:shadow-card-hover transition-shadow"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateGasto(gasto.id, { pago: !gasto.pago })}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        gasto.pago 
                          ? 'bg-income border-income text-income-foreground' 
                          : 'border-muted-foreground'
                      }`}
                    >
                      {gasto.pago && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${gasto.pago ? 'line-through opacity-60' : ''}`}>
                          {gasto.descricao}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-expense-muted text-expense rounded-full">
                          {gasto.responsavel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(gasto.data).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{gasto.categoria}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-expense ${gasto.pago ? 'opacity-60' : ''}`}>
                      {formatCurrency(gasto.valor)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteGasto(gasto.id)}
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
