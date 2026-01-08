import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Minus, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { MESES } from '@/types/finance';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatCurrencyShort = (value: number) => {
  if (value >= 1000) {
    return `R$${(value / 1000).toFixed(1)}k`;
  }
  return `R$${value}`;
};

// Get week number of month
const getWeekOfMonth = (date: Date): number => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + firstDay) / 7);
};

export function ResumoSemanal() {
  const { gastos, entradas, mesSelecionado, anoSelecionado, setMesSelecionado } = useFinance();
  
  const mesKey = `${mesSelecionado}-${anoSelecionado}`;
  
  // Get all expenses and incomes for the month
  const gastosDoMes = gastos.filter(g => g.mes === mesKey);
  const entradasDoMes = entradas.filter(e => e.mes === mesKey);

  // Group by week
  const semanas: { semana: number; gastos: number; entradas: number; saldo: number }[] = [];
  
  for (let semana = 1; semana <= 5; semana++) {
    const gastosSemanais = gastosDoMes.filter(g => {
      const dataGasto = new Date(g.data);
      return getWeekOfMonth(dataGasto) === semana;
    });
    
    const entradasSemanais = entradasDoMes.filter(e => {
      const dataEntrada = new Date(e.data);
      return getWeekOfMonth(dataEntrada) === semana;
    });

    const totalGastos = gastosSemanais.reduce((s, g) => s + g.valor, 0);
    const totalEntradas = entradasSemanais.reduce((s, e) => s + e.valor, 0);

    if (totalGastos > 0 || totalEntradas > 0) {
      semanas.push({
        semana,
        gastos: totalGastos,
        entradas: totalEntradas,
        saldo: totalEntradas - totalGastos,
      });
    }
  }

  // Calculate week-over-week changes
  const comparativoSemanal = semanas.map((sem, index) => {
    if (index === 0) {
      return { ...sem, variacao: 0, tipo: 'neutro' as const };
    }
    const anterior = semanas[index - 1];
    const variacao = sem.gastos - anterior.gastos;
    const tipo = variacao > 0 ? 'aumento' as const : variacao < 0 ? 'reducao' as const : 'neutro' as const;
    return { ...sem, variacao, tipo };
  });

  // Generate insights
  const gerarInsights = () => {
    const insights: string[] = [];
    
    if (semanas.length >= 2) {
      const ultimaSemana = semanas[semanas.length - 1];
      const penultimaSemana = semanas[semanas.length - 2];
      
      if (ultimaSemana.gastos > penultimaSemana.gastos * 1.2) {
        insights.push(`⚠️ Seus gastos aumentaram ${((ultimaSemana.gastos / penultimaSemana.gastos - 1) * 100).toFixed(0)}% na última semana.`);
      } else if (ultimaSemana.gastos < penultimaSemana.gastos * 0.8) {
        insights.push(`🎉 Ótimo! Você reduziu ${((1 - ultimaSemana.gastos / penultimaSemana.gastos) * 100).toFixed(0)}% nos gastos esta semana!`);
      }
    }

    // Find the week with highest spending
    if (semanas.length > 0) {
      const semanaMax = semanas.reduce((max, s) => s.gastos > max.gastos ? s : max);
      insights.push(`📊 Semana ${semanaMax.semana} foi a de maior gasto: ${formatCurrency(semanaMax.gastos)}`);
    }

    // Calculate average weekly spending
    const mediaGastos = semanas.length > 0 
      ? semanas.reduce((s, sem) => s + sem.gastos, 0) / semanas.length 
      : 0;
    if (mediaGastos > 0) {
      insights.push(`📈 Média semanal de gastos: ${formatCurrency(mediaGastos)}`);
    }

    // Check spending pattern by category per week
    const categoriasPorSemana: Record<string, number[]> = {};
    gastosDoMes.forEach(g => {
      const semana = getWeekOfMonth(new Date(g.data));
      if (!categoriasPorSemana[g.categoria]) {
        categoriasPorSemana[g.categoria] = [];
      }
      categoriasPorSemana[g.categoria][semana - 1] = (categoriasPorSemana[g.categoria][semana - 1] || 0) + g.valor;
    });

    // Find recurring categories
    const categoriasRecorrentes = Object.entries(categoriasPorSemana)
      .filter(([_, valores]) => valores.filter(v => v > 0).length >= 3)
      .map(([cat]) => cat);
    
    if (categoriasRecorrentes.length > 0) {
      insights.push(`🔄 Gastos recorrentes em: ${categoriasRecorrentes.join(', ')}`);
    }

    return insights;
  };

  const insights = gerarInsights();

  // Chart data with proper labels
  const chartData = comparativoSemanal.map(s => ({
    name: `Sem ${s.semana}`,
    gastos: s.gastos,
    entradas: s.entradas,
    saldo: s.saldo,
  }));

  return (
    <div className="space-y-4 pb-4">
      {/* Month Selector */}
      <Card className="shadow-card animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {MESES.map((mes) => (
                  <SelectItem key={mes} value={mes}>{mes}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary Cards */}
      <div className="grid grid-cols-2 gap-2">
        {comparativoSemanal.map((sem, index) => (
          <Card 
            key={sem.semana} 
            className="shadow-card animate-fade-in"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">Semana {sem.semana}</span>
                {sem.tipo === 'aumento' && (
                  <div className="flex items-center text-expense text-xs">
                    <ArrowUp className="w-3 h-3" />
                    {Math.abs(sem.variacao).toFixed(0)}%
                  </div>
                )}
                {sem.tipo === 'reducao' && (
                  <div className="flex items-center text-income text-xs">
                    <ArrowDown className="w-3 h-3" />
                    {Math.abs(sem.variacao).toFixed(0)}%
                  </div>
                )}
                {sem.tipo === 'neutro' && index > 0 && (
                  <Minus className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Gastos</span>
                  <span className="font-medium text-expense">{formatCurrency(sem.gastos)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Entradas</span>
                  <span className="font-medium text-income">{formatCurrency(sem.entradas)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {semanas.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-6 text-center text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhum dado para este mês</p>
          </CardContent>
        </Card>
      )}

      {/* Weekly Chart */}
      {chartData.length > 0 && (
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-4">Evolução Semanal</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="entradas" fill="hsl(152, 69%, 40%)" radius={[2, 2, 0, 0]} name="Entradas" />
                  <Bar dataKey="gastos" fill="hsl(0, 72%, 51%)" radius={[2, 2, 0, 0]} name="Gastos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saldo Chart */}
      {chartData.length > 0 && (
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-4">Saldo Semanal</h3>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={formatCurrencyShort} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line 
                    type="monotone" 
                    dataKey="saldo" 
                    stroke="hsl(199, 89%, 48%)" 
                    strokeWidth={2} 
                    dot={{ r: 4, fill: 'hsl(199, 89%, 48%)' }}
                    name="Saldo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <Card className="shadow-card animate-fade-in border-primary/20 bg-primary/5" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              Insights da Semana
            </h3>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <p key={index} className="text-sm text-muted-foreground">
                  {insight}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}