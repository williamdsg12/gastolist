import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

const CATEGORIAS_ENTRADA = ['Vendas', 'Encomendas', 'Outros'];
const CATEGORIAS_SAIDA = ['Ingredientes', 'Embalagens', 'Equipamentos', 'Aluguel', 'Energia', 'Água', 'Gás', 'Transporte', 'Marketing', 'Outros'];

export function FinanceiroModule({ data }: { data: any }) {
  const { financeiro, totalEntradas, totalSaidas, lucroLiquido, addFinanceiro, deleteFinanceiro } = data;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: 'entrada', categoria: 'Vendas', descricao: '', valor: '', data: new Date().toISOString().slice(0, 10) });

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSubmit = () => {
    if (!form.descricao || !form.valor) return;
    addFinanceiro({ tipo: form.tipo, categoria: form.categoria, descricao: form.descricao, valor: Number(form.valor), data: form.data });
    setForm({ tipo: 'entrada', categoria: 'Vendas', descricao: '', valor: '', data: new Date().toISOString().slice(0, 10) });
    setOpen(false);
  };

  const entradas = financeiro.filter((f: any) => f.tipo === 'entrada');
  const saidas = financeiro.filter((f: any) => f.tipo === 'saida');

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Receitas</p><p className="text-lg font-bold text-income">{fmt(totalEntradas)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Despesas</p><p className="text-lg font-bold text-expense">{fmt(totalSaidas)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Lucro</p><p className={`text-lg font-bold ${lucroLiquido >= 0 ? 'text-income' : 'text-expense'}`}>{fmt(lucroLiquido)}</p></CardContent></Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Registro</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Registro Financeiro</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v, categoria: v === 'entrada' ? 'Vendas' : 'Ingredientes' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(form.tipo === 'entrada' ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Descrição</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
                <div><Label>Data</Label><Input type="date" value={form.data} onChange={e => setForm({ ...form, data: e.target.value })} /></div>
              </div>
              <Button className="w-full" onClick={handleSubmit}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="todos">
        <TabsList className="w-full"><TabsTrigger value="todos" className="flex-1">Todos</TabsTrigger><TabsTrigger value="entradas" className="flex-1">Entradas</TabsTrigger><TabsTrigger value="saidas" className="flex-1">Saídas</TabsTrigger></TabsList>
        {['todos', 'entradas', 'saidas'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-2 mt-3">
            {(tab === 'todos' ? financeiro : tab === 'entradas' ? entradas : saidas).map((f: any) => (
              <Card key={f.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {f.tipo === 'entrada' ? <TrendingUp className="w-4 h-4 text-income flex-shrink-0" /> : <TrendingDown className="w-4 h-4 text-expense flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{f.descricao}</p>
                      <p className="text-xs text-muted-foreground">{f.categoria} • {new Date(f.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${f.tipo === 'entrada' ? 'text-income' : 'text-expense'}`}>
                      {f.tipo === 'entrada' ? '+' : '-'}{fmt(f.valor)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteFinanceiro(f.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(tab === 'todos' ? financeiro : tab === 'entradas' ? entradas : saidas).length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">Nenhum registro encontrado</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
