import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Truck, Pencil, Trash2, Search } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function FornecedoresModule({ data }: { data: any }) {
  const { fornecedores, notasFiscais, addFornecedor, updateFornecedor, deleteFornecedor } = data;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ nome: '', cnpj: '', telefone: '', email: '', endereco: '' });

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const filtered = fornecedores.filter((f: any) => f.nome.toLowerCase().includes(search.toLowerCase()));

  const handleSubmit = () => {
    if (!form.nome) return;
    if (editing) { updateFornecedor(editing.id, form); }
    else { addFornecedor(form); }
    setForm({ nome: '', cnpj: '', telefone: '', email: '', endereco: '' });
    setEditing(null);
    setOpen(false);
  };

  const handleEdit = (f: any) => {
    setEditing(f);
    setForm({ nome: f.nome, cnpj: f.cnpj || '', telefone: f.telefone || '', email: f.email || '', endereco: f.endereco || '' });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar fornecedor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm({ nome: '', cnpj: '', telefone: '', email: '', endereco: '' }); } }}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Novo Fornecedor</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nome</Label><Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></div>
              <div><Label>CNPJ</Label><Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} /></div>
                <div><Label>Email</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} /></div>
              <Button className="w-full" onClick={handleSubmit}>{editing ? 'Salvar' : 'Adicionar'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground"><Truck className="w-12 h-12 mx-auto mb-3 opacity-40" /><p>Nenhum fornecedor cadastrado</p></CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((f: any) => {
            const nfs = notasFiscais.filter((n: any) => n.fornecedor_id === f.id);
            const totalCompras = nfs.reduce((s: number, n: any) => s + n.valor_total, 0);
            return (
              <Card key={f.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-sm">{f.nome}</h3>
                      {f.cnpj && <p className="text-xs text-muted-foreground">CNPJ: {f.cnpj}</p>}
                      {f.telefone && <p className="text-xs text-muted-foreground">{f.telefone}</p>}
                      {f.email && <p className="text-xs text-muted-foreground">{f.email}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(f)}><Pencil className="w-3 h-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteFornecedor(f.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-border flex gap-4 text-xs text-muted-foreground">
                    <span>{nfs.length} compra(s)</span>
                    <span>Total: {fmt(totalCompras)}</span>
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
