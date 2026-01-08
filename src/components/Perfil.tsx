import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthFilter } from '@/components/MonthFilter';
import { User, TrendingUp, TrendingDown, Wallet, ShoppingBag } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

export function Perfil() {
  const { getResumoPessoa, gastos, entradas, mesSelecionado, anoSelecionado } = useFinance();
  const [pessoa, setPessoa] = useState<'William' | 'Andressa'>('William');

  const resumo = getResumoPessoa(pessoa);
  const mesKey = `${mesSelecionado}-${anoSelecionado}`;

  // Pie chart data
  const pieData = resumo.categoriasMaisUsadas.map(cat => ({
    name: cat.categoria,
    value: cat.valor
  }));

  // Compare with other person
  const outraPessoa = pessoa === 'William' ? 'Andressa' : 'William';
  const resumoOutra = getResumoPessoa(outraPessoa);

  const comparativoData = [
    { name: 'Entradas', [pessoa]: resumo.totalEntradas, [outraPessoa]: resumoOutra.totalEntradas },
    { name: 'Gastos', [pessoa]: resumo.totalGastos, [outraPessoa]: resumoOutra.totalGastos },
  ];

  // Recent expenses
  const gastosRecentes = gastos
    .filter(g => g.mes === mesKey && g.responsavel === pessoa)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-4 pb-4">
      <MonthFilter />

      {/* Person Selector */}
      <div className="flex gap-2">
        <Button
          variant={pessoa === 'William' ? 'default' : 'outline'}
          className="flex-1 h-12"
          onClick={() => setPessoa('William')}
        >
          <User className="w-4 h-4 mr-2" />
          William
        </Button>
        <Button
          variant={pessoa === 'Andressa' ? 'default' : 'outline'}
          className="flex-1 h-12"
          onClick={() => setPessoa('Andressa')}
        >
          <User className="w-4 h-4 mr-2" />
          Andressa
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-income" />
            <p className="text-xs text-muted-foreground">Entradas</p>
            <p className="text-sm font-bold text-income">{formatCurrency(resumo.totalEntradas)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <CardContent className="p-3 text-center">
            <TrendingDown className="w-5 h-5 mx-auto mb-1 text-expense" />
            <p className="text-xs text-muted-foreground">Gastos</p>
            <p className="text-sm font-bold text-expense">{formatCurrency(resumo.totalGastos)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-3 text-center">
            <Wallet className="w-5 h-5 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className={`text-sm font-bold ${resumo.saldo >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(resumo.saldo)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Chart */}
      {pieData.length > 0 && (
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4 text-sm">Gastos por Categoria</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Categories */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Categorias Mais Usadas
          </h3>
          {resumo.categoriasMaisUsadas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum gasto registrado</p>
          ) : (
            <div className="space-y-3">
              {resumo.categoriasMaisUsadas.slice(0, 5).map((cat, index) => (
                <div key={cat.categoria} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{cat.categoria}</span>
                    <span className="text-xs text-muted-foreground">({cat.quantidade}x)</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(cat.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Chart */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.25s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 text-sm">Comparativo: {pessoa} x {outraPessoa}</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativoData} barGap={4}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey={pessoa} fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name={pessoa} />
                <Bar dataKey={outraPessoa} fill="hsl(220, 14%, 70%)" radius={[4, 4, 0, 0]} name={outraPessoa} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-sm">Últimos Gastos</h3>
          {gastosRecentes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum gasto recente</p>
          ) : (
            <div className="space-y-2">
              {gastosRecentes.map((gasto) => (
                <div key={gasto.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{gasto.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(gasto.data).toLocaleDateString('pt-BR')} • {gasto.categoria}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-expense">{formatCurrency(gasto.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}