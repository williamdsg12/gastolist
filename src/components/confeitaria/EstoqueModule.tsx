import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Package, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';

const UNIDADES = ['kg', 'g', 'litro', 'ml', 'unidade', 'pacote', 'caixa', 'dúzia'];
const CATEGORIAS = ['Geral', 'Farinhas', 'Açúcares', 'Laticínios', 'Frutas', 'Chocolates', 'Embalagens', 'Outros'];

export function EstoqueModule({ data }: { data: any }) {
  const { estoque, addEstoqueItem, updateEstoqueItem, deleteEstoqueItem } = data;
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ nome: '', quantidade: '', unidade: 'kg', custo_medio: '', estoque_minimo: '', categoria: 'Geral' });

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const filtered = estoque.filter((e: any) => e.nome.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = () => {
    const payload = {
      nome: form.nome, quantidade: Number(form.quantidade), unidade: form.unidade,
      custo_medio: Number(form.custo_medio), estoque_minimo: Number(form.estoque_minimo), categoria: form.categoria,
    };
    if (!payload.nome) return;
    if (editing) { updateEstoqueItem(editing.id, payload); }
    else { addEstoqueItem(payload); }
    setForm({ nome: '', quantidade: '', unidade: 'kg', custo_medio: '', estoque_minimo: '', categoria: 'Geral' });
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ nome: item.nome, quantidade: String(item.quantidade), unidade: item.unidade, custo_medio: String(item.custo_medio), estoque_minimo: String(item.estoque_minimo), categoria: item.categoria });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar no estoque..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ nome: '', quantidade: '', unidade: 'kg', custo_medio: '', estoque_minimo: '', categoria: 'Geral' }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Adicionar Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar Item' : 'Novo Item de Estoque'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Quantidade</Label><Input type="number" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} /></div>
                <div>
                  <Label>Unidade</Label>
                  <Select value={form.unidade} onValueChange={v => setForm({ ...form, unidade: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{UNIDADES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Custo Médio (R$)</Label><Input type="number" step="0.01" value={form.custo_medio} onChange={e => setForm({ ...form, custo_medio: e.target.value })} /></div>
                <div><Label>Estoque Mínimo</Label><Input type="number" value={form.estoque_minimo} onChange={e => setForm({ ...form, estoque_minimo: e.target.value })} /></div>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleSubmit}>{editing ? 'Salvar Alterações' : 'Adicionar'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><Package className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>Nenhum item no estoque</p></CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item: any) => {
            const baixo = item.quantidade <= item.estoque_minimo;
            return (
              <Card key={item.id} className={baixo ? 'border-warning/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm truncate">{item.nome}</h3>
                        {baixo && <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{item.categoria}</span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span>Qtd: <strong className={baixo ? 'text-warning' : 'text-foreground'}>{item.quantidade}</strong> {item.unidade}</span>
                        <span>Custo: <strong className="text-foreground">{fmt(item.custo_medio)}</strong>/{item.unidade}</span>
                        <span>Mín: {item.estoque_minimo} {item.unidade}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteEstoqueItem(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
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
