import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, ShoppingBag, Pencil, Trash2, Tag } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function ProdutosModule({ data }: { data: any }) {
  const { produtos, receitas, ingredientes, estoque, addProduto, updateProduto, deleteProduto } = data;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ nome: '', receita_id: '', margem_lucro: '50', preco_venda: '', ativo: true });

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getCustoReceita = (receitaId: string) => {
    const ings = ingredientes.filter((i: any) => i.receita_id === receitaId);
    return ings.reduce((total: number, ing: any) => {
      const item = estoque.find((e: any) => e.id === ing.estoque_id);
      return total + (item ? ing.quantidade * item.custo_medio : 0);
    }, 0);
  };

  const calcPrecoSugerido = (receitaId: string, margem: number) => {
    if (!receitaId) return 0;
    const receita = receitas.find((r: any) => r.id === receitaId);
    if (!receita) return 0;
    const custoTotal = getCustoReceita(receitaId);
    const custoPorUnidade = receita.rendimento > 0 ? custoTotal / receita.rendimento : custoTotal;
    return custoPorUnidade * (1 + margem / 100);
  };

  const handleReceitaChange = (receitaId: string) => {
    const preco = calcPrecoSugerido(receitaId, Number(form.margem_lucro));
    setForm({ ...form, receita_id: receitaId, preco_venda: preco.toFixed(2) });
  };

  const handleMargemChange = (margem: string) => {
    const preco = calcPrecoSugerido(form.receita_id, Number(margem));
    setForm({ ...form, margem_lucro: margem, preco_venda: preco.toFixed(2) });
  };

  const handleSubmit = () => {
    if (!form.nome) return;
    const custoTotal = form.receita_id ? getCustoReceita(form.receita_id) : 0;
    const receita = receitas.find((r: any) => r.id === form.receita_id);
    const custoPorUnidade = receita && receita.rendimento > 0 ? custoTotal / receita.rendimento : custoTotal;
    
    const payload = {
      nome: form.nome,
      receita_id: form.receita_id || null,
      margem_lucro: Number(form.margem_lucro),
      preco_venda: Number(form.preco_venda),
      custo_total: custoPorUnidade,
      ativo: form.ativo,
    };
    if (editing) { updateProduto(editing.id, payload); }
    else { addProduto(payload); }
    setForm({ nome: '', receita_id: '', margem_lucro: '50', preco_venda: '', ativo: true });
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({ nome: p.nome, receita_id: p.receita_id || '', margem_lucro: String(p.margem_lucro), preco_venda: String(p.preco_venda), ativo: p.ativo });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Produtos para venda com margem de lucro</p>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm({ nome: '', receita_id: '', margem_lucro: '50', preco_venda: '', ativo: true }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Produto</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome do Produto</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Bolo de Pote de Brigadeiro" /></div>
              <div>
                <Label>Receita Vinculada</Label>
                <Select value={form.receita_id} onValueChange={handleReceitaChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione uma receita (opcional)" /></SelectTrigger>
                  <SelectContent>{receitas.map((r: any) => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Margem de Lucro (%)</Label><Input type="number" value={form.margem_lucro} onChange={e => handleMargemChange(e.target.value)} /></div>
                <div><Label>Preço de Venda (R$)</Label><Input type="number" step="0.01" value={form.preco_venda} onChange={e => setForm({ ...form, preco_venda: e.target.value })} /></div>
              </div>
              {form.receita_id && (
                <div className="p-3 rounded-lg bg-muted/50 text-sm">
                  <p>Custo unitário: <strong>{fmt(calcPrecoSugerido(form.receita_id, 0))}</strong></p>
                  <p>Preço sugerido ({form.margem_lucro}%): <strong className="text-income">{fmt(calcPrecoSugerido(form.receita_id, Number(form.margem_lucro)))}</strong></p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Switch checked={form.ativo} onCheckedChange={v => setForm({ ...form, ativo: v })} />
                <Label>Produto ativo</Label>
              </div>
              <Button className="w-full" onClick={handleSubmit}>{editing ? 'Salvar' : 'Adicionar Produto'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {produtos.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>Nenhum produto cadastrado</p></CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtos.map((p: any) => {
            const receita = receitas.find((r: any) => r.id === p.receita_id);
            const margemReal = p.custo_total > 0 ? ((p.preco_venda - p.custo_total) / p.custo_total * 100) : 0;
            return (
              <Card key={p.id} className={!p.ativo ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-sm">{p.nome}</h3>
                      {receita && <p className="text-xs text-muted-foreground">Receita: {receita.nome}</p>}
                      {!p.ativo && <span className="text-xs text-destructive">Inativo</span>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(p)}><Pencil className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteProduto(p.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Custo</span><span>{fmt(p.custo_total)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Preço</span><span className="font-bold text-income">{fmt(p.preco_venda)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-muted-foreground">Margem</span><span className={margemReal >= 0 ? 'text-income' : 'text-expense'}>{margemReal.toFixed(1)}%</span></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
