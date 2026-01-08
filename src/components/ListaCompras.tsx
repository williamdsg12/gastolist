import { useState, useMemo } from 'react';
import { useShoppingData } from '@/hooks/useShoppingData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Search, ShoppingCart, Trash2, Edit2, Copy, Package,
  Apple, Carrot, Beef, Milk, Croissant, Package2, Wine, Sparkles, Heart
} from 'lucide-react';
import { CATEGORIAS_COMPRAS, UNIDADES, ItemCompra } from '@/types/shopping';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const getCategoriaIcon = (categoria: string) => {
  switch (categoria.toLowerCase()) {
    case 'frutas': return Apple;
    case 'verduras': return Carrot;
    case 'carnes': return Beef;
    case 'laticínios': return Milk;
    case 'padaria': return Croissant;
    case 'bebidas': return Wine;
    case 'limpeza': return Sparkles;
    case 'higiene': return Heart;
    default: return Package2;
  }
};

const CORES_CATEGORIAS: Record<string, string> = {
  'Frutas': '#22c55e',
  'Verduras': '#84cc16',
  'Carnes': '#ef4444',
  'Laticínios': '#3b82f6',
  'Padaria': '#f59e0b',
  'Mercearia': '#8b5cf6',
  'Bebidas': '#06b6d4',
  'Limpeza': '#14b8a6',
  'Higiene': '#ec4899',
  'Outros': '#6b7280',
};

export function ListaCompras() {
  const { items, addItem, updateItem, deleteItem, toggleComprado, duplicateLastMonth, clearComprados, isLoading } = useShoppingData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todos');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemCompra | null>(null);

  // Form state
  const [formProduto, setFormProduto] = useState('');
  const [formQuantidade, setFormQuantidade] = useState('1');
  const [formUnidade, setFormUnidade] = useState('un');
  const [formPreco, setFormPreco] = useState('');
  const [formCategoria, setFormCategoria] = useState('Mercearia');
  const [formLoja, setFormLoja] = useState('');
  const [formObservacao, setFormObservacao] = useState('');

  const resetForm = () => {
    setFormProduto('');
    setFormQuantidade('1');
    setFormUnidade('un');
    setFormPreco('');
    setFormCategoria('Mercearia');
    setFormLoja('');
    setFormObservacao('');
    setEditingItem(null);
  };

  const handleOpenAddDialog = () => {
    resetForm();
    setAddDialogOpen(true);
  };

  const handleEditItem = (item: ItemCompra) => {
    setFormProduto(item.produto);
    setFormQuantidade(item.quantidade.toString());
    setFormUnidade(item.unidade);
    setFormPreco(item.preco.toString());
    setFormCategoria(item.categoria);
    setFormLoja(item.loja || '');
    setFormObservacao(item.observacao || '');
    setEditingItem(item);
    setAddDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formProduto.trim()) {
      toast.error('Digite o nome do produto');
      return;
    }

    const itemData = {
      produto: formProduto.trim(),
      quantidade: parseFloat(formQuantidade) || 1,
      unidade: formUnidade,
      preco: parseFloat(formPreco) || 0,
      categoria: formCategoria,
      comprado: editingItem?.comprado || false,
      loja: formLoja.trim() || undefined,
      observacao: formObservacao.trim() || undefined,
    };

    if (editingItem) {
      await updateItem(editingItem.id, itemData);
    } else {
      await addItem(itemData);
    }

    resetForm();
    setAddDialogOpen(false);
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.produto.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria = filterCategoria === 'todos' || item.categoria === filterCategoria;
      return matchSearch && matchCategoria;
    });
  }, [items, searchTerm, filterCategoria]);

  // Group by category
  const itemsByCategoria = useMemo(() => {
    const groups: Record<string, ItemCompra[]> = {};
    filteredItems.forEach(item => {
      if (!groups[item.categoria]) {
        groups[item.categoria] = [];
      }
      groups[item.categoria].push(item);
    });
    return groups;
  }, [filteredItems]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const comprados = items.filter(i => i.comprado).length;
    const valorTotal = items.reduce((sum, i) => sum + (i.preco * i.quantidade), 0);
    const valorComprado = items.filter(i => i.comprado).reduce((sum, i) => sum + (i.preco * i.quantidade), 0);
    
    const porCategoria = CATEGORIAS_COMPRAS.map(cat => ({
      name: cat,
      value: items.filter(i => i.categoria === cat).reduce((sum, i) => sum + (i.preco * i.quantidade), 0),
      color: CORES_CATEGORIAS[cat] || '#6b7280',
    })).filter(c => c.value > 0);

    return { total, comprados, valorTotal, valorComprado, porCategoria };
  }, [items]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Package className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Search and Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategoria} onValueChange={setFilterCategoria}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {CATEGORIAS_COMPRAS.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats Card */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-income-muted">
                <ShoppingCart className="w-6 h-6 text-income" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carrinho</p>
                <p className="text-xl font-bold">{stats.comprados}/{stats.total} itens</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Estimado</p>
              <p className="text-xl font-bold text-income">{formatCurrency(stats.valorTotal)}</p>
              <p className="text-xs text-muted-foreground">
                Comprado: {formatCurrency(stats.valorComprado)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {stats.porCategoria.length > 0 && (
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.porCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.porCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {stats.porCategoria.slice(0, 5).map((cat) => (
                <Badge key={cat.name} variant="secondary" className="text-xs" style={{ borderColor: cat.color }}>
                  <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={duplicateLastMonth} className="flex-1">
          <Copy className="w-4 h-4 mr-1" />
          Copiar mês anterior
        </Button>
        <Button variant="outline" size="sm" onClick={clearComprados} className="text-expense border-expense/30">
          <Trash2 className="w-4 h-4 mr-1" />
          Limpar comprados
        </Button>
      </div>

      {/* Items by Category */}
      <div className="space-y-4">
        {Object.entries(itemsByCategoria).map(([categoria, categoryItems]) => {
          const Icon = getCategoriaIcon(categoria);
          const cor = CORES_CATEGORIAS[categoria] || '#6b7280';
          
          return (
            <Card key={categoria} className="shadow-card animate-fade-in overflow-hidden">
              <CardHeader className="py-3 px-4" style={{ backgroundColor: `${cor}10` }}>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4" style={{ color: cor }} />
                  {categoria}
                  <Badge variant="secondary" className="ml-auto">{categoryItems.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {categoryItems.map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-3 p-3 transition-colors ${item.comprado ? 'bg-muted/50' : ''}`}
                    >
                      <Checkbox
                        checked={item.comprado}
                        onCheckedChange={() => toggleComprado(item.id)}
                        className="data-[state=checked]:bg-income data-[state=checked]:border-income"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${item.comprado ? 'line-through text-muted-foreground' : ''}`}>
                          {item.produto}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantidade} {item.unidade}
                          {item.preco > 0 && ` • ${formatCurrency(item.preco)}`}
                          {item.loja && ` • ${item.loja}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {item.preco > 0 && (
                          <span className="text-sm font-medium text-income">
                            {formatCurrency(item.preco * item.quantidade)}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-expense"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center text-muted-foreground">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum item na lista</p>
            <p className="text-sm">Adicione produtos usando o botão +</p>
          </CardContent>
        </Card>
      )}

      {/* Floating Add Button */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg z-40"
            style={{ background: 'linear-gradient(135deg, hsl(152 69% 40%), hsl(152 60% 45%))' }}
            onClick={handleOpenAddDialog}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Input
                placeholder="Nome do produto"
                value={formProduto}
                onChange={(e) => setFormProduto(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formQuantidade}
                  onChange={(e) => setFormQuantidade(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Unidade</Label>
                <Select value={formUnidade} onValueChange={setFormUnidade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES.map(un => (
                      <SelectItem key={un} value={un}>{un}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Preço (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formPreco}
                  onChange={(e) => setFormPreco(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={formCategoria} onValueChange={setFormCategoria}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS_COMPRAS.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Loja (opcional)</Label>
              <Input
                placeholder="Ex: Supermercado X"
                value={formLoja}
                onChange={(e) => setFormLoja(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Observação (opcional)</Label>
              <Input
                placeholder="Ex: Preferência de marca"
                value={formObservacao}
                onChange={(e) => setFormObservacao(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={handleSubmit}>
              {editingItem ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
