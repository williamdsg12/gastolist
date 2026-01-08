import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Plus, Trash2, Tag, Palette, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

const CORES_DISPONIVEIS = [
  { nome: 'Cinza', valor: '#6b7280' },
  { nome: 'Vermelho', valor: '#ef4444' },
  { nome: 'Laranja', valor: '#f97316' },
  { nome: 'Amarelo', valor: '#eab308' },
  { nome: 'Verde', valor: '#22c55e' },
  { nome: 'Azul', valor: '#3b82f6' },
  { nome: 'Roxo', valor: '#8b5cf6' },
  { nome: 'Rosa', valor: '#ec4899' },
];

export function GerenciarCategorias() {
  const { 
    categoriasPersonalizadas, 
    addCategoriaPersonalizada, 
    deleteCategoriaPersonalizada 
  } = useFinance();
  
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    tipo: 'gasto' as 'entrada' | 'gasto',
    cor: '#6b7280',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      toast.error('Digite um nome para a categoria');
      return;
    }

    // Check if category already exists
    const existe = categoriasPersonalizadas.some(
      c => c.nome.toLowerCase() === form.nome.toLowerCase() && c.tipo === form.tipo
    );

    if (existe) {
      toast.error('Esta categoria já existe');
      return;
    }

    addCategoriaPersonalizada({
      nome: form.nome.trim(),
      tipo: form.tipo,
      cor: form.cor,
    });

    toast.success('Categoria criada com sucesso!');
    setForm({ nome: '', tipo: 'gasto', cor: '#6b7280' });
    setOpen(false);
  };

  const categoriasEntrada = categoriasPersonalizadas.filter(c => c.tipo === 'entrada');
  const categoriasGasto = categoriasPersonalizadas.filter(c => c.tipo === 'gasto');

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria Personalizada
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Criar Categoria
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Categoria</Label>
              <Input
                id="nome"
                placeholder="Ex: Streaming, Academia..."
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as 'entrada' | 'gasto' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasto">💸 Gasto</SelectItem>
                  <SelectItem value="entrada">💰 Entrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {CORES_DISPONIVEIS.map((cor) => (
                  <button
                    key={cor.valor}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      form.cor === cor.valor ? 'border-primary scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: cor.valor }}
                    onClick={() => setForm({ ...form, cor: cor.valor })}
                    title={cor.nome}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                Criar Categoria
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Categorias de Gasto */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="text-expense">💸</span>
            Categorias de Gasto
          </h3>
          {categoriasGasto.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma categoria personalizada</p>
          ) : (
            <div className="space-y-2">
              {categoriasGasto.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: cat.cor }}
                    />
                    <span className="text-sm">{cat.nome}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      deleteCategoriaPersonalizada(cat.id);
                      toast.success('Categoria removida');
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorias de Entrada */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="text-income">💰</span>
            Categorias de Entrada
          </h3>
          {categoriasEntrada.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma categoria personalizada</p>
          ) : (
            <div className="space-y-2">
              {categoriasEntrada.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: cat.cor }}
                    />
                    <span className="text-sm">{cat.nome}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      deleteCategoriaPersonalizada(cat.id);
                      toast.success('Categoria removida');
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}