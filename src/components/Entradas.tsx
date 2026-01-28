import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MonthFilter } from '@/components/MonthFilter';
import { ReceiptScanner } from '@/components/ReceiptScanner';
import { Plus, Trash2, TrendingUp, FileImage, Pencil } from 'lucide-react';
import type { Entrada } from '@/types/finance';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function Entradas() {
  const { getEntradasFiltradas, addEntrada, deleteEntrada, updateEntrada, getCategoriasEntrada } = useFinance();
  const categoriasEntrada = getCategoriasEntrada();
  const [open, setOpen] = useState(false);
  const [editingEntrada, setEditingEntrada] = useState<Entrada | null>(null);
  const [form, setForm] = useState({
    data: new Date().toISOString().split('T')[0],
    descricao: '',
    valor: '',
    categoria: 'Salário',
    responsavel: 'William' as 'William' | 'Andressa',
  });

  const entradasFiltradas = getEntradasFiltradas();
  const total = entradasFiltradas.reduce((sum, e) => sum + e.valor, 0);

  const resetForm = () => {
    setForm({
      data: new Date().toISOString().split('T')[0],
      descricao: '',
      valor: '',
      categoria: 'Salário',
      responsavel: 'William',
    });
    setEditingEntrada(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.descricao || !form.valor) return;

    if (editingEntrada) {
      updateEntrada(editingEntrada.id, {
        data: form.data,
        descricao: form.descricao,
        valor: parseFloat(form.valor),
        categoria: form.categoria,
        responsavel: form.responsavel,
      });
    } else {
      addEntrada({
        data: form.data,
        descricao: form.descricao,
        valor: parseFloat(form.valor),
        categoria: form.categoria,
        responsavel: form.responsavel,
      });
    }

    resetForm();
    setOpen(false);
  };

  const handleEdit = (entrada: Entrada) => {
    setEditingEntrada(entrada);
    setForm({
      data: entrada.data,
      descricao: entrada.descricao,
      valor: entrada.valor.toString(),
      categoria: entrada.categoria,
      responsavel: entrada.responsavel,
    });
    setOpen(true);
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm();
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <MonthFilter />

      <Card className="income-gradient text-income-foreground shadow-card animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total de Entradas</p>
              <p className="text-2xl font-bold">{formatCurrency(total)}</p>
            </div>
            <TrendingUp className="w-10 h-10 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="flex-1 h-12 text-base font-semibold income-gradient hover:opacity-90 text-income-foreground shadow-card">
              <Plus className="w-5 h-5 mr-2" />
              Nova Entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-income" />
                {editingEntrada ? 'Editar Entrada' : 'Adicionar Entrada'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input id="descricao" placeholder="Ex: Salário mensal" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input id="valor" type="number" step="0.01" placeholder="0,00" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoriasEntrada.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Responsável</Label>
                <Select value={form.responsavel} onValueChange={(v) => setForm({ ...form, responsavel: v as 'William' | 'Andressa' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="William">William</SelectItem>
                    <SelectItem value="Andressa">Andressa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full income-gradient text-income-foreground">
                {editingEntrada ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        
        <ReceiptScanner 
          tipo="entrada"
          onResult={(data) => {
            setForm({
              data: data.data,
              descricao: data.descricao,
              valor: data.valor.toString(),
              categoria: categoriasEntrada.includes(data.categoria) ? data.categoria : 'Outros',
              responsavel: 'William',
            });
            setOpen(true);
          }}
          trigger={<Button variant="outline" size="icon" className="h-12 w-12"><FileImage className="w-5 h-5" /></Button>}
        />
      </div>

      <div className="space-y-2">
        {entradasFiltradas.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma entrada registrada</p>
            </CardContent>
          </Card>
        ) : (
          entradasFiltradas.map((entrada, index) => (
            <Card key={entrada.id} className="shadow-card animate-fade-in hover:shadow-card-hover transition-shadow" style={{ animationDelay: `${index * 0.05}s` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{entrada.descricao}</span>
                      <span className="text-xs px-2 py-0.5 bg-income-muted text-income rounded-full">{entrada.responsavel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(entrada.data).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>{entrada.categoria}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-income">{formatCurrency(entrada.valor)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEdit(entrada)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteEntrada(entrada.id)}>
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
