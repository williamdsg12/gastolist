import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Calculator, Pencil } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function PrecificacaoModule({ data }: { data: any }) {
  const { receitas, ingredientes, estoque, addReceita, updateReceita, deleteReceita, addIngrediente, deleteIngrediente } = data;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ nome: '', descricao: '', rendimento: '1', unidade_rendimento: 'unidade', tempo_preparo: '' });
  const [addIngOpen, setAddIngOpen] = useState<string | null>(null);
  const [ingForm, setIngForm] = useState({ estoque_id: '', quantidade: '', unidade: 'g' });

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getCustoReceita = (receitaId: string) => {
    const ings = ingredientes.filter((i: any) => i.receita_id === receitaId);
    return ings.reduce((total: number, ing: any) => {
      const item = estoque.find((e: any) => e.id === ing.estoque_id);
      if (!item) return total;
      // Simple cost calculation - assume same unit for now
      return total + (ing.quantidade * item.custo_medio);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!form.nome) return;
    const payload = { nome: form.nome, descricao: form.descricao, rendimento: Number(form.rendimento), unidade_rendimento: form.unidade_rendimento, tempo_preparo: form.tempo_preparo };
    if (editing) { await updateReceita(editing.id, payload); }
    else { await addReceita(payload); }
    setForm({ nome: '', descricao: '', rendimento: '1', unidade_rendimento: 'unidade', tempo_preparo: '' });
    setEditing(null);
    setOpen(false);
  };

  const handleAddIngrediente = async () => {
    if (!ingForm.estoque_id || !ingForm.quantidade || !addIngOpen) return;
    await addIngrediente({ receita_id: addIngOpen, estoque_id: ingForm.estoque_id, quantidade: Number(ingForm.quantidade), unidade: ingForm.unidade });
    setIngForm({ estoque_id: '', quantidade: '', unidade: 'g' });
    setAddIngOpen(null);
  };

  const handleEdit = (r: any) => {
    setEditing(r);
    setForm({ nome: r.nome, descricao: r.descricao || '', rendimento: String(r.rendimento), unidade_rendimento: r.unidade_rendimento, tempo_preparo: r.tempo_preparo || '' });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Crie receitas e calcule o custo de produção</p>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm({ nome: '', descricao: '', rendimento: '1', unidade_rendimento: 'unidade', tempo_preparo: '' }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Nova Receita</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar Receita' : 'Nova Receita'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Bolo de Pote" /></div>
              <div><Label>Descrição</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Rendimento</Label><Input type="number" value={form.rendimento} onChange={e => setForm({ ...form, rendimento: e.target.value })} /></div>
                <div><Label>Unidade</Label><Input value={form.unidade_rendimento} onChange={e => setForm({ ...form, unidade_rendimento: e.target.value })} placeholder="unidade, fatia..." /></div>
              </div>
              <div><Label>Tempo de Preparo</Label><Input value={form.tempo_preparo} onChange={e => setForm({ ...form, tempo_preparo: e.target.value })} placeholder="Ex: 1h30min" /></div>
              <Button className="w-full" onClick={handleSubmit}>{editing ? 'Salvar' : 'Criar Receita'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {receitas.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><Calculator className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>Nenhuma receita cadastrada</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {receitas.map((r: any) => {
            const ings = ingredientes.filter((i: any) => i.receita_id === r.id);
            const custoTotal = getCustoReceita(r.id);
            const custoPorUnidade = r.rendimento > 0 ? custoTotal / r.rendimento : 0;

            return (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{r.nome}</CardTitle>
                      {r.descricao && <p className="text-xs text-muted-foreground mt-1">{r.descricao}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteReceita(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Custo Total</p>
                      <p className="font-bold text-sm text-expense">{fmt(custoTotal)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Custo/Unidade</p>
                      <p className="font-bold text-sm">{fmt(custoPorUnidade)}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground">Rendimento</p>
                      <p className="font-bold text-sm">{r.rendimento} {r.unidade_rendimento}</p>
                    </div>
                  </div>

                  {/* Ingredientes */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-medium text-muted-foreground uppercase">Ingredientes</h4>
                      <Dialog open={addIngOpen === r.id} onOpenChange={v => setAddIngOpen(v ? r.id : null)}>
                        <DialogTrigger asChild><Button variant="outline" size="sm" className="h-7 text-xs"><Plus className="w-3 h-3 mr-1" />Adicionar</Button></DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Adicionar Ingrediente</DialogTitle></DialogHeader>
                          <div className="space-y-3">
                            <div>
                              <Label>Ingrediente (do estoque)</Label>
                              <Select value={ingForm.estoque_id} onValueChange={v => setIngForm({ ...ingForm, estoque_id: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                                <SelectContent>{estoque.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.nome} ({fmt(e.custo_medio)}/{e.unidade})</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div><Label>Quantidade</Label><Input type="number" step="0.01" value={ingForm.quantidade} onChange={e => setIngForm({ ...ingForm, quantidade: e.target.value })} /></div>
                              <div><Label>Unidade</Label><Input value={ingForm.unidade} onChange={e => setIngForm({ ...ingForm, unidade: e.target.value })} /></div>
                            </div>
                            <Button className="w-full" onClick={handleAddIngrediente}>Adicionar</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    {ings.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Nenhum ingrediente adicionado</p>
                    ) : (
                      <div className="space-y-1">
                        {ings.map((ing: any) => {
                          const item = estoque.find((e: any) => e.id === ing.estoque_id);
                          const custoIng = item ? ing.quantidade * item.custo_medio : 0;
                          return (
                            <div key={ing.id} className="flex items-center justify-between text-sm py-1 px-2 rounded hover:bg-muted/30">
                              <span>{item?.nome || 'Item removido'} - {ing.quantidade} {ing.unidade}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">{fmt(custoIng)}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteIngrediente(ing.id)}><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
