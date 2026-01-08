import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { MonthFilter } from '@/components/MonthFilter';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function Dashboard() {
  const { getResumoMensal, getGastosFiltrados, getEntradasFiltradas, entradas, gastos, mesSelecionado, anoSelecionado } = useFinance();
  const resumo = getResumoMensal();
  const gastosFiltrados = getGastosFiltrados();

  // Dados para gráfico de pizza por categoria
  const gastosPorCategoria = gastosFiltrados.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.valor;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(gastosPorCategoria).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'];

  // Dados para comparativo William x Andressa
  const getMesAnoKey = () => `${mesSelecionado}-${anoSelecionado}`;
  const entradasDoMes = entradas.filter(e => e.mes === getMesAnoKey());
  const gastosDoMes = gastos.filter(g => g.mes === getMesAnoKey());

  const comparativoData = [
    {
      name: 'William',
      entradas: entradasDoMes.filter(e => e.responsavel === 'William').reduce((s, e) => s + e.valor, 0),
      gastos: gastosDoMes.filter(g => g.responsavel === 'William').reduce((s, g) => s + g.valor, 0),
    },
    {
      name: 'Andressa',
      entradas: entradasDoMes.filter(e => e.responsavel === 'Andressa').reduce((s, e) => s + e.valor, 0),
      gastos: gastosDoMes.filter(g => g.responsavel === 'Andressa').reduce((s, g) => s + g.valor, 0),
    },
  ];

  return (
    <div className="space-y-4 pb-4">
      <MonthFilter />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-income-muted">
                <TrendingUp className="w-4 h-4 text-income" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Entradas</span>
            </div>
            <p className="text-lg font-bold text-income">{formatCurrency(resumo.totalEntradas)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-expense-muted">
                <TrendingDown className="w-4 h-4 text-expense" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Gastos</span>
            </div>
            <p className="text-lg font-bold text-expense">{formatCurrency(resumo.totalGastos)}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-secondary">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Saldo</span>
            </div>
            <p className={`text-lg font-bold ${resumo.saldo >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatCurrency(resumo.saldo)}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-bills-muted">
                <AlertCircle className="w-4 h-4 text-bills" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">Pendentes</span>
            </div>
            <p className="text-lg font-bold text-bills">{resumo.contasPendentes} contas</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(resumo.valorPendente)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Distribution Chart */}
      {pieData.length > 0 && (
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
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

      {/* Comparative Chart */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.35s' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 text-sm">Comparativo: William x Andressa</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativoData} barGap={8}>
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="entradas" fill="hsl(152, 69%, 40%)" radius={[4, 4, 0, 0]} name="Entradas" />
                <Bar dataKey="gastos" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Uso do Orçamento</span>
            <span className="text-sm text-muted-foreground">{resumo.percentualGastos.toFixed(1)}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500 rounded-full"
              style={{ 
                width: `${Math.min(resumo.percentualGastos, 100)}%`,
                background: resumo.percentualGastos > 100 
                  ? 'hsl(0, 72%, 51%)' 
                  : resumo.percentualGastos > 80 
                    ? 'hsl(38, 92%, 50%)' 
                    : 'hsl(152, 69%, 40%)'
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {resumo.percentualGastos > 100 
              ? 'Você gastou mais do que ganhou!' 
              : resumo.percentualGastos > 80 
                ? 'Atenção: quase no limite' 
                : 'Seu orçamento está saudável'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
