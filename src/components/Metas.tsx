import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MonthFilter } from '@/components/MonthFilter';
import { Plus, Trash2, Target, TrendingUp, TrendingDown, PiggyBank, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function Metas() {
  const { getMetasFiltradas, addMeta, deleteMeta, getProgressoMeta, getCategoriasGasto } = useFinance();
  const categoriasGasto = getCategoriasGasto();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    valorMeta: '',
    tipo: 'economia' as 'economia' | 'limite_gasto' | 'entrada',
    categoria: '',
    responsavel: 'Todos' as 'William' | 'Andressa' | 'Todos',
  });

  const metasFiltradas = getMetasFiltradas();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.valorMeta) return;

    addMeta({
      nome: form.nome,
      valorMeta: parseFloat(form.valorMeta),
      tipo: form.tipo,
      categoria: form.categoria || undefined,
      responsavel: form.responsavel,
    });

    setForm({
      nome: '',
      valorMeta: '',
      tipo: 'economia',
      categoria: '',
      responsavel: 'Todos',
    });
    setOpen(false);
  };

  const getMetaIcon = (tipo: string) => {
    switch (tipo) {
      case 'economia': return <PiggyBank className="w-5 h-5" />;
      case 'limite_gasto': return <TrendingDown className="w-5 h-5" />;
      case 'entrada': return <TrendingUp className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getMetaColor = (tipo: string, percentual: number) => {
    if (tipo === 'limite_gasto') {
      if (percentual >= 100) return 'text-expense';
      if (percentual >= 80) return 'text-warning';
      return 'text-income';
    }
    if (percentual >= 100) return 'text-income';
    if (percentual >= 50) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getProgressColor = (tipo: string, percentual: number) => {
    if (tipo === 'limite_gasto') {
      if (percentual >= 100) return 'bg-expense';
      if (percentual >= 80) return 'bg-warning';
      return 'bg-income';
    }
    if (percentual >= 100) return 'bg-income';
    if (percentual >= 50) return 'bg-warning';
    return 'bg-muted-foreground';
  };

  return (
    <div className="space-y-4 pb-4">
      <MonthFilter />

      {/* Header Card */}
      <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-card animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Metas do Mês</p>
              <p className="text-2xl font-bold">{metasFiltradas.length} metas</p>
              <p className="text-sm opacity-80">
                {metasFiltradas.filter(m => getProgressoMeta(m).percentual >= 100).length} concluídas
              </p>
            </div>
            <Target className="w-10 h-10 opacity-80" />
          </div>
        </CardContent>
      </Card>

      {/* Add Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 shadow-card">
            <Plus className="w-5 h-5 mr-2" />
            Nova Meta
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Criar Meta
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Meta</Label>
              <Input
                id="nome"
                placeholder="Ex: Economizar para viagem"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorMeta">Valor (R$)</Label>
              <Input
                id="valorMeta"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={form.valorMeta}
                onChange={(e) => setForm({ ...form, valorMeta: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo de Meta</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as 'economia' | 'limite_gasto' | 'entrada' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economia">💰 Economia (guardar dinheiro)</SelectItem>
                  <SelectItem value="limite_gasto">🎯 Limite de Gasto</SelectItem>
                  <SelectItem value="entrada">📈 Meta de Entrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.tipo === 'limite_gasto' && (
              <div className="space-y-2">
                <Label>Categoria (opcional)</Label>
                <Select value={form.categoria} onValueChange={(v) => setForm({ ...form, categoria: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as categorias</SelectItem>
                    {categoriasGasto.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select value={form.responsavel} onValueChange={(v) => setForm({ ...form, responsavel: v as 'William' | 'Andressa' | 'Todos' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">👨‍👩‍👧 Todos</SelectItem>
                  <SelectItem value="William">William</SelectItem>
                  <SelectItem value="Andressa">Andressa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Criar Meta
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Goals List */}
      <div className="space-y-3">
        {metasFiltradas.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-6 text-center text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Nenhuma meta definida</p>
              <p className="text-sm">Crie metas para acompanhar seu progresso!</p>
            </CardContent>
          </Card>
        ) : (
          metasFiltradas.map((meta, index) => {
            const progresso = getProgressoMeta(meta);
            const isLimite = meta.tipo === 'limite_gasto';
            const isComplete = isLimite ? progresso.percentual < 100 : progresso.percentual >= 100;
            const isWarning = isLimite ? progresso.percentual >= 80 : progresso.percentual < 50;

            return (
              <Card 
                key={meta.id} 
                className="shadow-card animate-fade-in hover:shadow-card-hover transition-shadow"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        meta.tipo === 'economia' ? 'bg-income-muted text-income' :
                        meta.tipo === 'limite_gasto' ? 'bg-expense-muted text-expense' :
                        'bg-bills-muted text-bills'
                      }`}>
                        {getMetaIcon(meta.tipo)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{meta.nome}</span>
                          {isComplete && !isLimite && (
                            <CheckCircle2 className="w-4 h-4 text-income" />
                          )}
                          {isLimite && progresso.percentual >= 100 && (
                            <AlertTriangle className="w-4 h-4 text-expense" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{meta.responsavel}</span>
                          {meta.categoria && (
                            <>
                              <span>•</span>
                              <span>{meta.categoria}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMeta(meta.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={getMetaColor(meta.tipo, progresso.percentual)}>
                        {formatCurrency(progresso.atual)}
                      </span>
                      <span className="text-muted-foreground">
                        {isLimite ? 'Limite:' : 'Meta:'} {formatCurrency(meta.valorMeta)}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 rounded-full ${getProgressColor(meta.tipo, progresso.percentual)}`}
                        style={{ width: `${Math.min(progresso.percentual, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progresso.percentual.toFixed(1)}%</span>
                      <span>
                        {isLimite 
                          ? progresso.percentual >= 100 
                            ? `Excedeu ${formatCurrency(progresso.atual - meta.valorMeta)}`
                            : `Resta ${formatCurrency(meta.valorMeta - progresso.atual)}`
                          : progresso.percentual >= 100
                            ? 'Meta atingida! 🎉'
                            : `Falta ${formatCurrency(meta.valorMeta - progresso.atual)}`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}